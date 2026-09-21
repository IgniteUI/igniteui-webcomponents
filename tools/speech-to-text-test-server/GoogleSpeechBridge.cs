using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using Google.Cloud.Speech.V2;
using Google.Protobuf;
using Grpc.Core;
using Microsoft.Extensions.Options;

namespace SpeechToTextTestServer;

/// <summary>
/// Bridges one browser WebSocket connection, speaking the protocol documented in
/// src/extras/speech-to-text-websocket-protocol.md, to one Google Speech V2 streaming session.
/// </summary>
public sealed class GoogleSpeechBridge(IOptions<SpeechToTextServerOptions> options, ILogger<GoogleSpeechBridge> logger)
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly SpeechToTextServerOptions _options = options.Value;

    public async Task RunAsync(WebSocket socket, CancellationToken cancellationToken)
    {
        var buffer = new byte[64 * 1024];

        var start = await ReceiveStartAsync(socket, buffer, cancellationToken);
        if (start is null)
        {
            return;
        }

        logger.LogInformation(
            "Session started: lang={Lang} interim={Interim} mimeType={MimeType}",
            start.Lang,
            start.InterimResults,
            start.MimeType);

        SpeechClient client;

        try
        {
            client = await new SpeechClientBuilder().BuildAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Could not create the Google Speech client.");
            await SendAsync(socket, new ErrorMessage { Code = "network", Message = "Could not reach the speech service." }, cancellationToken);
            await SendAsync(socket, new EndMessage(), cancellationToken);
            return;
        }

        var call = client.StreamingRecognize().GrpcCall;
        await call.RequestStream.WriteAsync(BuildConfigRequest(start));

        // Runs concurrently with the audio loop below: Google streams interim/final results
        // for as long as audio keeps arriving.
        var forwardResults = ForwardResultsAsync(call.ResponseStream, socket, cancellationToken);
        var stopReceived = await ForwardAudioAsync(socket, buffer, call.RequestStream, cancellationToken);

        await call.RequestStream.CompleteAsync();

        if (!stopReceived)
        {
            // The connection closed before "stop"; the protocol treats this as an abort.
            return;
        }

        await forwardResults;
        await SendAsync(socket, new EndMessage(), cancellationToken);

        if (socket.State == WebSocketState.Open)
        {
            await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "end", cancellationToken);
        }
    }

    private StreamingRecognizeRequest BuildConfigRequest(StartMessage start) => new()
    {
        Recognizer = $"projects/{_options.ProjectId}/locations/global/recognizers/_",
        StreamingConfig = new StreamingRecognitionConfig
        {
            Config = new RecognitionConfig
            {
                LanguageCodes = { start.Lang },
                Model = _options.Model,
                // The browser sends a WebM/Opus container; auto-detection handles that (and OGG/MP3/WAV).
                AutoDecodingConfig = new AutoDetectDecodingConfig(),
                Features = new RecognitionFeatures
                {
                    EnableAutomaticPunctuation = true,
                    MaxAlternatives = Math.Max(1, start.MaxAlternatives),
                },
            },
            StreamingFeatures = new StreamingRecognitionFeatures { InterimResults = start.InterimResults },
        },
    };

    private async Task<StartMessage?> ReceiveStartAsync(WebSocket socket, byte[] buffer, CancellationToken cancellationToken)
    {
        var message = await ReceiveMessageAsync(socket, buffer, cancellationToken);
        if (message is not { Type: WebSocketMessageType.Text } received)
        {
            return null;
        }

        var start = JsonSerializer.Deserialize<StartMessage>(Encoding.UTF8.GetString(received.Payload), JsonOptions);

        if (start is null || start.Type != "start")
        {
            logger.LogWarning("Expected a 'start' message first, got: {Text}", Encoding.UTF8.GetString(received.Payload));
            return null;
        }

        return start;
    }

    /// <returns><see langword="true"/> when "stop" was received, <see langword="false"/> on an abort (socket closed first).</returns>
    private static async Task<bool> ForwardAudioAsync(
        WebSocket socket,
        byte[] buffer,
        IClientStreamWriter<StreamingRecognizeRequest> requestStream,
        CancellationToken cancellationToken)
    {
        while (true)
        {
            var message = await ReceiveMessageAsync(socket, buffer, cancellationToken);
            if (message is null)
            {
                return false;
            }

            var (type, payload) = message.Value;

            if (type == WebSocketMessageType.Binary)
            {
                if (payload.Length > 0)
                {
                    await requestStream.WriteAsync(new StreamingRecognizeRequest { Audio = ByteString.CopyFrom(payload) });
                }

                continue;
            }

            TypeEnvelope? envelope;
            try
            {
                envelope = JsonSerializer.Deserialize<TypeEnvelope>(Encoding.UTF8.GetString(payload), JsonOptions);
            }
            catch (JsonException)
            {
                continue; // Not valid JSON; ignore per the protocol's client-handling rules.
            }

            if (envelope?.Type == "stop")
            {
                return true;
            }
        }
    }

    private static async Task ForwardResultsAsync(
        IAsyncStreamReader<StreamingRecognizeResponse> responseStream,
        WebSocket socket,
        CancellationToken cancellationToken)
    {
        try
        {
            while (await responseStream.MoveNext(cancellationToken))
            {
                foreach (var result in responseStream.Current.Results)
                {
                    if (result.Alternatives.Count == 0)
                    {
                        continue;
                    }

                    var best = result.Alternatives[0];

                    await SendAsync(
                        socket,
                        new ResultMessage
                        {
                            Transcript = best.Transcript,
                            IsFinal = result.IsFinal,
                            Confidence = result.IsFinal ? best.Confidence : null,
                            Alternatives = result.Alternatives.Count > 1
                                ? result.Alternatives.Skip(1).Select(a => a.Transcript).ToArray()
                                : null,
                        },
                        cancellationToken);
                }
            }
        }
        catch (RpcException ex)
        {
            await SendAsync(socket, new ErrorMessage { Code = MapErrorCode(ex), Message = ex.Status.Detail }, cancellationToken);
        }
    }

    private static string MapErrorCode(RpcException ex) => ex.StatusCode switch
    {
        StatusCode.Unauthenticated or StatusCode.PermissionDenied => "service-not-allowed",
        StatusCode.InvalidArgument => "audio-capture",
        StatusCode.Cancelled => "aborted",
        StatusCode.DeadlineExceeded or StatusCode.Unavailable or StatusCode.Internal => "network",
        _ => "unknown",
    };

    private static async Task<(WebSocketMessageType Type, byte[] Payload)?> ReceiveMessageAsync(
        WebSocket socket, byte[] buffer, CancellationToken cancellationToken)
    {
        using var stream = new MemoryStream();
        WebSocketReceiveResult result;

        do
        {
            result = await socket.ReceiveAsync(buffer, cancellationToken);
            if (result.MessageType == WebSocketMessageType.Close)
            {
                return null;
            }

            stream.Write(buffer, 0, result.Count);
        } while (!result.EndOfMessage);

        return (result.MessageType, stream.ToArray());
    }

    private static async Task SendAsync(WebSocket socket, object message, CancellationToken cancellationToken)
    {
        if (socket.State != WebSocketState.Open)
        {
            return;
        }

        var json = JsonSerializer.Serialize(message, message.GetType(), JsonOptions);

        try
        {
            await socket.SendAsync(Encoding.UTF8.GetBytes(json), WebSocketMessageType.Text, endOfMessage: true, cancellationToken);
        }
        catch (WebSocketException)
        {
            // The client went away; nothing to do.
        }
    }
}

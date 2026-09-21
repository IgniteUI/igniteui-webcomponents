using SpeechToTextTestServer;

var builder = WebApplication.CreateBuilder(args);
builder.Services.Configure<SpeechToTextServerOptions>(builder.Configuration.GetSection("GoogleSpeech"));
builder.Services.AddSingleton<GoogleSpeechBridge>();

var app = builder.Build();
app.UseWebSockets();

app.MapGet("/", () => "Speech-to-text WebSocket test server. Connect a WebSocket to /stt.");

app.Map("/stt", async (HttpContext context, GoogleSpeechBridge bridge) =>
{
    if (!context.WebSockets.IsWebSocketRequest)
    {
        context.Response.StatusCode = StatusCodes.Status400BadRequest;
        return;
    }

    using var socket = await context.WebSockets.AcceptWebSocketAsync();
    await bridge.RunAsync(socket, context.RequestAborted);
});

app.Run();

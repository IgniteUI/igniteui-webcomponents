namespace SpeechToTextTestServer;

/// Incoming "start" control message; mirrors the protocol's client `start` frame.
public sealed class StartMessage
{
    public string Type { get; set; } = "start";
    public string Lang { get; set; } = "en-US";
    public bool Continuous { get; set; }
    public bool InterimResults { get; set; }
    public int MaxAlternatives { get; set; } = 1;
    public string? MimeType { get; set; }
}

/// Used only to peek at the `type` discriminator of an incoming text frame.
public sealed class TypeEnvelope
{
    public string? Type { get; set; }
}

public sealed class ResultMessage
{
    public string Type => "result";
    public required string Transcript { get; set; }
    public bool IsFinal { get; set; }
    public double? Confidence { get; set; }
    public string[]? Alternatives { get; set; }
}

public sealed class ErrorMessage
{
    public string Type => "error";
    public string? Code { get; set; }
    public string? Message { get; set; }
}

public sealed class EndMessage
{
    public string Type => "end";
}

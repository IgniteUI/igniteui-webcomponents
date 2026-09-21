namespace SpeechToTextTestServer;

/// Bound from the "GoogleSpeech" section of appsettings.json.
public sealed class SpeechToTextServerOptions
{
    /// The GCP project id. Credentials come from GOOGLE_APPLICATION_CREDENTIALS (ADC).
    public string ProjectId { get; set; } = "";

    /// Google Speech V2 recognition model, e.g. "long" or "latest_long".
    public string Model { get; set; } = "long";
}

/**
 * The resource strings of the speech-to-text component.
 */
export interface IgcSpeechToTextResourceStrings {
  /** The label of the button while idle. */
  speechToTextStart?: string;
  /** The label of the button while listening. */
  speechToTextStop?: string;
  /** The label of the button when no provider is available. */
  speechToTextUnsupported?: string;
  /** Announced to assistive technology when listening starts. */
  speechToTextListening?: string;
  /** Announced to assistive technology when listening stops. */
  speechToTextStopped?: string;
  /** Announced to assistive technology, followed by the error message, when an error occurs. */
  speechToTextError?: string;
}

export const IgcSpeechToTextResourceStringsEN: IgcSpeechToTextResourceStrings =
  {
    speechToTextStart: 'Start voice input',
    speechToTextStop: 'Stop voice input',
    speechToTextUnsupported: 'Voice input is not supported in this browser',
    speechToTextListening: 'Listening',
    speechToTextStopped: 'Voice input stopped',
    speechToTextError: 'Voice input error',
  };

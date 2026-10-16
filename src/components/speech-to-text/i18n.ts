/**
 * The resource strings of the speech-to-text component. The strings marked "Announced" go to
 * assistive technology through a live region.
 *
 * `igniteui-i18n-core` has no strings for the component yet. Register a translation under these
 * keys with `registerI18n()`, or set `resourceStrings` on the component.
 */
export interface ISpeechToTextResourceStrings {
  /** The label of the button while idle. */
  speech_to_text_start?: string;
  /** The label of the button while a session is active. */
  speech_to_text_stop?: string;
  /** The label of the button when the provider cannot run in the current environment. */
  speech_to_text_unsupported?: string;
  /** Announced when listening starts. */
  speech_to_text_listening?: string;
  /** Announced when listening stops. */
  speech_to_text_stopped?: string;
  /** Announced for an error code without an own string. */
  speech_to_text_error?: string;
  /** Announced for a `not-allowed` or `service-not-allowed` error. */
  speech_to_text_error_not_allowed?: string;
  /** Announced for a `no-speech` error. */
  speech_to_text_error_no_speech?: string;
  /** Announced for an `audio-capture` error. */
  speech_to_text_error_audio_capture?: string;
  /** Announced for a `network` error. */
  speech_to_text_error_network?: string;
  /** Announced for a `language-not-supported` error. */
  speech_to_text_error_language_not_supported?: string;
}

/** The English resource strings of the speech-to-text component. */
export const SpeechToTextResourceStringsEN: ISpeechToTextResourceStrings = {
  speech_to_text_start: 'Start voice input',
  speech_to_text_stop: 'Stop voice input',
  speech_to_text_unsupported: 'Voice input is not supported in this browser',
  speech_to_text_listening: 'Listening',
  speech_to_text_stopped: 'Voice input stopped',
  speech_to_text_error: 'Voice input failed',
  speech_to_text_error_not_allowed: 'Voice input is not allowed',
  speech_to_text_error_no_speech: 'No speech was detected',
  speech_to_text_error_audio_capture: 'The microphone is not available',
  speech_to_text_error_network: 'The speech service is not reachable',
  speech_to_text_error_language_not_supported:
    'The language of the speech is not supported',
};

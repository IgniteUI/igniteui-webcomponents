/**
 * The lifecycle state of the speech-to-text component.
 *
 * - `idle` - the component captures nothing.
 * - `starting` - the provider starts. The microphone permission prompt can be open.
 * - `listening` - the provider captures and transcribes audio.
 * - `stopping` - the provider sends its last final results, or an aborted start of the provider settles.
 */
export type SpeechToTextState = 'idle' | 'starting' | 'listening' | 'stopping';

/**
 * Why a speech-to-text session ended.
 *
 * - `manual` - `stop()` or `abort()` was called, or the user pushed the button or pressed Escape.
 * - `silence` - there was no speech for the duration of `silenceTimeout`.
 * - `error` - the provider reported an error and ended before it sent a result.
 * - `provider` - the provider ended the session, for example after one utterance.
 */
export type SpeechToTextEndReason = 'manual' | 'silence' | 'error' | 'provider';

/**
 * The error codes of the speech-to-text component. They are the same as the
 * `SpeechRecognitionErrorEvent` codes of the Web Speech API, plus `not-supported`
 * for an environment without a usable provider. Web Speech API codes that the
 * component cannot cause, for example the grammar and phrase codes, become `unknown`.
 */
export type SpeechToTextErrorCode =
  | 'not-supported'
  | 'not-allowed'
  | 'no-speech'
  | 'audio-capture'
  | 'network'
  | 'aborted'
  | 'language-not-supported'
  | 'service-not-allowed'
  | 'unknown';

/* jsonAPIPlainObject */
/** A recognized part of the speech. */
export interface SpeechToTextResultEventArgs {
  /**
   * The recognized text. For an interim result, it is the current best guess for the
   * utterance. For a final result, it is the final segment.
   */
  transcript: string;
  /** Whether the result is final. Later results for the same utterance replace an interim result. */
  isFinal: boolean;
  /** The confidence of the provider in the transcript, from 0 to 1, if available. */
  confidence?: number;
  /**
   * Other transcripts for the same utterance, most probable first, without `transcript`.
   * Only a provider that supports alternatives sends them, when `maxAlternatives` is more than 1.
   */
  alternatives?: string[];
}

/* jsonAPIPlainObject */
/** An error that the speech-to-text component reports. */
export interface SpeechToTextErrorEventArgs {
  /** The error code. */
  code: SpeechToTextErrorCode;
  /** A description of the error that a person can read. */
  message: string;
}

/* jsonAPIPlainObject */
/** The details of a speech-to-text session that ended. */
export interface SpeechToTextEndEventArgs {
  /** The full final transcript of the session. */
  transcript: string;
  /** Why the session ended. */
  reason: SpeechToTextEndReason;
}

/* blazorSuppress */
/** The recognition settings that the component gives to its provider when a session starts. */
export interface SpeechToTextProviderOptions {
  /** The BCP 47 language tag of the speech. */
  lang: string;
  /** Whether the session continues after the first utterance. */
  continuous: boolean;
  /** Whether the component wants interim results. */
  interimResults: boolean;
  /** The maximum number of alternative transcripts in a result. */
  maxAlternatives: number;
}

/* blazorSuppress */
/**
 * The callbacks that a provider calls to report progress to the component.
 *
 * After `start()` resolves, the provider must call `onEnd()` one time. This applies to a
 * normal end, to an end after `stop()` or `abort()`, and to an end after an error.
 */
export interface SpeechToTextProviderListener {
  /** The provider listens. Not necessary when `start()` resolves only after the provider listens. */
  onStart(): void;
  /** An interim or a final result is available. */
  onResult(result: SpeechToTextResultEventArgs): void;
  /** The provider has an error. Results or `onEnd()` can follow. */
  onError(error: SpeechToTextErrorEventArgs): void;
  /** The session ended. No more callbacks follow. */
  onEnd(): void;
  /**
   * The provider found speech or sound. This resets the silence timeout of the component.
   * Results also reset it, so call this only for activity that has no result yet.
   */
  onActivity(): void;
}

/* blazorSuppress */
/**
 * A speech recognition backend for the speech-to-text component.
 *
 * The component has a provider that uses the Web Speech API. The `extras` entry point has a
 * provider that sends the microphone audio to a WebSocket endpoint. Implement this interface
 * to use a different service.
 */
export interface SpeechToTextProvider {
  /** Whether the provider can run in the current environment. */
  readonly isSupported: boolean;
  /**
   * Starts a recognition session. Resolves when the provider listens. Rejects, preferably with
   * a `SpeechToTextProviderError`, when the provider cannot start. An `abort()` before the
   * provider listens should make it reject. The component starts a new session only after the
   * returned promise settles.
   */
  start(
    options: SpeechToTextProviderOptions,
    listener: SpeechToTextProviderListener
  ): Promise<void>;
  /** Stops the audio capture. The provider then sends its remaining final results. */
  stop(): void;
  /** Ends the session immediately and discards the results that the provider did not send yet. */
  abort(): void;
}

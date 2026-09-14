/**
 * The lifecycle state of the speech-to-text component.
 *
 * - `idle` - nothing is captured.
 * - `starting` - the provider is starting; the microphone permission prompt may be pending.
 * - `listening` - audio is captured and transcribed.
 * - `stopping` - the provider flushes its final results before it ends.
 */
export type SpeechToTextState = 'idle' | 'starting' | 'listening' | 'stopping';

/**
 * Why a speech-to-text session ended.
 *
 * - `manual` - `stop()` or `abort()` was called, or the user toggled the button.
 * - `silence` - no speech was detected for the duration of `silenceTimeout`.
 * - `error` - the provider reported an error and ended.
 * - `provider` - the provider ended on its own, for example after a single utterance.
 */
export type SpeechToTextEndReason = 'manual' | 'silence' | 'error' | 'provider';

/**
 * Error codes reported by the speech-to-text component. The codes mirror the
 * `SpeechRecognitionErrorEvent` codes of the Web Speech API, plus `not-supported`
 * for environments without a usable provider.
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
/**
 * A recognized piece of speech.
 */
export interface SpeechToTextResultEventArgs {
  /**
   * The recognized text. For an interim result this is the current best guess
   * for the utterance in progress; for a final result it is the finalized segment.
   */
  transcript: string;
  /**
   * Whether the result is final. Interim results are replaced by later results
   * for the same utterance.
   */
  isFinal: boolean;
  /**
   * The confidence of the provider in the transcript, between 0 and 1, when available.
   */
  confidence?: number;
  /**
   * Alternative transcripts for the same utterance, most likely first, excluding `transcript`.
   * Populated only when the provider supports alternatives and `maxAlternatives` is greater than 1.
   */
  alternatives?: string[];
}

/* jsonAPIPlainObject */
/**
 * An error reported by the speech-to-text component.
 */
export interface SpeechToTextErrorEventArgs {
  /** The error code. */
  code: SpeechToTextErrorCode;
  /** A human-readable description of the error. */
  message: string;
}

/* jsonAPIPlainObject */
/**
 * Details of a finished speech-to-text session.
 */
export interface SpeechToTextEndEventArgs {
  /** The full final transcript of the session. */
  transcript: string;
  /** Why the session ended. */
  reason: SpeechToTextEndReason;
}

/* blazorSuppress */
/**
 * The recognition settings the component passes to its provider when a session starts.
 */
export interface SpeechToTextProviderOptions {
  /** The BCP 47 language tag of the speech. */
  lang: string;
  /** Whether the session continues after the first utterance. */
  continuous: boolean;
  /** Whether interim results are wanted. */
  interimResults: boolean;
  /** The maximum number of alternative transcripts per result. */
  maxAlternatives: number;
}

/* blazorSuppress */
/**
 * The callbacks a provider invokes to report progress to the component.
 *
 * After `start()` resolves, a provider must eventually call `onEnd()` exactly once,
 * whether the session ends normally, because of `stop()` / `abort()`, or after an error.
 */
export interface SpeechToTextProviderListener {
  /** The provider is listening. */
  onStart(): void;
  /** An interim or final result is available. */
  onResult(result: SpeechToTextResultEventArgs): void;
  /** The provider encountered an error. It may still deliver results, or call `onEnd()` next. */
  onError(error: SpeechToTextErrorEventArgs): void;
  /** The session ended. No further callbacks follow. */
  onEnd(): void;
  /**
   * Speech or sound activity was detected. Resets the silence timeout of the component.
   * Results count as activity on their own; call this for activity that produces no result yet.
   */
  onActivity(): void;
}

/* blazorSuppress */
/**
 * A speech recognition backend for the speech-to-text component.
 *
 * The component ships with a provider built on the Web Speech API and the `extras`
 * entry point ships one that streams microphone audio to a WebSocket endpoint.
 * Implement this interface to plug in a different service.
 */
export interface SpeechToTextProvider {
  /** Whether the provider can run in the current environment. */
  readonly isSupported: boolean;
  /**
   * Starts a recognition session. Resolves once the provider is listening and
   * rejects, preferably with a `SpeechToTextProviderError`, when it cannot start.
   */
  start(
    options: SpeechToTextProviderOptions,
    listener: SpeechToTextProviderListener
  ): Promise<void>;
  /** Stops capturing audio and lets the provider deliver its remaining final results. */
  stop(): void;
  /** Ends the session immediately, discarding results that are not yet delivered. */
  abort(): void;
}

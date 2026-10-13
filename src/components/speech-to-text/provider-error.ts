import { isString } from '#internals/utils/types.js';
import type { SpeechToTextErrorCode } from './types.js';

// `satisfies` makes a missing or an extra code a type error.
const ERROR_CODES = {
  'not-supported': true,
  'not-allowed': true,
  'no-speech': true,
  'audio-capture': true,
  network: true,
  aborted: true,
  'language-not-supported': true,
  'service-not-allowed': true,
  unknown: true,
} satisfies Record<SpeechToTextErrorCode, true>;

/** Whether `value` is an error code of the speech-to-text component. */
export function isSpeechToTextErrorCode(
  value: unknown
): value is SpeechToTextErrorCode {
  return isString(value) && Object.hasOwn(ERROR_CODES, value);
}

/* blazorSuppress */
/**
 * The error that a speech-to-text provider rejects with when it cannot start a session.
 * The component reports it in an `igcError` event with the same code.
 */
export class SpeechToTextProviderError extends Error {
  /** Returns `error` if it is a provider error. Otherwise, wraps it with the code `unknown`. */
  public static from(error: unknown): SpeechToTextProviderError {
    return error instanceof SpeechToTextProviderError
      ? error
      : new SpeechToTextProviderError(
          'unknown',
          error instanceof Error ? error.message : String(error)
        );
  }

  /** The error code. */
  public readonly code: SpeechToTextErrorCode;

  constructor(code: SpeechToTextErrorCode, message?: string) {
    super(message ?? code);
    this.name = 'SpeechToTextProviderError';
    this.code = code;
  }
}

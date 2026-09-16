import { isString } from '#internals/utils/types.js';
import type { SpeechToTextErrorCode } from './types.js';

// An object literal keeps the set in sync with the union: a missing or an extra key is a type error.
const ERROR_CODES: ReadonlySet<string> = new Set(
  Object.keys({
    'not-supported': true,
    'not-allowed': true,
    'no-speech': true,
    'audio-capture': true,
    network: true,
    aborted: true,
    'language-not-supported': true,
    'service-not-allowed': true,
    unknown: true,
  } satisfies Record<SpeechToTextErrorCode, true>)
);

/** Whether `value` is one of the error codes the speech-to-text component reports. */
export function isSpeechToTextErrorCode(
  value: unknown
): value is SpeechToTextErrorCode {
  return isString(value) && ERROR_CODES.has(value);
}

/* blazorSuppress */
/**
 * The error a speech-to-text provider rejects with when it cannot start a session.
 * The component maps it to an `igcError` event with the same code.
 */
export class SpeechToTextProviderError extends Error {
  /** Returns `error` as is when it is a provider error, otherwise wraps it with code `unknown`. */
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

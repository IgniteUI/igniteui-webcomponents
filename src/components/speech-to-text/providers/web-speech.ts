import { createAbortHandle } from '#internals/abort-handler.js';
import {
  isSpeechToTextErrorCode,
  SpeechToTextProviderError,
} from '../provider-error.js';
import type {
  SpeechToTextProvider,
  SpeechToTextProviderListener,
  SpeechToTextProviderOptions,
  SpeechToTextResultEventArgs,
} from '../types.js';

//#region Web Speech API typings

// The DOM lib of TypeScript does not describe the Web Speech API, and the
// published typings must not require consumers to add it, so the surface the
// provider touches is declared locally.

interface RecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface RecognitionResult extends ArrayLike<RecognitionAlternative> {
  readonly isFinal: boolean;
}

interface RecognitionResultEvent extends Event {
  readonly resultIndex: number;
  readonly results: ArrayLike<RecognitionResult>;
}

interface RecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface Recognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
}

type RecognitionConstructor = new () => Recognition;

type RecognitionGlobal = {
  SpeechRecognition?: RecognitionConstructor;
  webkitSpeechRecognition?: RecognitionConstructor;
};

//#endregion

function getRecognitionConstructor(): RecognitionConstructor | undefined {
  const scope = globalThis as RecognitionGlobal;
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition;
}

/**
 * Adds the likely region to a language tag that has none (`en` becomes `en-US`).
 *
 * The speech service of Edge fails with a `network` error for a tag without a region,
 * while Chrome accepts it. An invalid tag is returned as is.
 */
function toRegionalLanguageTag(lang: string): string {
  try {
    const locale = new Intl.Locale(lang);

    if (locale.region) {
      return lang;
    }

    const { region } = locale.maximize();
    return [locale.language, locale.script, region].filter(Boolean).join('-');
  } catch {
    return lang;
  }
}

/* blazorSuppress */
/**
 * A speech-to-text provider built on the `SpeechRecognition` interface of the Web Speech API.
 *
 * This is the provider the speech-to-text component uses when no other one is assigned.
 * Recognition runs through the speech service of the browser; on most browsers that means
 * the audio is sent to a remote service and an active network connection is required.
 * Browsers without the API, such as Firefox by default, report `isSupported` as `false`.
 */
export class WebSpeechProvider implements SpeechToTextProvider {
  /** Whether the Web Speech API is available in the current environment. */
  public static get isSupported(): boolean {
    return getRecognitionConstructor() !== undefined;
  }

  private readonly _abort = createAbortHandle();
  private _recognition?: Recognition;
  private _aborting = false;

  public get isSupported(): boolean {
    return WebSpeechProvider.isSupported;
  }

  public async start(
    options: SpeechToTextProviderOptions,
    listener: SpeechToTextProviderListener
  ): Promise<void> {
    if (this._recognition) {
      throw new SpeechToTextProviderError(
        'unknown',
        'A recognition session is already running.'
      );
    }

    const RecognitionImpl = getRecognitionConstructor();

    if (!RecognitionImpl) {
      throw new SpeechToTextProviderError(
        'not-supported',
        'The Web Speech API is not available in this browser.'
      );
    }

    const recognition = new RecognitionImpl();
    recognition.lang = toRegionalLanguageTag(options.lang);
    recognition.continuous = options.continuous;
    recognition.interimResults = options.interimResults;
    recognition.maxAlternatives = options.maxAlternatives;
    this._recognition = recognition;

    const { signal } = this._abort;

    await new Promise<void>((resolve, reject) => {
      let started = false;

      recognition.addEventListener(
        'start',
        () => {
          started = true;
          listener.onStart();
          resolve();
        },
        { signal }
      );

      recognition.addEventListener(
        'result',
        (event) =>
          this._handleResult(event as RecognitionResultEvent, listener),
        { signal }
      );

      recognition.addEventListener('speechstart', () => listener.onActivity(), {
        signal,
      });

      recognition.addEventListener(
        'error',
        (event) => {
          const { error, message } = event as RecognitionErrorEvent;

          if (this._aborting && error === 'aborted') {
            return;
          }

          const code = isSpeechToTextErrorCode(error) ? error : 'unknown';
          const description = message || error;

          if (started) {
            listener.onError({ code, message: description });
          } else {
            this._cleanup();
            reject(new SpeechToTextProviderError(code, description));
          }
        },
        { signal }
      );

      recognition.addEventListener(
        'end',
        () => {
          this._cleanup();

          if (started) {
            listener.onEnd();
          } else {
            reject(
              new SpeechToTextProviderError(
                'aborted',
                'Recognition ended before it started.'
              )
            );
          }
        },
        { signal }
      );

      try {
        recognition.start();
      } catch (error) {
        this._cleanup();
        reject(SpeechToTextProviderError.from(error));
      }
    });
  }

  public stop(): void {
    this._recognition?.stop();
  }

  public abort(): void {
    if (this._recognition) {
      this._aborting = true;
      this._recognition.abort();
    }
  }

  private _handleResult(
    event: RecognitionResultEvent,
    listener: SpeechToTextProviderListener
  ): void {
    const { results } = event;
    let interim = '';

    for (let i = event.resultIndex; i < results.length; i++) {
      const result = results[i];
      const best = result[0];

      if (!result.isFinal) {
        interim += best.transcript;
        continue;
      }

      const args: SpeechToTextResultEventArgs = {
        transcript: best.transcript,
        isFinal: true,
        confidence: best.confidence,
      };

      if (result.length > 1) {
        args.alternatives = Array.from(result)
          .slice(1)
          .map((alternative) => alternative.transcript);
      }

      listener.onResult(args);
    }

    if (interim) {
      listener.onResult({ transcript: interim, isFinal: false });
    }
  }

  private _cleanup(): void {
    this._abort.abort();
    this._recognition = undefined;
    this._aborting = false;
  }
}

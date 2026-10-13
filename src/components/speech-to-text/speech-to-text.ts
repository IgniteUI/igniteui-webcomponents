import { html, LitElement, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { keyed } from 'lit/directives/keyed.js';
import {
  ariaBindings,
  hostAria,
} from '#internals/controllers/aria-projection.js';
import { addInternalsController } from '#internals/controllers/internals.js';
import {
  addKeybindings,
  escapeKey,
} from '#internals/controllers/key-bindings.js';
import { coercedProperty } from '#internals/decorators/coerced-property.js';
import { registerComponent } from '#internals/definitions/register.js';
import type { I18nControllerConfig } from '#internals/i18n/i18n-controller.js';
import type { Constructor } from '#internals/mixins/constructor.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { HostAriaMixin } from '#internals/mixins/host-aria.js';
import { I18nMixin } from '#internals/mixins/i18n.js';
import { createTimer } from '#internals/timing.js';
import { asNumber } from '#internals/utils/math.js';
import { all } from '#themes/speech-to-text/themes/themes.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import IgcIconComponent from '../icon/icon.js';
import type { IconButtonVariant } from '../types.js';
import IgcVisuallyHiddenComponent from '../visually-hidden/visually-hidden.js';
import {
  type ISpeechToTextResourceStrings,
  SpeechToTextResourceStringsEN,
} from './i18n.js';
import { SpeechToTextProviderError } from './provider-error.js';
import { WebSpeechProvider } from './providers/web-speech.js';
import { styles as shared } from './themes/shared/speech-to-text.common.css.js';
import { styles } from './themes/speech-to-text.base.css.js';
import type {
  SpeechToTextEndEventArgs,
  SpeechToTextEndReason,
  SpeechToTextErrorCode,
  SpeechToTextErrorEventArgs,
  SpeechToTextProvider,
  SpeechToTextProviderListener,
  SpeechToTextResultEventArgs,
  SpeechToTextState,
} from './types.js';

export interface IgcSpeechToTextComponentEventMap {
  igcStart: CustomEvent<void>;
  igcInterim: CustomEvent<SpeechToTextResultEventArgs>;
  igcResult: CustomEvent<SpeechToTextResultEventArgs>;
  igcEnd: CustomEvent<SpeechToTextEndEventArgs>;
  igcError: CustomEvent<SpeechToTextErrorEventArgs>;
  igcStateChange: CustomEvent<SpeechToTextState>;
}

/** One recognition session. Its identity separates late provider callbacks from the current session. */
interface Session {
  provider: SpeechToTextProvider;
  /** Whether the provider listens. `onStart()` or the resolved `start()` sets it. */
  listening?: boolean;
  /** Whether the session stopped before the provider listened. */
  aborted?: boolean;
  /** Whether the provider reported an error and sent no result after it. */
  failed?: boolean;
  /** Why the component stopped the session. */
  endReason?: SpeechToTextEndReason;
}

type EndOptions = {
  /** Whether to discard the results that the provider did not send yet. */
  abort?: boolean;
  /** Whether to emit `igcStateChange`. Only user interaction and the timer emit it. */
  emit?: boolean;
};

const i18n: I18nControllerConfig<ISpeechToTextResourceStrings> = {
  defaultEN: SpeechToTextResourceStringsEN,
};

const ERROR_STRINGS = {
  'not-allowed': 'speech_to_text_error_not_allowed',
  'service-not-allowed': 'speech_to_text_error_not_allowed',
  'no-speech': 'speech_to_text_error_no_speech',
  'audio-capture': 'speech_to_text_error_audio_capture',
  network: 'speech_to_text_error_network',
  'language-not-supported': 'speech_to_text_error_language_not_supported',
  'not-supported': 'speech_to_text_error',
  aborted: 'speech_to_text_error',
  unknown: 'speech_to_text_error',
} satisfies Record<SpeechToTextErrorCode, keyof ISpeechToTextResourceStrings>;

/**
 * A button that changes speech into text.
 *
 * When the user pushes the button, a recognition session starts. The recognized text comes in
 * `igcInterim` and `igcResult` events, and `igcEnd` reports the end of the session. The `locale` of
 * the component sets the language of the speech. A provider does the recognition. Without a
 * `provider`, the component uses the Web Speech API of the browser, and it is disabled where the
 * API is not available.
 *
 * @example
 * ```html
 * <igc-speech-to-text locale="en-US" interim-results></igc-speech-to-text>
 * ```
 *
 * @example
 * ```html
 * <!-- Custom trigger content -->
 * <igc-speech-to-text>
 *   <igc-icon name="record_voice_over"></igc-icon>
 * </igc-speech-to-text>
 * ```
 *
 * @element igc-speech-to-text
 *
 * @slot - Custom content of the trigger button. Replaces the default microphone icon.
 *
 * @fires igcStart - Emitted when the provider starts to listen.
 * @fires igcInterim - Emitted with an interim result while the user speaks. Requires `interimResults`.
 * @fires igcResult - Emitted with each final result.
 * @fires igcEnd - Emitted when a session that listened ends. Contains the full transcript and the reason.
 * @fires igcError - Emitted when the provider reports an error or cannot start.
 * @fires igcStateChange - Emitted when the user, the provider or the silence timeout changes the lifecycle state. Method calls and property changes do not emit it.
 *
 * @csspart button - The trigger button.
 * @csspart indicator - The ring that pulses around the button while the component listens.
 *
 * @cssproperty --indicator-color - The color of the listening indicator.
 */
export default class IgcSpeechToTextComponent extends I18nMixin(
  EventEmitterMixin<IgcSpeechToTextComponentEventMap, Constructor<LitElement>>(
    HostAriaMixin(LitElement)
  ),
  i18n
) {
  public static readonly tagName = 'igc-speech-to-text';
  public static styles = [componentBase, styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(
      IgcSpeechToTextComponent,
      IgcIconButtonComponent,
      IgcIconComponent,
      IgcVisuallyHiddenComponent
    );
  }

  /* blazorSuppress */
  /** Whether the default provider, the Web Speech API of the browser, is available. */
  public static get isSupported(): boolean {
    return WebSpeechProvider.isSupported;
  }

  //#region Internal state and properties

  private readonly _internals = addInternalsController(this);
  private readonly _silenceTimer = createTimer(() =>
    this._end('silence', { emit: true })
  );

  private _defaultProvider?: WebSpeechProvider;
  private _session?: Session;
  private _segments: string[] = [];
  private _announcement = '';

  @state()
  private _state: SpeechToTextState = 'idle';

  /** Changes with each announcement, so that the live region also announces a repeated message. */
  @state()
  private _announcementId = 0;

  private get _resolvedProvider(): SpeechToTextProvider {
    return this.provider ?? (this._defaultProvider ??= new WebSpeechProvider());
  }

  //#endregion

  //#region Public attributes and properties

  /**
   * Whether the session continues after the first utterance until it is stopped.
   * @attr continuous
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public continuous = false;

  /**
   * Whether `igcInterim` reports interim results while the user speaks.
   * @attr interim-results
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'interim-results' })
  public interimResults = false;

  /**
   * The maximum number of alternative transcripts in a final result. The minimum is 1.
   * @attr max-alternatives
   * @default 1
   */
  @property({ type: Number, attribute: 'max-alternatives' })
  @coercedProperty<number, IgcSpeechToTextComponent>({
    transform: ({ value }) => Math.max(1, Math.floor(asNumber(value, 1))),
  })
  public maxAlternatives = 1;

  /**
   * The time in milliseconds without speech after which the session stops.
   * Zero, a negative value, or a value that is not a finite number disables the timeout.
   * @attr silence-timeout
   * @default 0
   */
  @property({ type: Number, attribute: 'silence-timeout' })
  @coercedProperty<number, IgcSpeechToTextComponent>({
    transform: ({ value }) => Math.max(0, asNumber(value)),
    onChange: ({ host }) => host._armSilenceTimer(),
  })
  public silenceTimeout = 0;

  /**
   * Whether the component is disabled. A change to `true` aborts the active session.
   * @attr disabled
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  @coercedProperty<boolean, IgcSpeechToTextComponent>({
    onChange: ({ value, host }) => {
      if (value) {
        host.abort();
      }
    },
  })
  public disabled = false;

  /**
   * The variant of the trigger button.
   * @attr variant
   * @default 'flat'
   */
  @property({ reflect: true })
  public variant: IconButtonVariant = 'flat';

  /* blazorSuppress */
  /**
   * The recognition provider. The default provider uses the Web Speech API.
   * A change of the provider aborts the active session.
   */
  @property({ attribute: false })
  @coercedProperty<SpeechToTextProvider | undefined, IgcSpeechToTextComponent>({
    onChange: ({ host }) => {
      const session = host._session;

      if (session && session.provider !== host._resolvedProvider) {
        host.abort();
      }
    },
  })
  public provider?: SpeechToTextProvider = undefined;

  /** The lifecycle state of the component. */
  public get state(): SpeechToTextState {
    return this._state;
  }

  /** The final transcript of the current or the last session. */
  public get transcript(): string {
    return this._segments.join(' ');
  }

  /** Whether the active provider can run in the current environment. */
  public get supported(): boolean {
    return (this.provider ?? WebSpeechProvider).isSupported;
  }

  //#endregion

  constructor() {
    super();
    addThemingController(this, all);

    addKeybindings(this, {
      skip: () => this._state === 'idle',
    }).set(escapeKey, () => this._end('manual', { abort: true, emit: true }));

    this._internals.setState('idle', true);
  }

  //#region Lit lifecycle methods

  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.abort();
  }

  protected override update(changedProperties: PropertyValues<this>): void {
    this._internals.setState('unsupported', !this.supported);
    super.update(changedProperties);
  }

  //#endregion

  //#region Event handlers

  private _handleClick(): void {
    if (this._state === 'idle') {
      this._start(true);
    } else {
      this._end('manual', { emit: true });
    }
  }

  //#endregion

  //#region Provider listener

  /**
   * Creates the listener of `session`. It ignores the callbacks of a session that ended.
   * For a session that stopped before the provider listened, it accepts only `onEnd()`.
   */
  private _createListener(session: Session): SpeechToTextProviderListener {
    const guard =
      <T extends unknown[]>(handler: (...args: T) => void) =>
      (...args: T) => {
        if (this._session === session && !session.aborted) {
          handler(...args);
        }
      };

    return {
      onStart: guard(() => this._handleProviderStart(session)),
      onResult: guard((result: SpeechToTextResultEventArgs) =>
        this._handleProviderResult(session, result)
      ),
      onError: guard((error: SpeechToTextErrorEventArgs) => {
        session.failed = true;
        this._emitError(error);
      }),
      onEnd: () => {
        if (this._session === session) {
          this._handleProviderEnd(session);
        }
      },
      onActivity: guard(() => this._armSilenceTimer()),
    };
  }

  private _handleProviderStart(session: Session): void {
    // `onStart()` and the resolved `start()` both call this.
    if (session.listening) {
      return;
    }

    session.listening = true;
    this._setState('listening', true);

    // A handler of `igcStateChange` can end the session.
    if (this._session !== session) {
      return;
    }

    this._announce(this.resourceStrings.speech_to_text_listening);
    this.emitEvent('igcStart');
    this._armSilenceTimer();
  }

  private _handleProviderResult(
    session: Session,
    result: SpeechToTextResultEventArgs
  ): void {
    // A result after an error shows that the provider recovered.
    session.failed = false;

    if (result.isFinal) {
      const transcript = result.transcript.trim();

      if (transcript) {
        this._segments.push(transcript);
      }

      this.emitEvent('igcResult', { detail: result });
    } else if (this.interimResults) {
      this.emitEvent('igcInterim', { detail: result });
    }

    this._armSilenceTimer();
  }

  private _handleProviderEnd(session: Session): void {
    const reason = session.endReason ?? (session.failed ? 'error' : 'provider');
    // Read the transcript first. A handler of `igcStateChange` can start a new
    // session, which clears it.
    const detail: SpeechToTextEndEventArgs = {
      transcript: this.transcript,
      reason,
    };

    if (session.listening && reason !== 'error') {
      this._announce(this.resourceStrings.speech_to_text_stopped);
    }

    this._clearSession();
    this._setState('idle', true);

    if (session.listening) {
      this.emitEvent('igcEnd', { detail });
    }
  }

  //#endregion

  //#region Internal API

  private _setState(value: SpeechToTextState, emit: boolean): void {
    if (this._state === value) {
      return;
    }

    this._internals.setState(this._state, false);
    this._internals.setState(value, true);
    this._state = value;

    if (emit) {
      this.emitEvent('igcStateChange', { detail: value });
    }
  }

  private _clearSession(): void {
    this._silenceTimer.stop();
    this._session = undefined;
  }

  private _armSilenceTimer(): void {
    if (this.silenceTimeout > 0 && this._state === 'listening') {
      this._silenceTimer.start(this.silenceTimeout);
    } else {
      this._silenceTimer.stop();
    }
  }

  private async _start(emit: boolean): Promise<void> {
    if (this.disabled || this._state !== 'idle') {
      return;
    }

    const provider = this._resolvedProvider;

    if (!provider.isSupported) {
      return;
    }

    const session: Session = { provider };

    this._segments = [];
    this._session = session;
    this._setState('starting', emit);

    // A handler of `igcStateChange` can abort the session.
    if (session.aborted) {
      this._clearSession();
      this._setState('idle', true);
      return;
    }

    const { locale: lang, continuous, interimResults, maxAlternatives } = this;

    try {
      await provider.start(
        { lang, continuous, interimResults, maxAlternatives },
        this._createListener(session)
      );
    } catch (error) {
      if (this._session === session) {
        this._clearSession();

        if (!session.aborted) {
          const { code, message } = SpeechToTextProviderError.from(error);
          this._emitError({ code, message });
        }

        this._setState('idle', true);
      }
      return;
    }

    if (this._session !== session) {
      return;
    }

    if (session.aborted) {
      // The provider started after the abort. Abort it again. Its `onEnd()`
      // ends the session.
      provider.abort();
    } else {
      this._handleProviderStart(session);
    }
  }

  private _end(
    reason: 'manual' | 'silence',
    { abort = false, emit = false }: EndOptions = {}
  ): void {
    const session = this._session;

    // During a stop, only an abort has an effect.
    if (!session || (this._state === 'stopping' && !abort)) {
      return;
    }

    // Before the provider listens, there are no results to keep, so a stop is
    // an abort. The session stays until `start()` of the provider settles, so
    // a new session does not find the provider busy.
    const starting = this._state === 'starting';

    if (starting) {
      session.aborted = true;
    }

    session.endReason = reason;
    this._silenceTimer.stop();
    this._setState('stopping', emit);

    if (abort || starting) {
      session.provider.abort();
    } else {
      session.provider.stop();
    }
  }

  private _announce(message: string | undefined): void {
    this._announcement = message ?? '';
    this._announcementId++;
  }

  private _emitError(error: SpeechToTextErrorEventArgs): void {
    this._announce(this.resourceStrings[ERROR_STRINGS[error.code]]);
    this.emitEvent('igcError', { detail: error });
  }

  //#endregion

  //#region Public API

  /**
   * Starts a recognition session. Does nothing while a session is active, when the component is
   * disabled, or when the provider cannot run in the current environment.
   */
  public async start(): Promise<void> {
    await this._start(false);
  }

  /**
   * Stops the audio capture. The provider sends its remaining final results, then `igcEnd` is
   * emitted. A session that is starting is aborted.
   */
  public stop(): void {
    this._end('manual');
  }

  /** Ends the session immediately and discards the results that the provider did not send yet. */
  public abort(): void {
    this._end('manual', { abort: true });
  }

  /**
   * Starts a session when the component is idle. Stops an active session, or aborts a session
   * that is starting. Does nothing while a session stops, so that a second stop does not discard
   * the pending results.
   */
  public async toggle(): Promise<void> {
    if (this._state === 'idle') {
      await this.start();
    } else {
      this.stop();
    }
  }

  //#endregion

  protected override render() {
    const { supported, resourceStrings: strings } = this;
    let label = strings.speech_to_text_stop;

    if (!supported) {
      label = strings.speech_to_text_unsupported;
    } else if (this._state === 'idle') {
      label = strings.speech_to_text_start;
    }

    return html`
      <igc-icon-button
        part="button"
        variant=${this.variant}
        ${ariaBindings(hostAria(this, { fallback: label }))}
        ?disabled=${this.disabled || !supported}
        @click=${this._handleClick}
      >
        <slot>
          <igc-icon
            name="mic"
            collection="default"
            aria-hidden="true"
          ></igc-icon>
        </slot>
      </igc-icon-button>
      <span part="indicator" aria-hidden="true"></span>
      <igc-visually-hidden role="status" aria-live="polite">
        ${keyed(this._announcementId, this._announcement)}
      </igc-visually-hidden>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-speech-to-text': IgcSpeechToTextComponent;
  }
}

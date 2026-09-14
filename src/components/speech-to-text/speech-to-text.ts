import { html, LitElement, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { addInternalsController } from '#internals/controllers/internals.js';
import {
  addKeybindings,
  escapeKey,
} from '#internals/controllers/key-bindings.js';
import { registerComponent } from '#internals/definitions/register.js';
import {
  type IgcSpeechToTextResourceStrings,
  IgcSpeechToTextResourceStringsEN,
} from '#internals/i18n/EN/speech-to-text.resources.js';
import type { I18nControllerConfig } from '#internals/i18n/i18n-controller.js';
import type { Constructor } from '#internals/mixins/constructor.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { I18nMixin } from '#internals/mixins/i18n.js';
import { createTimer } from '#internals/timing.js';
import { asNumber } from '#internals/utils/math.js';
import { addThemingController } from '#theming/theming-controller.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import IgcIconComponent from '../icon/icon.js';
import type { IconButtonVariant } from '../types.js';
import IgcVisuallyHiddenComponent from '../visually-hidden/visually-hidden.js';
import { SpeechToTextProviderError } from './provider-error.js';
import { WebSpeechProvider } from './providers/web-speech.js';
import { styles as shared } from './themes/shared/speech-to-text.common.css.js';
import { styles } from './themes/speech-to-text.base.css.js';
import { all } from './themes/themes.js';
import type {
  SpeechToTextEndEventArgs,
  SpeechToTextEndReason,
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

/** One recognition session. Its identity tells late provider callbacks apart from the current session. */
interface Session {
  provider: SpeechToTextProvider;
  endReason?: SpeechToTextEndReason;
}

const i18n: I18nControllerConfig<IgcSpeechToTextResourceStrings> = {
  defaultEN: IgcSpeechToTextResourceStringsEN,
};

/**
 * A button that turns speech into text.
 *
 * Pressing the button starts a recognition session; the recognized text arrives through
 * `igcInterim` and `igcResult` events and the session ends with `igcEnd`. The `locale` of the
 * component selects the language of the speech. Recognition is delegated to a provider.
 * Without an explicit `provider`, the component uses the Web Speech API of the browser and
 * renders disabled where the API is not available.
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
 * @fires igcStart - Emitted when the provider starts listening.
 * @fires igcInterim - Emitted with an interim result while an utterance is in progress. Requires `interimResults`.
 * @fires igcResult - Emitted with each final result.
 * @fires igcEnd - Emitted when the session ends, with the full transcript and the reason.
 * @fires igcError - Emitted when the provider reports an error or cannot start.
 * @fires igcStateChange - Emitted when the lifecycle state of the component changes.
 *
 * @csspart button - The trigger button.
 * @csspart indicator - The pulsing ring rendered around the button while listening.
 *
 * @cssproperty --indicator-color - The color of the listening indicator.
 */
export default class IgcSpeechToTextComponent extends I18nMixin(
  EventEmitterMixin<IgcSpeechToTextComponentEventMap, Constructor<LitElement>>(
    LitElement
  ),
  i18n
) {
  public static readonly tagName = 'igc-speech-to-text';
  public static styles = [styles, shared];

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
  /**
   * Whether the default provider, the Web Speech API of the browser, is available.
   */
  public static get isSupported(): boolean {
    return WebSpeechProvider.isSupported;
  }

  //#region Internal state and properties

  private readonly _internals = addInternalsController(this);
  private readonly _silenceTimer = createTimer(() => this._end('silence'));

  private _defaultProvider?: WebSpeechProvider;
  private _session?: Session;
  private _segments: string[] = [];

  @state()
  private _state: SpeechToTextState = 'idle';

  @state()
  private _announcement = '';

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
   * Whether interim results are reported through `igcInterim` while an utterance is in progress.
   * @attr interim-results
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'interim-results' })
  public interimResults = false;

  /**
   * The maximum number of alternative transcripts a final result carries.
   * @attr max-alternatives
   * @default 1
   */
  @property({ type: Number, attribute: 'max-alternatives' })
  public maxAlternatives = 1;

  /**
   * The time in milliseconds without speech activity after which the session stops on its own.
   * Zero disables the timeout.
   * @attr silence-timeout
   * @default 0
   */
  @property({ type: Number, attribute: 'silence-timeout' })
  public silenceTimeout = 0;

  /**
   * Whether the component is disabled.
   * @attr disabled
   * @default false
   */
  @property({ type: Boolean, reflect: true })
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
   * The recognition provider. Defaults to a provider built on the Web Speech API.
   * Changing the provider while a session is active aborts the session.
   */
  @property({ attribute: false })
  public provider?: SpeechToTextProvider;

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
    return this._resolvedProvider.isSupported;
  }

  //#endregion

  constructor() {
    super();
    addThemingController(this, all);

    addKeybindings(this, {
      skip: () => this._state === 'idle',
    }).set(escapeKey, () => this.abort());

    this._internals.setState('idle', true);
  }

  //#region Lit lifecycle methods

  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.abort();
  }

  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has('provider')) {
      this.abort();
    }

    if (changedProperties.has('silenceTimeout')) {
      this._armSilenceTimer();
    }
  }

  protected override update(changedProperties: PropertyValues<this>): void {
    this._internals.setState('unsupported', !this.supported);
    super.update(changedProperties);
  }

  //#endregion

  //#region Provider listener

  private _createListener(session: Session): SpeechToTextProviderListener {
    const isCurrent = () => this._session === session;

    return {
      onStart: () => {
        if (isCurrent()) {
          this._handleProviderStart(session);
        }
      },
      onResult: (result) => {
        if (isCurrent()) {
          this._handleProviderResult(result);
        }
      },
      onError: (error) => {
        if (isCurrent()) {
          session.endReason = 'error';
          this._emitError(error);
        }
      },
      onEnd: () => {
        if (isCurrent()) {
          this._handleProviderEnd(session);
        }
      },
      onActivity: () => {
        if (isCurrent()) {
          this._armSilenceTimer();
        }
      },
    };
  }

  private _handleProviderStart(session: Session): void {
    this._setState('listening');

    // A handler of `igcStateChange` may have ended the session already.
    if (this._session !== session) {
      return;
    }

    this._announcement = this.resourceStrings.speechToTextListening;
    this.emitEvent('igcStart');
    this._armSilenceTimer();
  }

  private _handleProviderResult(result: SpeechToTextResultEventArgs): void {
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
    const reason = session.endReason ?? 'provider';
    // Capture the outcome first: a handler of `igcStateChange` may start a new
    // session, which resets the transcript.
    const detail: SpeechToTextEndEventArgs = {
      transcript: this.transcript,
      reason,
    };

    if (reason !== 'error') {
      this._announcement = this.resourceStrings.speechToTextStopped;
    }

    this._resetSession();
    this.emitEvent('igcEnd', { detail });
  }

  //#endregion

  //#region Internal API

  private _setState(value: SpeechToTextState): void {
    if (this._state === value) {
      return;
    }

    this._internals.setState(this._state, false);
    this._internals.setState(value, true);
    this._state = value;
    this.emitEvent('igcStateChange', { detail: value });
  }

  private _resetSession(): void {
    this._silenceTimer.stop();
    this._session = undefined;
    this._setState('idle');
  }

  private _armSilenceTimer(): void {
    if (this.silenceTimeout > 0 && this._state === 'listening') {
      this._silenceTimer.start(this.silenceTimeout);
    } else {
      this._silenceTimer.stop();
    }
  }

  private _end(reason: SpeechToTextEndReason, abort = false): void {
    const session = this._session;

    // A graceful stop is already in progress; only an abort can cut it short.
    if (!session || (this._state === 'stopping' && !abort)) {
      return;
    }

    if (this._state === 'starting') {
      // Nothing is captured yet. Drop the session so the outcome of the pending
      // start is ignored and let the provider tear down what it has set up.
      this._resetSession();
      session.provider.abort();
      return;
    }

    session.endReason = reason;
    this._silenceTimer.stop();
    this._setState('stopping');

    if (abort) {
      session.provider.abort();
    } else {
      session.provider.stop();
    }
  }

  private _emitError(error: SpeechToTextErrorEventArgs): void {
    this._announcement = `${this.resourceStrings.speechToTextError}: ${error.message}`;
    this.emitEvent('igcError', { detail: error });
  }

  //#endregion

  //#region Public API

  /**
   * Starts a recognition session. Does nothing while a session is active or when the component is disabled.
   * Emits `igcError` with code `not-supported` when the provider cannot run in the current environment.
   */
  public async start(): Promise<void> {
    if (this.disabled || this._state !== 'idle') {
      return;
    }

    const provider = this._resolvedProvider;

    if (!provider.isSupported) {
      this._emitError({
        code: 'not-supported',
        message: this.resourceStrings.speechToTextUnsupported,
      });
      return;
    }

    const session: Session = { provider };

    this._segments = [];
    this._session = session;
    this._setState('starting');

    try {
      await provider.start(
        {
          lang: this.locale,
          continuous: this.continuous,
          interimResults: this.interimResults,
          maxAlternatives: Math.max(
            1,
            Math.floor(asNumber(this.maxAlternatives, 1))
          ),
        },
        this._createListener(session)
      );
    } catch (error) {
      if (this._session === session) {
        const { code, message } = SpeechToTextProviderError.from(error);
        this._resetSession();
        this._emitError({ code, message });
      }
    }
  }

  /**
   * Stops capturing audio. The provider delivers its remaining final results before `igcEnd` is emitted.
   * A session that is still starting is aborted instead.
   */
  public stop(): void {
    this._end('manual');
  }

  /**
   * Ends the session immediately. Results that are not delivered yet are discarded.
   */
  public abort(): void {
    this._end('manual', true);
  }

  /**
   * Starts a session when idle, or stops the active one.
   */
  public async toggle(): Promise<void> {
    if (this._state === 'idle') {
      await this.start();
    } else if (this._state === 'listening') {
      this.stop();
    }
  }

  //#endregion

  protected override render() {
    const { supported, resourceStrings: strings } = this;
    let label = strings.speechToTextStop;

    if (!supported) {
      label = strings.speechToTextUnsupported;
    } else if (this._state === 'idle') {
      label = strings.speechToTextStart;
    }

    return html`
      <igc-icon-button
        part="button"
        variant=${this.variant}
        aria-label=${label}
        ?disabled=${this.disabled || !supported}
        @click=${this.toggle}
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
        ${this._announcement}
      </igc-visually-hidden>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-speech-to-text': IgcSpeechToTextComponent;
  }
}

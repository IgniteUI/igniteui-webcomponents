import { consume } from '@lit/context';
import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { EaseInOut } from '../../animations/easings.js';
import { addAnimationController } from '../../animations/player.js';
import { addThemingController } from '../../theming/theming-controller.js';
import { addSlotController, setSlots } from '../common/controllers/slot.js';
import { registerComponent } from '../common/definitions/register.js';
import { partMap } from '../common/part-map.js';
import type {
  HorizontalTransitionAnimation,
  StepperOrientation,
  StepperStepType,
  StepperTitlePosition,
  StepperVerticalAnimation,
} from '../types.js';
import { bodyAnimations, contentAnimations } from './common/animations.js';
import { STEPPER_CONTEXT, type StepperContext } from './common/context.js';
import type { StepperState } from './common/state.js';
import type IgcStepperComponent from './stepper.js';
import { styles as shared } from './themes/step/shared/step.common.css.js';
import { styles } from './themes/step/step.base.css.js';
import { all } from './themes/step/themes.js';

/**
 * A step component used within an `igc-stepper` to represent an individual step in a wizard-like workflow.
 *
 * @remarks
 * Each step has a header (with an indicator, title, and subtitle) and a content area.
 * Steps can be marked as `active`, `complete`, `disabled`, `optional`, or `invalid`
 * to control their appearance and behavior within the stepper.
 *
 * Custom indicators can be provided via the `indicator` slot, and the content area
 * is rendered in the default slot.
 *
 * @element igc-step
 *
 * @slot - Renders the content of the step.
 * @slot indicator - Renders the indicator of the step. By default, it displays the step index + 1.
 * @slot title - Renders the title of the step.
 * @slot subtitle - Renders the subtitle of the step.
 *
 * @csspart header-container - Wrapper of the step's `header` and its separators.
 * @csspart disabled - Indicates a disabled state. Applies to `header-container`.
 * @csspart complete-start - Indicates a complete state of the current step. Applies to `header-container`.
 * @csspart complete-end - Indicates a complete state of the previous step. Applies to `header-container`.
 * @csspart optional - Indicates an optional state. Applies to `header-container`.
 * @csspart invalid - Indicates an invalid state. Applies to `header-container`.
 * @csspart top - Indicates that the title should be above the indicator. Applies to `header-container`.
 * @csspart bottom - Indicates that the title should be below the indicator. Applies to `header-container`.
 * @csspart start - Indicates that the title should be before the indicator. Applies to `header-container`.
 * @csspart end - Indicates that the title should be after the indicator. Applies to `header-container`.
 * @csspart header - Wrapper of the step's `indicator` and `text`.
 * @csspart indicator - The indicator of the step.
 * @csspart text - Wrapper of the step's `title` and `subtitle`.
 * @csspart empty - Indicates that no title and subtitle have been provided to the step. Applies to `text`.
 * @csspart title - The title of the step.
 * @csspart subtitle - The subtitle of the step.
 * @csspart body - Wrapper of the step's `content`.
 * @csspart content - The step's `content`.
 *
 * @example
 * ```html
 * <igc-step>
 *   <igc-icon slot="indicator" name="home"></igc-icon>
 *   <span slot="title">Home</span>
 *   <span slot="subtitle">Return to the home page</span>
 *   <p>Welcome! This is the first step.</p>
 * </igc-step>
 * ```
 *
 * @example Step with state attributes
 * ```html
 * <igc-step complete>
 *   <span slot="title">Completed step</span>
 *   <p>This step has been completed.</p>
 * </igc-step>
 *
 * <igc-step active invalid>
 *   <span slot="title">Current step</span>
 *   <p>This step has validation errors.</p>
 * </igc-step>
 *
 * <igc-step disabled>
 *   <span slot="title">Disabled step</span>
 *   <p>This step is not accessible.</p>
 * </igc-step>
 * ```
 */
export default class IgcStepComponent extends LitElement {
  public static readonly tagName = 'igc-step';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcStepComponent);
  }

  //#region Internal state and properties

  private readonly _bodyRef = createRef<HTMLElement>();
  private readonly _contentRef = createRef<HTMLElement>();

  private readonly _bodyPlayer = addAnimationController(this, this._bodyRef);
  private readonly _contentPlayer = addAnimationController(
    this,
    this._contentRef
  );

  private readonly _slots = addSlotController(this, {
    slots: setSlots('indicator', 'title', 'subtitle'),
  });

  @consume({ context: STEPPER_CONTEXT, subscribe: true })
  private readonly _stepperContext?: StepperContext;

  private get _stepper(): IgcStepperComponent | undefined {
    return this._stepperContext?.stepper;
  }

  private get _state(): StepperState | undefined {
    return this._stepperContext?.state;
  }

  private get _isHorizontal(): boolean {
    return this._orientation === 'horizontal';
  }

  private get _hasTitle(): boolean {
    return this._slots.hasAssignedElements('title');
  }

  private get _hasSubtitle(): boolean {
    return this._slots.hasAssignedElements('subtitle');
  }

  private get _animation():
    | StepperVerticalAnimation
    | HorizontalTransitionAnimation {
    const animation = this._isHorizontal
      ? this._stepper?.horizontalAnimation
      : this._stepper?.verticalAnimation;

    return animation ?? (this._isHorizontal ? 'slide' : 'grow');
  }

  private get _animationDuration(): number {
    return this._stepper?.animationDuration ?? 320;
  }

  private get _contentTop(): boolean {
    return this._stepper?.contentTop ?? false;
  }

  private get _index(): number {
    return this._stepper?.steps.indexOf(this) ?? -1;
  }

  private get _orientation(): StepperOrientation {
    return this._stepper?.orientation ?? 'horizontal';
  }

  private get _titlePosition(): StepperTitlePosition {
    return this._stepper?.titlePosition ?? 'auto';
  }

  private get _stepType(): StepperStepType {
    return this._stepper?.stepType ?? 'full';
  }

  private get _previousComplete(): boolean {
    return this._state?.get(this)?.previousCompleted ?? false;
  }

  private get _visited(): boolean {
    return this._state?.get(this)?.visited ?? false;
  }

  private get _isAccessible(): boolean {
    return this._state?.isAccessible(this) ?? true;
  }

  //#endregion

  //#region Public attributes and properties

  /**
   * Whether the step is invalid.
   *
   * Invalid steps are styled with an error state and are not
   * interactive when the stepper is in linear mode.
   *
   * @attr invalid
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public invalid = false;

  /**
   * Whether the step is active.
   *
   * Active steps are styled with an active state and their content is visible.
   *
   * @attr active
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public active = false;

  /**
   * Whether the step is optional.
   *
   * Optional steps validity does not affect the default behavior when the stepper is in linear mode i.e.
   * if optional step is invalid the user could still move to the next step.
   *
   * @attr optional
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public optional = false;

  /**
   * Whether the step is disabled.
   *
   * Disabled steps are styled with a disabled state and are not interactive.
   *
   * @attr disabled
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  /**
   * Whether the step is completed.
   *
   * @attr complete
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public complete = false;

  //#endregion

  constructor() {
    super();
    addThemingController(this, all);
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (
      changed.has('active') ||
      changed.has('complete') ||
      changed.has('disabled') ||
      changed.has('invalid') ||
      changed.has('optional')
    ) {
      this._state?.onStepPropertyChanged(this, changed);
    }
  }

  /**
   * @hidden @internal
   * @deprecated since 5.4.0. Use the Stepper's `navigateTo` method instead.
   */
  public async toggleAnimation(
    type: 'in' | 'out',
    direction: 'normal' | 'reverse' = 'normal'
  ) {
    const bodyAnimation = bodyAnimations.get(this._animation)!.get(type)!;
    const contentAnimation = contentAnimations.get(this._animation)!.get(type)!;
    const bodyHeight = getComputedStyle(this).getPropertyValue(
      '--vertical-body-height'
    );

    const options: KeyframeAnimationOptions = {
      duration: this._animationDuration,
      easing: EaseInOut.Quad,
      direction,
    };

    const step = {
      height: bodyHeight,
    };

    const result = await Promise.all([
      this._bodyPlayer.playExclusive(
        bodyAnimation({ keyframe: options, step })
      ),
      this._contentPlayer.playExclusive(
        contentAnimation({ keyframe: options, step })
      ),
    ]);

    return result.every(Boolean);
  }

  private get _headerContainerParts() {
    return {
      'header-container': true,
      disabled: !this._isAccessible,
      'complete-start': this.complete,
      'complete-end': this._previousComplete,
      optional: this.optional,
      invalid:
        this.invalid && this._visited && !this.active && this._isAccessible,
      top: this._titlePosition === 'top',
      bottom:
        this._titlePosition === 'bottom' ||
        (this._isHorizontal && this._titlePosition === 'auto'),
      start: this._titlePosition === 'start',
      end:
        this._titlePosition === 'end' ||
        (!this._isHorizontal && this._titlePosition === 'auto'),
    };
  }

  private get _textParts() {
    const hasText = this._hasTitle || this._hasSubtitle;

    return {
      text: true,
      empty:
        this._stepType === 'indicator' ||
        (this._stepType === 'full' && !hasText),
    };
  }

  private _renderIndicator() {
    return this._stepType !== 'title'
      ? html`
          <div part="indicator">
            <slot name="indicator">
              <span>${this._index + 1}</span>
            </slot>
          </div>
        `
      : nothing;
  }

  private _renderTitleAndSubtitle() {
    return html`
      <div part=${partMap(this._textParts)}>
        <div part="title">
          <slot name="title"></slot>
        </div>
        <div part="subtitle">
          <slot name="subtitle"></slot>
        </div>
      </div>
    `;
  }

  private _renderHeader() {
    const index = this._index + 1;
    const size = this._stepper?.steps.length ?? 0;

    return html`
      <div part=${partMap(this._headerContainerParts)}>
        <div
          data-step-header
          role="tab"
          part="header"
          id="igc-step-header-${index}"
          aria-selected=${this.active}
          aria-controls="igc-step-content-${index}"
          aria-posinset=${index}
          aria-setsize=${size}
          tabindex=${this.active ? 0 : -1}
        >
          ${this._renderIndicator()} ${this._renderTitleAndSubtitle()}
        </div>
      </div>
    `;
  }

  private _renderContent() {
    const index = this._index + 1;

    return html`
      <div
        ${ref(this._bodyRef)}
        id="igc-step-content-${index}"
        part="body"
        role="tabpanel"
        aria-labelledby="igc-step-header-${index}"
      >
        <div ${ref(this._contentRef)} part="content">
          <slot></slot>
        </div>
      </div>
    `;
  }

  protected override render() {
    const renderBeforeHeader = this._contentTop && this._isHorizontal;

    return html`
      ${cache(
        renderBeforeHeader
          ? html`${this._renderContent()} ${this._renderHeader()}`
          : html`${this._renderHeader()} ${this._renderContent()}`
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-step': IgcStepComponent;
  }
}

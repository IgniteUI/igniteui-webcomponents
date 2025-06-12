import { LitElement, html, nothing } from 'lit';
import { property, query, queryAssignedElements } from 'lit/decorators.js';
import { type Ref, createRef, ref } from 'lit/directives/ref.js';
import { when } from 'lit/directives/when.js';

import { EaseInOut } from '../../animations/easings.js';
import { addAnimationController } from '../../animations/player.js';
import { themes } from '../../theming/theming-decorator.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import { partMap } from '../common/part-map.js';
import type {
  StepperOrientation,
  StepperStepType,
  StepperTitlePosition,
} from '../types.js';
import {
  type Animation,
  bodyAnimations,
  contentAnimations,
} from './animations.js';
import { styles as shared } from './themes/step/shared/step.common.css.js';
import { styles } from './themes/step/step.base.css.js';
import { all } from './themes/step/themes.js';

/**
 * The step component is used within the `igc-stepper` element and it holds the content of each step.
 * It also supports custom indicators, title and subtitle.
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
 * @csspart empty - Indicates that no title and subtitle has been provided to the step. Applies to `text`.
 * @csspart title - The title of the step.
 * @csspart subtitle - The subtitle of the step.
 * @csspart body - Wrapper of the step's `content`.
 * @csspart content - The steps `content`.
 */
@themes(all)
export default class IgcStepComponent extends LitElement {
  public static readonly tagName = 'igc-step';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcStepComponent);
  }

  private bodyRef: Ref<HTMLElement> = createRef();
  private contentRef: Ref<HTMLElement> = createRef();

  private bodyAnimationPlayer = addAnimationController(this, this.bodyRef);
  private contentAnimationPlayer = addAnimationController(
    this,
    this.contentRef
  );

  @queryAssignedElements({ slot: 'title' })
  private _titleChildren!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'subtitle' })
  private _subTitleChildren!: Array<HTMLElement>;

  /* blazorSuppress */
  @query('[part~="header"]')
  public header!: HTMLElement;

  /* blazorSuppress */
  @query('[part~="body"]')
  public contentBody!: HTMLElement;

  /** Gets/sets whether the step is invalid. */
  @property({ reflect: true, type: Boolean })
  public invalid = false;

  /** Gets/sets whether the step is activе. */
  @property({ reflect: true, type: Boolean })
  public active = false;

  /**
   * Gets/sets whether the step is optional.
   *
   * @remarks
   * Optional steps validity does not affect the default behavior when the stepper is in linear mode i.e.
   * if optional step is invalid the user could still move to the next step.
   */
  @property({ type: Boolean })
  public optional = false;

  /** Gets/sets whether the step is interactable. */
  @property({ reflect: true, type: Boolean })
  public disabled = false;

  /** Gets/sets whether the step is completed.
   *
   * @remarks
   * When set to `true` the following separator is styled `solid`.
   */
  @property({ reflect: true, type: Boolean })
  public complete = false;

  /** @hidden @internal @private */
  @property({ attribute: false })
  public previousComplete = false;

  /** @hidden @internal @private */
  @property({ attribute: false })
  public stepType: StepperStepType = 'full';

  /** @hidden @internal @private */
  @property({ attribute: false })
  public titlePosition: StepperTitlePosition = 'auto';

  /** @hidden @internal @private */
  @property({ attribute: false })
  public orientation: StepperOrientation = 'horizontal';

  /** @hidden @internal @private */
  @property({ attribute: false })
  public index = -1;

  /** @hidden @internal @private */
  @property({ attribute: false })
  public contentTop = false;

  /** @hidden @internal @private */
  @property({ attribute: false })
  public linearDisabled = false;

  /** @hidden @internal @private */
  @property({ attribute: false })
  public visited = false;

  /** @hidden @internal @private */
  @property({ attribute: false })
  public animation: Animation = 'fade';

  /** @hidden @internal @private */
  @property({ attribute: false })
  public animationDuration = 350;

  /**
   * @hidden @internal
   * @deprecated since 5.4.0. Use the Stepper's `navigateTo` method instead.
   */
  public async toggleAnimation(
    type: 'in' | 'out',
    direction: 'normal' | 'reverse' = 'normal'
  ) {
    const bodyAnimation = bodyAnimations.get(this.animation)!.get(type)!;
    const contentAnimation = contentAnimations.get(this.animation)!.get(type)!;
    const bodyHeight = window
      .getComputedStyle(this)
      .getPropertyValue('--vertical-body-height');

    const options: KeyframeAnimationOptions = {
      duration: this.animationDuration,
      easing: EaseInOut.Quad,
      direction,
    };

    const step = {
      height: bodyHeight,
    };

    const [_, event] = await Promise.all([
      this.bodyAnimationPlayer.stopAll(),
      this.bodyAnimationPlayer.play(bodyAnimation({ keyframe: options, step })),
      this.contentAnimationPlayer.stopAll(),
      this.contentAnimationPlayer.play(
        contentAnimation({ keyframe: options, step })
      ),
    ]);

    return event.type;
  }

  @watch('active', { waitUntilFirstUpdate: true })
  protected activeChange() {
    if (this.active) {
      this.dispatchEvent(
        new CustomEvent('stepActiveChanged', { bubbles: true, detail: false })
      );
    }
  }

  @watch('disabled', { waitUntilFirstUpdate: true })
  @watch('invalid', { waitUntilFirstUpdate: true })
  @watch('optional', { waitUntilFirstUpdate: true })
  protected disabledInvalidOptionalChange() {
    this.dispatchEvent(
      new CustomEvent('stepDisabledInvalidChanged', { bubbles: true })
    );
  }

  @watch('complete', { waitUntilFirstUpdate: true })
  protected completeChange() {
    this.dispatchEvent(
      new CustomEvent('stepCompleteChanged', { bubbles: true })
    );
  }

  private handleClick(event: MouseEvent): void {
    event.stopPropagation();
    if (this.isAccessible) {
      this.dispatchEvent(
        new CustomEvent('stepActiveChanged', { bubbles: true, detail: true })
      );
    }
  }

  private handleKeydown(event: KeyboardEvent): void {
    this.dispatchEvent(
      new CustomEvent('stepHeaderKeydown', {
        bubbles: true,
        detail: { event, focusedStep: this },
      })
    );
  }

  /** @hidden @internal */
  public get isAccessible(): boolean {
    return !this.disabled && !this.linearDisabled;
  }

  private get headerContainerParts() {
    return {
      'header-container': true,
      disabled: !this.isAccessible,
      'complete-start': this.complete,
      'complete-end': this.previousComplete,
      optional: this.optional,
      invalid:
        this.invalid && this.visited && !this.active && this.isAccessible,
      top: this.titlePosition === 'top',
      bottom:
        this.titlePosition === 'bottom' ||
        (this.orientation === 'horizontal' && this.titlePosition === 'auto'),
      start: this.titlePosition === 'start',
      end:
        this.titlePosition === 'end' ||
        (this.orientation === 'vertical' && this.titlePosition === 'auto'),
    };
  }

  private get textParts() {
    return {
      text: true,
      empty:
        this.stepType === 'indicator'
          ? true
          : this.stepType === 'full' &&
            !this._titleChildren.length &&
            !this._subTitleChildren.length,
    };
  }

  protected renderIndicator() {
    if (this.stepType !== 'title') {
      return html`
        <div part="indicator">
          <slot name="indicator">
            <span>${this.index + 1}</span>
          </slot>
        </div>
      `;
    }
    return nothing;
  }

  protected renderTitleAndSubtitle() {
    return html`
      <div part=${partMap(this.textParts)}>
        <div part="title">
          <slot name="title"></slot>
        </div>
        <div part="subtitle">
          <slot name="subtitle"></slot>
        </div>
      </div>
    `;
  }

  protected renderContent() {
    return html`<div
      ${ref(this.bodyRef)}
      id="igc-step-content-${this.index}"
      part="body"
      role="tabpanel"
      aria-labelledby="igc-step-header-${this.index}"
    >
      <div part="content" ${ref(this.contentRef)}>
        <slot></slot>
      </div>
    </div>`;
  }

  protected override render() {
    return html`
      ${when(
        this.contentTop && this.orientation === 'horizontal',
        () => this.renderContent(),
        () => nothing
      )}
      <div part=${partMap(this.headerContainerParts)}>
        <div
          part="header"
          tabindex="${this.active ? '0' : '-1'}"
          role="tab"
          aria-selected="${this.active}"
          @click=${this.handleClick}
          @keydown=${this.handleKeydown}
        >
          ${this.renderIndicator()} ${this.renderTitleAndSubtitle()}
        </div>
      </div>
      ${when(
        this.orientation === 'vertical' || !this.contentTop,
        () => this.renderContent(),
        () => nothing
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-step': IgcStepComponent;
  }
}

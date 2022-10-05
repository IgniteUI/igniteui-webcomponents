import { html, LitElement, nothing } from 'lit';
import { property, query, queryAssignedElements } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { watch } from '../common/decorators';
import { partNameMap } from '../common/util.js';
import { themes } from '../../theming';
import { styles } from './themes/step/light/step.base.css';
import { styles as bootstrap } from './themes/step/light/step.bootstrap.css';
import { styles as indigo } from './themes/step/light/step.indigo.css.js';
import { styles as fluent } from './themes/step/light/step.fluent.css.js';
import { styles as material } from './themes/step/light/step.material.css.js';

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
@themes({ bootstrap, indigo, fluent, material })
export default class IgcStepComponent extends LitElement {
  /** @private */
  public static readonly tagName = 'igc-step';
  /** @private */
  public static override styles = styles;

  @queryAssignedElements({ slot: 'title' })
  private _titleChildren!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'subtitle' })
  private _subTitleChildren!: Array<HTMLElement>;

  @query('[part~="header"]')
  public header!: HTMLElement;

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

  /** @private */
  @property({ attribute: false })
  public previousComplete = false;

  /** @private */
  @property({ attribute: false })
  public stepType: 'indicator' | 'title' | 'full' = 'full';

  /** @private */
  @property({ attribute: false })
  public titlePosition?: 'bottom' | 'top' | 'end' | 'start';

  /** @private */
  @property({ attribute: false })
  public orientation: 'horizontal' | 'vertical' = 'horizontal';

  /** @private */
  @property({ attribute: false })
  public index = -1;

  /** @private */
  @property({ attribute: false })
  public contentTop = false;

  /** @private */
  @property({ attribute: false })
  public linearDisabled = false;

  /** @private */
  @property({ attribute: false })
  public visited = false;

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
  protected disabledInvalidChange() {
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

  protected handleClick(event: MouseEvent): void {
    event.stopPropagation();
    if (this.isAccessible) {
      this.dispatchEvent(
        new CustomEvent('stepActiveChanged', { bubbles: true, detail: true })
      );
    }
  }

  protected handleKeydown(event: KeyboardEvent): void {
    this.dispatchEvent(
      new CustomEvent('stepHeaderKeydown', {
        bubbles: true,
        detail: { event, focusedStep: this },
      })
    );
  }

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
        (this.orientation === 'horizontal' && !this.titlePosition),
      start: this.titlePosition === 'start',
      end:
        this.titlePosition === 'end' ||
        (this.orientation === 'vertical' && !this.titlePosition),
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
    } else {
      return nothing;
    }
  }

  protected renderTitleAndSubtitle() {
    return html`
      <div part="${partNameMap(this.textParts)}">
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
      id="igc-step-content-${this.index}"
      part="body"
      role="tabpanel"
      aria-labelledby="igc-step-header-${this.index}"
    >
      <div part="content">
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
      <div part="${partNameMap(this.headerContainerParts)}">
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

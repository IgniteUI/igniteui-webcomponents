import { html, LitElement, nothing } from 'lit';
import { property, query, queryAssignedElements } from 'lit/decorators.js';
import { styles } from '../stepper/themes/step/step.base.css.js';
import { themes } from '../../theming';
import { partNameMap } from '../common/util.js';
import { watch } from '../common/decorators';

@themes({})
export default class IgcStepComponent extends LitElement {
  /** @private */
  public static readonly tagName = 'igc-step';

  /** @private */
  public static override styles = styles;

  @queryAssignedElements({ slot: 'title' })
  private _title!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'subtitle' })
  private _subTitle!: Array<HTMLElement>;

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
  public stepType: 'indicator' | 'title' | 'full' = 'full';

  /** @private */
  @property({ attribute: false })
  public titlePosition!: 'bottom' | 'top' | 'end' | 'start' | undefined;

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

  @watch('active')
  public activeChange() {
    if (this.active) {
      this.dispatchEvent(
        new CustomEvent('stepActiveChanged', { bubbles: true, detail: false })
      );
      this.setAttribute('aria-selected', 'true');
      if (this.contentBody) {
        this.contentBody.style.display = 'block';
      }
    } else {
      if (this.contentBody) {
        this.contentBody.style.display = 'none';
      }
    }
  }

  @watch('invalid')
  public invalidStateChanged() {
    this.dispatchEvent(
      new CustomEvent('stepInvalidStateChanged', {
        bubbles: true,
      })
    );
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'tab');
    this.setAttribute('aria-selected', 'false');
  }

  protected override async firstUpdated() {
    await this.updateComplete;

    if (!this.active) {
      this.contentBody.style.display = 'none';
    }
  }

  protected handleClick(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.disabled) {
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
      completed: this.complete,
      optional: this.optional,
      'active-header': this.active,
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
      empty: !this._title.length && !this._subTitle.length,
    };
  }

  private get bodyParts() {
    return {
      body: true,
      'active-body': this.active,
      'body-top': this.contentTop,
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
    if (this.stepType !== 'indicator') {
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
    } else {
      return nothing;
    }
  }

  protected renderContent() {
    return html`<div
      part="${partNameMap(this.bodyParts)}"
      role="tabpanel"
      id="igc-content-${this.index}"
      aria-labelledby="igc-step-${this.index}"
      tabindex="${this.active ? '0' : '-1'}"
    >
      <div part="content">
        <slot></slot>
      </div>
    </div>`;
  }

  protected override render() {
    return html`
      <div part="${partNameMap(this.headerContainerParts)}">
        <div
          part="header"
          @click=${this.handleClick}
          @keydown=${this.handleKeydown}
          tabindex="${this.active ? '0' : '-1'}"
        >
          ${this.renderIndicator()} ${this.renderTitleAndSubtitle()}
        </div>
      </div>
      ${this.renderContent()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-step': IgcStepComponent;
  }
}

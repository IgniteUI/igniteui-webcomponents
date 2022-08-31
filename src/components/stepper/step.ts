import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { styles } from '../stepper/themes/step/step.base.css.js';
import { themes } from '../../theming';
import { partNameMap } from '../common/util.js';

@themes({})
export default class IgcStepComponent extends LitElement {
  /** @private */
  public static readonly tagName = 'igc-step';

  /** @private */
  public static override styles = styles;

  /** Gets/sets whether the step is valid. */
  @property({ reflect: true, type: Boolean })
  public valid = true;

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
  public titlePosition: 'bottom' | 'top' | 'end' | 'start' = 'end';

  /** @private */
  @property({ attribute: false })
  public orientation: 'horizontal' | 'vertical' = 'horizontal';

  /** @private */
  @property({ attribute: false })
  public index = -1;

  /** @private */
  @property({ attribute: false })
  public contentTop = false;

  protected handleClick(event: MouseEvent): void {
    event.stopPropagation();
    // this.stepper?.activateStep(this);
  }

  private get stepParts() {
    return {
      step: true,
      vertical: this.orientation === 'vertical',
      horizontal: this.orientation === 'horizontal',
    };
  }

  private get headerContainerParts() {
    return {
      'header-container': true,
      disabled: this.disabled,
      optional: this.optional,
      'active-header': this.active,
      invalid: !this.valid && !this.active,
      top: this.titlePosition === 'top',
      bottom: this.titlePosition === 'bottom',
      start: this.titlePosition === 'start',
      end: this.titlePosition === 'end',
    };
  }

  private get bodyParts() {
    return {
      body: true,
      'active-body': this.active,
      'content-top':
        (this.orientation === 'horizontal' && this.contentTop) || false,
    };
  }

  protected renderIndicator() {
    if (this.stepType !== 'title') {
      return html`
        <div part="indicator">
          <slot name="indicator">
            <span part="inner">${this.index + 1}</span>
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
        <div part="text">
          <div part="title">
            <slot name="title"></slot>
          </div>
          <div part="subtitle">
            <slot name="sub-title"></slot>
          </div>
        </div>
      `;
    } else {
      return nothing;
    }
  }

  protected renderContent() {
    return html`<div part="${partNameMap(this.bodyParts)}">
      <div part="content">
        <slot></slot>
      </div>
    </div>`;
  }

  protected override render() {
    return html`
      <div part="${partNameMap(this.stepParts)}">
        <div part="${partNameMap(this.headerContainerParts)}">
          <div part="header" @click=${this.handleClick}>
            ${this.renderIndicator()} ${this.renderTitleAndSubtitle()}
          </div>
        </div>
        ${this.renderContent()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-step': IgcStepComponent;
  }
}

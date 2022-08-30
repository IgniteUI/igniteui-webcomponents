import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import IgcStepperComponent from './stepper';
import { styles } from '../stepper/themes/step.base.css.js';
import { themes } from '../../theming';
import { partNameMap } from '../common/util.js';

@themes({})
export default class IgcStepComponent extends LitElement {
  /** @private */
  public static readonly tagName = 'igc-step';

  /** @private */
  public static override styles = styles;

  /** A reference to the stepper the step is a part of. */
  public stepper?: IgcStepperComponent;

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

  public override connectedCallback(): void {
    super.connectedCallback();
    this.stepper = this.closest('igc-stepper') as IgcStepperComponent;
    this.part.add(
      this.stepper.orientation === 'horizontal' ? 'horizontal' : 'vertical'
    );
  }

  /** Gets the step index inside of the stepper. */
  public get index(): number {
    return this.stepper ? this.stepper.steps.indexOf(this) : -1;
  }

  private get headerParts() {
    return {
      header: true,
      top: this.stepper?.titlePosition === 'top',
      bottom: this.stepper?.titlePosition === 'bottom',
      start: this.stepper?.titlePosition === 'start',
      end: this.stepper?.titlePosition === 'end',
    };
  }

  private get headerContainerParts() {
    return {
      'header-container': true,
      disabled: this.disabled,
      optional: this.optional,
      'active-header': this.active,
      invalid: !this.valid && !this.active,
    };
  }

  private get bodyParts() {
    return {
      body: true,
      'active-body': this.active,
      'content-top':
        (this.stepper?.orientation === 'horizontal' &&
          this.stepper?.contentTop) ||
        false,
    };
  }

  protected renderIndicator() {
    if (this.stepper?.stepType !== 'title') {
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
    if (this.stepper?.stepType !== 'indicator') {
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
      <div part="${partNameMap(this.headerContainerParts)}">
        <div part="${partNameMap(this.headerParts)}">
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

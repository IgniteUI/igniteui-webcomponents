import { html, LitElement, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
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

  @query('[part="header"]')
  public header!: HTMLElement;

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
  public titlePosition: 'bottom' | 'top' | 'end' | 'start' = 'end';

  /** @private */
  @property({ attribute: false })
  public orientation: 'horizontal' | 'vertical' = 'horizontal';

  /** @private */
  @property({ attribute: false })
  public index = -1;

  /** @private */
  @property({ reflect: true, type: Boolean, attribute: 'content-top' })
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
        new CustomEvent('activeStepChanged', { bubbles: true, detail: false })
      );
      this.setAttribute('aria-selected', 'true');
      this.setAttribute('tabindex', '0');
    } else {
      this.setAttribute('tabindex', '-1');
    }
  }

  @watch('invalid')
  public invalidStateChanged() {
    if (this.invalid) {
      this.dispatchEvent(
        new CustomEvent('stepInvalidStateChanged', {
          bubbles: true,
        })
      );
    }
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'tab');
    this.setAttribute('aria-selected', 'false');
  }

  protected override async firstUpdated() {
    await this.updateComplete;
    console.log(this.header);

    this.header!.addEventListener('focusin', () => {
      this.dispatchEvent(
        new CustomEvent('focusHeader', { bubbles: true, detail: this })
      );
    });

    this.header!.addEventListener('focusout', () => {
      this.dispatchEvent(
        new CustomEvent('blurHeader', { bubbles: true, detail: this })
      );
    });
  }

  protected handleClick(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.disabled) {
      this.dispatchEvent(
        new CustomEvent('activeStepChanged', { bubbles: true, detail: true })
      );
    }
  }

  public get isAccessible(): boolean {
    return !this.disabled && !this.linearDisabled;
  }

  private get headerContainerParts() {
    return {
      'header-container': true,
      disabled: this.isAccessible,
      optional: this.optional,
      'active-header': this.active,
      invalid:
        this.invalid && this.visited && !this.active && this.isAccessible,
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
      <div
        part="content"
        role="tabpanel"
        id="igc-content-${this.index}"
        aria-labelledby="igc-step-${this.index}"
        tabindex="${this.active ? '0' : '-1'}"
      >
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
          tabindex="${this.active ? '0' : '-1'}"
        >
          <div part="header-inner">
            ${this.renderIndicator()} ${this.renderTitleAndSubtitle()}
          </div>
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

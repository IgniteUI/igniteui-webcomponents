import { html, LitElement } from 'lit';
import { property, query, queryAssignedElements } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { themes } from '../../theming';
import { watch } from '../common/decorators';
import { Constructor } from '../common/mixins/constructor';
import { EventEmitterMixin } from '../common/mixins/event-emitter';
import { styles } from './themes/light/dialog.base.css';
import { styles as bootstrap } from './themes/light/dialog.bootstrap.css';
import { styles as fluent } from './themes/light/dialog.fluent.css';
import { styles as indigo } from './themes/light/dialog.indigo.css';
import { styles as material } from './themes/light/dialog.material.css';

export interface IgcDialogEventMap {
  igcOpening: CustomEvent<void>;
  igcOpened: CustomEvent<void>;
  igcClosing: CustomEvent<void>;
  igcClosed: CustomEvent<void>;
}

/**
 * Represents a Dialog component.
 *
 * @element igc-dialog
 *
 * @fires igcOpening - Emitted just before the dialog is open.
 * @fires igcOpened - Emitted after the dialog is open.
 * @fires igcClosing - Emitter just before the dialog is closed.
 * @fires igcClosed - Emitted after closing the dialog.
 *
 * @slot - Renders content inside the default slot.
 * @slot title - Renders the title of the dialog header.
 * @slot footer - Renders the dialog footer.
 *
 * @csspart base - The base wrapper of the dialog.
 * @csspart title - The title container.
 * @csspart footer - The footer container.
 * @csspart overlay - The overlay.
 */
@themes({ bootstrap, material, fluent, indigo })
export default class IgcDialogComponent extends EventEmitterMixin<
  IgcDialogEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-dialog';
  public static styles = [styles];

  @query('[part="base"]')
  private nativeElement!: any;

  @queryAssignedElements({ slot: 'title' })
  private _titleElements!: Array<HTMLElement>;

  /** Whether the dialog should be closed when pressing 'ESC' button.  */
  @property({ type: Boolean, attribute: 'close-on-escape' })
  public closeOnEscape = true;

  /** Whether the dialog should be closed when clicking outside of it.  */
  @property({ type: Boolean, attribute: 'close-on-outside-click' })
  public closeOnOutsideClick = false;

  /** Whether the dialog is opened. */
  @property({ type: Boolean, reflect: true })
  public open = false;

  /** Sets the title of the dialog.  */
  @property({ type: String })
  public override title!: string;

  /** Sets the role attribute for the control. */
  @property({ reflect: true })
  public role: 'dialog' | 'alertdialog' = 'dialog';

  /** Sets the aria-label attribute for the control. */
  @property({ attribute: 'aria-label' })
  public override ariaLabel!: string;

  /** Sets the aria-labelledby attribute for the control. */
  @property({ reflect: true, attribute: 'aria-labelledby' })
  public ariaLabelledby!: string;

  /** Sets the aria-describedby attribute for the control. */
  @property({ reflect: true, attribute: 'aria-describedby' })
  public ariaDescribedby!: string;

  /** Sets the return value for the dialog. */
  @property({ type: String, attribute: 'return-value' })
  public returnValue!: string;

  @watch('open')
  protected async handleOpenState() {
    await this.updateComplete;

    if (this.nativeElement) {
      const hasOpenAttr = this.nativeElement.hasAttribute('open');

      if (this.open && !hasOpenAttr) {
        this.nativeElement.showModal();
      } else if (!this.open && hasOpenAttr) {
        this.nativeElement.close();
      }
    }
  }

  private handleCancel(event: Event) {
    event.preventDefault();

    if (this.closeOnEscape) {
      this.hide();
    }
  }

  private handleClick(ev: MouseEvent) {
    const el = ev.target as HTMLElement;
    const targetElement =
      el.tagName === 'SLOT' ? (el.parentElement as HTMLElement) : el;
    const rect = targetElement.getBoundingClientRect();

    const clickedInside =
      rect.top <= ev.clientY &&
      ev.clientY <= rect.top + rect.height &&
      rect.left <= ev.clientX &&
      ev.clientX <= rect.left + rect.width;

    if (!clickedInside && this.closeOnOutsideClick) {
      this.hide();
    }
  }

  private handleOpening() {
    const args = { cancelable: true };
    return this.emitEvent('igcOpening', args);
  }

  private handleClosing(): boolean {
    const args = { cancelable: true };
    return this.emitEvent('igcClosing', args);
  }

  /** Opens the dialog. */
  public show() {
    if (this.open) {
      return;
    }

    if (!this.handleOpening()) {
      return;
    }

    this.nativeElement.showModal();
    this.open = true;
    this.emitEvent('igcOpened');
  }

  /** Closes the dialog. */
  public hide() {
    if (!this.open) {
      return;
    }

    if (!this.handleClosing()) {
      return;
    }

    this.nativeElement.close();
    this.open = false;
    this.emitEvent('igcClosed');
  }

  /** Toggles the open state of the dialog. */
  public toggle() {
    if (this.open) {
      this.hide();
    } else {
      this.show();
    }
  }

  protected override render() {
    return html`
      <dialog
        part="base"
        @click=${this.handleClick}
        @cancel=${this.handleCancel}
        role=${this.role}
        aria-label=${ifDefined(this.ariaLabel)}
        aria-labelledby=${ifDefined(this.ariaLabelledby)}
        aria-describedby=${ifDefined(this.ariaDescribedby)}
      >
        <header part="title">
          <slot name="title"></slot>
          ${this._titleElements.length === 0
            ? html`<span>${this.title}</span>`
            : ''}
        </header>
        <section part="content">
          <slot></slot>
        </section>
        <footer part="footer">
          <slot name="footer"></slot>
        </footer>
      </dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-dialog': IgcDialogComponent;
  }
}

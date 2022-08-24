import { html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { watch } from '../common/decorators/watch.js';
import { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { createCounter } from '../common/util.js';
import { styles } from './themes/light/dialog.base.css.js';
import { styles as bootstrap } from './themes/light/dialog.bootstrap.css.js';
import { styles as fluent } from './themes/light/dialog.fluent.css.js';
import { styles as indigo } from './themes/light/dialog.indigo.css.js';
import { styles as material } from './themes/light/dialog.material.css.js';
import { themes } from '../../theming/theming-decorator.js';

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

  private static readonly increment = createCounter();

  private titleId = `title-${IgcDialogComponent.increment()}`;

  @query('dialog', true)
  private nativeElement!: HTMLDialogElement;

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

  /** Sets the return value for the dialog. */
  @property({ type: String, attribute: false })
  public returnValue!: string;

  @watch('open')
  protected async handleOpenState() {
    await this.updateComplete;

    if (this.nativeElement) {
      const hasOpenAttr = this.nativeElement.hasAttribute('open');

      if (this.open && !hasOpenAttr) {
        this.nativeElement.showModal();
        this.emitEvent('igcOpened');
      } else if (!this.open && hasOpenAttr) {
        this.nativeElement.close();
        this.emitEvent('igcClosed');
      }
    }
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

  private handleCancel(event: Event) {
    event.preventDefault();

    if (this.closeOnEscape) {
      this.hide();
    }
  }

  private handleClick(ev: MouseEvent) {
    const elements = ev
      .composedPath()
      .filter((e) => e instanceof HTMLElement)
      .map((e) => e as HTMLElement);
    const firstElement = elements[0];
    const firstElementRect = firstElement.getBoundingClientRect();
    const dialogElement = elements.filter(
      (e) => e.tagName.toLowerCase() === 'dialog'
    )[0];
    const dialogElementRect = dialogElement.getBoundingClientRect();

    let clientX = ev.clientX;
    let clientY = ev.clientY;
    if (firstElement !== dialogElement) {
      clientX = Math.max(ev.clientX, firstElementRect.left);
      clientY = Math.max(ev.clientY, firstElementRect.top);
    }

    const clickedInside =
      dialogElementRect.top <= clientY &&
      clientY <= dialogElementRect.bottom &&
      dialogElementRect.left <= clientX &&
      clientX <= dialogElementRect.right;

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

  private handleSlotChange(event: any) {
    const elements = event.target.assignedNodes({ flatten: true });
    elements.forEach((element: any) => {
      if (element.querySelector) {
        const form =
          element.querySelector('form') || element.querySelector('igc-form');
        if (form && form.getAttribute('method') === 'dialog') {
          const submitEvent =
            form.tagName.toLowerCase() === 'form' ? 'submit' : 'igcSubmit';
          form.addEventListener(submitEvent, (ev: any) => {
            const submitter = submitEvent === 'submit' ? ev.submitter : null;
            this.returnValue = submitter ? submitter.value : '';
            this.hide();
          });

          return;
        }
      }
    });
  }

  protected override render() {
    const label = this.ariaLabel ? this.ariaLabel : undefined;
    const labelledby = label ? undefined : this.titleId;

    return html`
      <div part="backdrop" aria-hidden="true" ?hidden=${!this.open}></div>
      <dialog
        part="base"
        role="dialog"
        @click=${this.handleClick}
        @cancel=${this.handleCancel}
        aria-label=${ifDefined(label)}
        aria-labelledby=${ifDefined(labelledby)}
      >
        <header part="title" id=${this.titleId}>
          <slot name="title"><span>${this.title}</span></slot>
        </header>
        <section part="content">
          <slot @slotchange=${this.handleSlotChange}></slot>
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

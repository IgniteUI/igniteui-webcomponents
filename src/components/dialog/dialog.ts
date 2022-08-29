import { html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { watch } from '../common/decorators/watch.js';
import { Constructor } from '../common/mixins/constructor.js';
import { blazorAdditionalDependencies } from '../common/decorators/blazorAdditionalDependencies.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { createCounter } from '../common/util.js';
import { styles } from './themes/light/dialog.base.css.js';
import { styles as bootstrap } from './themes/light/dialog.bootstrap.css.js';
import { styles as fluent } from './themes/light/dialog.fluent.css.js';
import { styles as indigo } from './themes/light/dialog.indigo.css.js';
import { styles as material } from './themes/light/dialog.material.css.js';
import { themes } from '../../theming/theming-decorator.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import IgcButtonComponent from '../button/button.js';

defineComponents(IgcButtonComponent);

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
@blazorAdditionalDependencies('IgcButtonComponent')
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
  @property()
  public override title!: string;

  /** Sets the return value for the dialog. */
  @property({ attribute: false })
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
    this.open ? this.hide() : this.show();
  }

  private handleCancel(event: Event) {
    event.preventDefault();

    if (this.closeOnEscape) {
      this.hide();
    }
  }

  private handleClick({ clientX, clientY, target }: MouseEvent) {
    if (
      this.closeOnOutsideClick &&
      this.nativeElement.isSameNode(target as Node)
    ) {
      const { left, top, right, bottom } =
        this.nativeElement.getBoundingClientRect();
      const between = (x: number, low: number, high: number) =>
        x >= low && x <= high;
      if (!(between(clientX, left, right) && between(clientY, top, bottom))) {
        this.hide();
      }
    }
  }

  private handleOpening() {
    return this.emitEvent('igcOpening', { cancelable: true });
  }

  private handleClosing(): boolean {
    return this.emitEvent('igcClosing', { cancelable: true });
  }

  protected formSubmitHandler = (e: Event) => {
    if (e instanceof SubmitEvent && e.submitter) {
      this.returnValue = (e.submitter as any)?.value || '';
    }
    if (!e.defaultPrevented) {
      this.hide();
    }
  };

  private handleSlotChange() {
    // Setup submit handling for supported forms
    Array.from(this.querySelectorAll('igc-form, form'))
      .filter((each) => each.getAttribute('method') === 'dialog')
      .forEach((form) => {
        const event = /igc-form/i.test(form.tagName) ? 'igcSubmit' : 'submit';
        form.removeEventListener(event, this.formSubmitHandler);
        form.addEventListener(event, this.formSubmitHandler);
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
          <slot name="footer"
            ><igc-button variant="flat" @click=${this.hide}
              >OK</igc-button
            ></slot
          >
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

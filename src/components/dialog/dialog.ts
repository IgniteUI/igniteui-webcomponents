import { html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { themes } from '../../theming';
import { Constructor } from '../common/mixins/constructor';
import { EventEmitterMixin } from '../common/mixins/event-emitter';
import { styles } from './themes/dialog.base.css';
import { styles as bootstrap } from './themes/dialog.bootstrap.css';
import { styles as fluent } from './themes/dialog.fluent.css';
import { styles as indigo } from './themes/dialog.indigo.css';
import { styles as material } from './themes/dialog.material.css';

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

  private _open = false;

  @query('[part="base"]', true)
  private nativeElement!: any;

  /** Whether the dialog should be closed when pressing 'ESC' button.  */
  @property({ type: Boolean, attribute: 'close-on-escape' })
  public closeOnEscape = true;

  /** Whether the dialog should be closed when clicking outside of it.  */
  @property({ type: Boolean, attribute: 'close-on-outside-click' })
  public closeOnOutsideClick = false;

  /** Sets the title of the dialog.  */
  @property({ type: String })
  public override title!: string;

  /** Whether the dialog is opened. */
  @property({ type: Boolean })
  public get open() {
    return this._open;
  }

  /** Sets the return value for the dialog. */
  @property({ type: String, attribute: 'return-value' })
  public returnValue!: string;

  /** Opens the dialog. */
  public show() {
    if (!this._open) {
      if (!this.handleOpening()) {
        return;
      }

      this.nativeElement.showModal();
      this._open = true;
      this.emitEvent('igcOpened');
    }
  }

  /** Closes the dialog. */
  public hide() {
    if (this._open) {
      if (!this.handleClosing()) {
        return;
      }

      this.nativeElement.close();
      this._open = false;
      this.emitEvent('igcClosed');
    }
  }

  /** Toggles the open state of the dialog. */
  public toggle() {
    if (this._open) {
      this.hide();
    } else {
      this.show();
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

  protected override render() {
    return html`
      <dialog part="base">
        <header part="title">
          <slot name="title"></slot>
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

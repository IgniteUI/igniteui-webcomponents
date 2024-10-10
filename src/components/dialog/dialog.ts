import { LitElement, html, nothing } from 'lit';
import { property, queryAssignedElements, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { type Ref, createRef, ref } from 'lit/directives/ref.js';

import { addAnimationController } from '../../animations/player.js';
import { fadeIn, fadeOut } from '../../animations/presets/fade/index.js';
import { themes } from '../../theming/theming-decorator.js';
import IgcButtonComponent from '../button/button.js';
import { blazorAdditionalDependencies } from '../common/decorators/blazorAdditionalDependencies.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import {
  createCounter,
  numberInRangeInclusive,
  partNameMap,
} from '../common/util.js';
import { styles } from './themes/dialog.base.css.js';
import { styles as shared } from './themes/shared/dialog.common.css.js';
import { all } from './themes/themes.js';

export interface IgcDialogComponentEventMap {
  igcClosing: CustomEvent<void>;
  igcClosed: CustomEvent<void>;
}

/**
 * Represents a Dialog component.
 *
 * @element igc-dialog
 *
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
@themes(all)
@blazorAdditionalDependencies('IgcButtonComponent')
export default class IgcDialogComponent extends EventEmitterMixin<
  IgcDialogComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-dialog';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcDialogComponent, IgcButtonComponent);
  }

  private static readonly increment = createCounter();
  private titleId = `title-${IgcDialogComponent.increment()}`;

  private dialogRef: Ref<HTMLDialogElement> = createRef();
  private animationPlayer = addAnimationController(this, this.dialogRef);

  /**
   * Backdrop animation helper.
   */
  @state()
  private animating = false;

  private get dialog() {
    return this.dialogRef.value!;
  }

  @queryAssignedElements({ slot: 'title' })
  private titleElements!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'footer' })
  private footerElements!: Array<HTMLElement>;

  /**
   * Whether the dialog should be kept open when pressing the 'ESCAPE' button.
   * @attr keep-open-on-escape
   */
  @property({ type: Boolean, attribute: 'keep-open-on-escape' })
  public keepOpenOnEscape = false;

  /**
   * Whether the dialog should be closed when clicking outside of it.
   * @attr close-on-outside-click
   */
  @property({ type: Boolean, attribute: 'close-on-outside-click' })
  public closeOnOutsideClick = false;

  /**
   * Whether to hide the default action button for the dialog.
   *
   * When there is projected content in the `footer` slot this property
   * has no effect.
   * @attr hide-default-action
   */
  @property({ type: Boolean, attribute: 'hide-default-action' })
  public hideDefaultAction = false;

  /**
   * Whether the dialog is opened.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public open = false;

  /**
   * Sets the title of the dialog.
   * @attr
   */
  @property()
  public override title!: string;

  /** Sets the return value for the dialog. */
  @property({ attribute: false })
  public returnValue!: string;

  @watch('open', { waitUntilFirstUpdate: true })
  protected handleOpenState() {
    this.open ? this.dialog.showModal() : this.dialog.close();
  }

  protected override createRenderRoot() {
    const root = super.createRenderRoot();
    root.addEventListener('slotchange', () => this.requestUpdate());
    return root;
  }

  protected override firstUpdated() {
    if (this.open) {
      this.dialog.showModal();
    }
  }

  private async toggleAnimation(dir: 'open' | 'close') {
    const animation = dir === 'open' ? fadeIn : fadeOut;

    const [_, event] = await Promise.all([
      this.animationPlayer.stopAll(),
      this.animationPlayer.play(animation()),
    ]);

    return event.type === 'finish';
  }

  private async _hide(emitEvent = false) {
    if (!this.open || (emitEvent && !this.emitClosing())) {
      return false;
    }

    this.animating = true;
    await this.toggleAnimation('close');
    this.open = false;
    this.animating = false;

    if (emitEvent) {
      await this.updateComplete;
      this.emitEvent('igcClosed');
    }

    return true;
  }

  /** Opens the dialog. */
  public async show(): Promise<boolean> {
    if (this.open) {
      return false;
    }

    this.open = true;
    await this.toggleAnimation('open');
    return true;
  }

  /** Closes the dialog. */
  public async hide(): Promise<boolean> {
    return this._hide();
  }

  /** Toggles the open state of the dialog. */
  public async toggle(): Promise<boolean> {
    return this.open ? this.hide() : this.show();
  }

  private handleCancel(event: Event) {
    event.preventDefault();

    if (!this.keepOpenOnEscape) {
      this._hide(true);
    }
  }

  private handleClick({ clientX, clientY, target }: PointerEvent) {
    if (this.closeOnOutsideClick && this.dialog === target) {
      const rect = this.dialog.getBoundingClientRect();
      const inX = numberInRangeInclusive(clientX, rect.left, rect.right);
      const inY = numberInRangeInclusive(clientY, rect.top, rect.bottom);

      if (!(inX && inY)) {
        this._hide(true);
      }
    }
  }

  private emitClosing(): boolean {
    return this.emitEvent('igcClosing', { cancelable: true });
  }

  protected formSubmitHandler = (e: SubmitEvent) => {
    if (e.submitter) {
      this.returnValue = (e.submitter as any)?.value ?? '';
    }

    if (!e.defaultPrevented) {
      this._hide(true);
    }
  };

  private handleContentChange() {
    // Setup submit handling for forms
    const forms = this.querySelectorAll<HTMLFormElement>(
      'form[method="dialog"]'
    );

    for (const form of forms) {
      form.removeEventListener('submit', this.formSubmitHandler);
      form.addEventListener('submit', this.formSubmitHandler);
    }
  }

  protected override render() {
    const label = this.ariaLabel ? this.ariaLabel : undefined;
    const labelledby = label ? undefined : this.titleId;
    const backdropParts = partNameMap({
      backdrop: true,
      animating: this.animating,
    });
    const baseParts = partNameMap({
      base: true,
      titled: this.titleElements.length > 0 || this.title,
      footed: this.footerElements.length > 0 || !this.hideDefaultAction,
    });

    return html`
      <div part=${backdropParts} aria-hidden=${!this.open}></div>
      <dialog
        ${ref(this.dialogRef)}
        part=${baseParts}
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
          <slot @slotchange=${this.handleContentChange}></slot>
        </section>
        <footer part="footer">
          <slot name="footer">
            ${this.hideDefaultAction
              ? nothing
              : html`<igc-button variant="flat" @click=${() => this._hide(true)}
                  >OK</igc-button
                >`}
          </slot>
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

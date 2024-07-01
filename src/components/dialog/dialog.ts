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
import { createCounter, partNameMap } from '../common/util.js';
import { styles } from './themes/dialog.base.css.js';
import { styles as shared } from './themes/shared/dialog.common.css.js';
import { all } from './themes/themes.js';

export interface IgcDialogEventMap {
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
  IgcDialogEventMap,
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
   * Backdrop animation helper.
   * @hidden @internal
   */
  @state()
  private animating = false;

  /**
   * Sets the title of the dialog.
   * @attr
   */
  @property()
  public override title!: string;

  /** Sets the return value for the dialog. */
  @property({ attribute: false })
  public returnValue!: string;

  protected resolvePartNames(base: string) {
    return {
      [base]: true,
      titled: this.titleElements.length > 0 || this.title,
      footed: this.footerElements.length > 0 || !this.hideDefaultAction,
    };
  }

  @watch('open', { waitUntilFirstUpdate: true })
  protected handleOpenState() {
    this.open ? this.dialog.showModal() : this.dialog.close();
  }

  protected override async firstUpdated() {
    await this.updateComplete;
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

  /** Opens the dialog. */
  public show() {
    if (this.open) {
      return;
    }

    this.toggleAnimation('open');
    this.open = true;
  }

  /** Closes the dialog. */
  public async hide() {
    if (!this.open) {
      return;
    }

    this.animating = true;

    if (await this.toggleAnimation('close')) {
      this.animating = false;
      this.open = false;
    }
  }

  /** Toggles the open state of the dialog. */
  public toggle() {
    this.open ? this.hide() : this.show();
  }

  protected async hideWithEvent() {
    if (!this.open) {
      return;
    }

    if (!this.handleClosing()) {
      return;
    }

    this.animating = true;

    if (await this.toggleAnimation('close')) {
      this.open = false;
      this.animating = false;
      await this.updateComplete;
      this.emitEvent('igcClosed');
    }
  }

  private handleCancel(event: Event) {
    event.preventDefault();

    if (!this.keepOpenOnEscape) {
      this.hideWithEvent();
    }
  }

  private handleClick({ clientX, clientY, target }: MouseEvent) {
    if (this.closeOnOutsideClick && this.dialog === target) {
      const { left, top, right, bottom } = this.dialog.getBoundingClientRect();
      const between = (x: number, low: number, high: number) =>
        x >= low && x <= high;
      if (!(between(clientX, left, right) && between(clientY, top, bottom))) {
        this.hideWithEvent();
      }
    }
  }

  private handleClosing(): boolean {
    return this.emitEvent('igcClosing', { cancelable: true });
  }

  protected formSubmitHandler = (e: Event) => {
    if (e instanceof SubmitEvent && e.submitter) {
      this.returnValue = (e.submitter as any)?.value || '';
    }
    if (!e.defaultPrevented) {
      this.hideWithEvent();
    }
  };

  private slotChanged() {
    this.requestUpdate();
  }

  private handleContentChange() {
    // Setup submit handling for supported forms
    for (const form of this.querySelectorAll('igc-form, form')) {
      if (form.getAttribute('method') !== 'dialog') {
        continue;
      }

      const eventName = form.matches('form') ? 'submit' : 'igcSubmit';
      form.removeEventListener(eventName, this.formSubmitHandler);
      form.addEventListener(eventName, this.formSubmitHandler);
    }

    this.slotChanged();
  }

  protected override render() {
    const label = this.ariaLabel ? this.ariaLabel : undefined;
    const labelledby = label ? undefined : this.titleId;
    const backdropParts = partNameMap({
      backdrop: true,
      animating: this.animating,
    });

    return html`
      <div part=${backdropParts} aria-hidden=${!this.open}></div>
      <dialog
        ${ref(this.dialogRef)}
        part="${partNameMap(this.resolvePartNames('base'))}"
        role="dialog"
        @click=${this.handleClick}
        @cancel=${this.handleCancel}
        aria-label=${ifDefined(label)}
        aria-labelledby=${ifDefined(labelledby)}
      >
        <header part="title" id=${this.titleId}>
          <slot name="title" @slotchange=${this.slotChanged}
            ><span>${this.title}</span></slot
          >
        </header>
        <section part="content">
          <slot @slotchange=${this.handleContentChange}></slot>
        </section>
        <footer part="footer">
          <slot name="footer" @slotchange=${this.slotChanged}>
            ${this.hideDefaultAction
              ? nothing
              : html`<igc-button variant="flat" @click=${this.hideWithEvent}
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

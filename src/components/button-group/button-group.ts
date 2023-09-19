import { LitElement, html } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';
import { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { watch } from '../common/decorators/watch.js';
import { createCounter } from '../common/util.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import IgcToggleButtonComponent from './toggle-button.js';
import { themes } from '../../theming';
import { styles } from '../button-group/themes/light/button-group.base.css.js';
import { styles as bootstrap } from '../button-group/themes/light/button-group.bootstrap.css.js';
import { styles as material } from '../button-group/themes/light/button-group.material.css.js';
import { styles as fluent } from '../button-group/themes/light/button-group.fluent.css.js';
import { styles as indigo } from '../button-group/themes/light/button-group.indigo.css.js';

defineComponents(IgcToggleButtonComponent);

export interface IgcButtonGroupSelectionEventArgs {
  button: IgcToggleButtonComponent;
  value: string | undefined;
}

export interface IgcButtonGroupComponentEventMap {
  igcSelect: CustomEvent<IgcButtonGroupSelectionEventArgs>;
}

@themes({ bootstrap, material, fluent, indigo })

/**
 * The `igc-button-group` groups a series of buttons together, exposing features such as layout and selection.
 * The component makes use of `igc-toggle-button`.
 *
 * @element igc-button-group
 *
 * @slot - renders the default content
 *
 * @fires igcSelect - Emitted when the selection state of the underlying buttons is changing, before the selection completes.
 *
 */
export default class IgcButtonGroupComponent extends EventEmitterMixin<
  IgcButtonGroupComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-button-group';
  public static styles = styles;

  private static readonly increment = createCounter();

  private mutationObserver!: MutationObserver;
  private _selection: string[] = [];

  private get _selectedButtons(): Array<IgcToggleButtonComponent> {
    return this.toggleButtons.filter((b) => b.selected);
  }

  @queryAssignedElements({ selector: 'igc-toggle-button' })
  private toggleButtons!: Array<IgcToggleButtonComponent>;

  /**
   * Enables selection of multiple buttons.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public multiple = false;

  /**
   * Disables all buttons inside the group.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  /**
   * Sets the orientation of the buttons in the group.
   * @attr
   */
  @property({ reflect: true })
  public alignment: 'horizontal' | 'vertical' = 'horizontal';

  /**
   * Gets/Sets the currently selected buttons (their values).
   * @attr
   */
  @property({ type: Array, reflect: false })
  public get selection() {
    return this._selectedButtons.map((b) => b.value).filter((v) => v);
  }

  public set selection(values: string[]) {
    if (values && values.length) {
      this._selection = values;
      this.setSelection(values);
    }
  }

  @watch('disabled', { waitUntilFirstUpdate: true })
  protected updateDisabledState() {
    this.toggleButtons.forEach((b) => (b.disabled = this.disabled));
  }

  @watch('multiple', { waitUntilFirstUpdate: true })
  protected updateMultipleState() {
    if (this._selectedButtons.length) {
      this.toggleButtons.forEach((b) => (b.selected = false));
    }
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    this.id =
      this.getAttribute('id') ||
      `igc-button-group-${IgcButtonGroupComponent.increment()}`;
  }

  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.mutationObserver.disconnect();
  }

  protected override firstUpdated(): void {
    if (this.disabled) {
      this.updateDisabledState();
    }

    // Button level selection has higher priority
    if (this._selection.length && !this._selectedButtons.length) {
      this.setSelection(this._selection);
    } else if (!this.multiple && this._selectedButtons.length > 1) {
      const index = this._selectedButtons.indexOf(
        this._selectedButtons.at(-1) as IgcToggleButtonComponent
      );

      for (let i = 0; i < index; i++) {
        this._selectedButtons[i].selected = false;
      }
    }

    this.setMutationsObserver();
  }

  private handleClick = (event: MouseEvent) => {
    const button = event
      .composedPath()
      .find(
        (element) => element instanceof IgcToggleButtonComponent
      ) as IgcToggleButtonComponent;

    if (button) {
      const args: IgcButtonGroupSelectionEventArgs = {
        button: button,
        value: button.value,
      };

      const allowed = this.emitEvent('igcSelect', {
        cancelable: true,
        detail: args,
      });

      if (allowed) {
        button.selected = !button.selected;
      }
    }
  };

  private setSelection(values: string[]) {
    values = values.filter(
      (v) => this.toggleButtons.map((b) => b.value).indexOf(v) !== -1
    );

    const buttons = this.toggleButtons.filter(
      (b) => values.indexOf(b.value) !== -1
    );

    if (buttons.length) {
      if (this.multiple) {
        buttons.forEach((b) => (b.selected = true));
      } else {
        buttons.find((b) => b.value === values.at(-1))!.selected = true;
      }
    }
  }

  private setMutationsObserver() {
    this.mutationObserver = new MutationObserver(
      async (mutations, observer) => {
        // Stop observing while handling changes
        observer.disconnect();

        const button = mutations[0].target as IgcToggleButtonComponent;
        const index = this.toggleButtons.indexOf(button);

        if (!this.multiple && this._selectedButtons.length > 1) {
          this.toggleButtons.forEach((b, i) => {
            if (b.selected && i !== index) {
              b.selected = false;
            }
          });
        }

        // Watch for changes again
        await this.updateComplete;
        this.toggleButtons.forEach((b) => {
          observer.observe(b, {
            attributes: true,
            attributeFilter: ['selected'],
          });
        });
      }
    );

    this.toggleButtons.forEach((b) => {
      this.mutationObserver.observe(b, {
        attributes: true,
        attributeFilter: ['selected'],
      });
    });
  }

  protected override render() {
    return html`
      <div
        part="group"
        role="group"
        aria-disabled=${this.disabled}
        @click=${this.handleClick}
      >
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-button-group': IgcButtonGroupComponent;
  }
}

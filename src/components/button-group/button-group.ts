import { LitElement, html } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';
import { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { watch } from '../common/decorators/watch.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import IgcToggleButtonComponent from './toggle-button.js';
import { themes } from '../../theming';
import { styles } from '../button-group/themes/light/button-group.base.css.js';
import { styles as bootstrap } from '../button-group/themes/light/button-group.bootstrap.css.js';
import { styles as material } from '../button-group/themes/light/button-group.material.css.js';
import { styles as fluent } from '../button-group/themes/light/button-group.fluent.css.js';
import { styles as indigo } from '../button-group/themes/light/button-group.indigo.css.js';

defineComponents(IgcToggleButtonComponent);

export interface IgcButtonGroupComponentEventMap {
  igcSelect: CustomEvent<string | undefined>;
  igcDeselect: CustomEvent<string | undefined>;
}

/**
 * The `igc-button-group` groups a series of `igc-toggle-button`s together, exposing features such as layout and selection.
 *
 * @element igc-button-group
 *
 * @slot - Renders `igc-toggle-button` component.
 *
 * @fires igcSelect - Emitted when a button is selected through user interaction.
 * @fires igcDeselect - Emitted when a button is deselected through user interaction.
 *
 * @csspart group - The button group container.
 */
@themes({ bootstrap, material, fluent, indigo })
export default class IgcButtonGroupComponent extends EventEmitterMixin<
  IgcButtonGroupComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-button-group';
  public static styles = styles;

  private _selectedItems: Set<string> = new Set();

  private mutationObserver: MutationObserver = this.setMutationsObserver();
  private observerConfig: MutationObserverInit = {
    attributeFilter: ['selected'],
    childList: true,
    subtree: true,
  };

  private get _selectedButtons(): Array<IgcToggleButtonComponent> {
    return this.toggleButtons.filter((b) => b.selected);
  }

  @queryAssignedElements({ selector: 'igc-toggle-button' })
  private toggleButtons!: Array<IgcToggleButtonComponent>;

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
   * Controls the mode of selection for the button group.
   * @attr
   */
  @property({ reflect: false })
  public selection: 'single' | 'single-required' | 'multiple' = 'single';

  /**
   * Gets/Sets the currently selected buttons (their values).
   * @attr
   */
  @property({ attribute: 'selected-items', type: Array, reflect: false })
  public get selectedItems() {
    return this._selectedButtons.map((b) => b.value).filter((v) => v);
  }

  public set selectedItems(values: string[]) {
    if (values && values.length) {
      this._selectedItems = new Set(values);
      this.setSelection(this._selectedItems);
    }
  }

  @watch('disabled', { waitUntilFirstUpdate: true })
  protected updateDisabledState() {
    this.toggleButtons.forEach((b) => (b.disabled = this.disabled));
  }

  @watch('selection', { waitUntilFirstUpdate: true })
  protected updateSelectionState() {
    if (this._selectedButtons.length) {
      this.toggleButtons.forEach((b) => (b.selected = false));
    }
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.mutationObserver.observe(this, this.observerConfig);
  }

  public override disconnectedCallback() {
    this.mutationObserver.disconnect();
    super.disconnectedCallback();
  }

  protected override firstUpdated() {
    if (this.disabled) {
      this.updateDisabledState();
    }

    const buttons = this._selectedButtons;

    if (buttons.length) {
      if (this.selection !== 'multiple') {
        const index = buttons.indexOf(buttons.at(-1)!);

        for (let i = 0; i < index; i++) {
          buttons[i].selected = false;
        }
      }
    } else {
      this.setSelection(this._selectedItems);
    }
  }

  private handleClick(event: MouseEvent) {
    const button = event
      .composedPath()
      .find(
        (element) => element instanceof IgcToggleButtonComponent
      ) as IgcToggleButtonComponent;

    if (button) {
      this.selection === 'multiple'
        ? this.handleMultipleSelection(button)
        : this.handleSingleSelection(button);
    }
  }

  private handleSingleSelection(button: IgcToggleButtonComponent) {
    const singleRequired = this.selection === 'single-required';
    const selectedButton = this._selectedButtons.at(0);
    const isSame = selectedButton && selectedButton.value === button.value;

    if (selectedButton) {
      if (singleRequired && isSame) return;
      this.emitDeselectEvent(selectedButton);
    }
    if (isSame) return;
    this.emitSelectEvent(button);
  }

  private handleMultipleSelection(button: IgcToggleButtonComponent) {
    button.selected
      ? this.emitDeselectEvent(button)
      : this.emitSelectEvent(button);
  }

  private emitSelectEvent(button: IgcToggleButtonComponent) {
    const select = this.emitEvent('igcSelect', {
      cancelable: true,
      detail: button.value,
    });

    if (select) {
      button.selected = true;
    }
  }

  private emitDeselectEvent(button: IgcToggleButtonComponent) {
    const deselect = this.emitEvent('igcDeselect', {
      cancelable: true,
      detail: button.value,
    });

    if (deselect) {
      button.selected = false;
    }
  }

  private setSelection(values: Set<string>) {
    for (const button of this.toggleButtons) {
      if (values.has(button.value)) {
        button.selected = true;
        if (this.selection !== 'multiple') {
          break;
        }
      }
    }
  }

  private setMutationsObserver() {
    return new MutationObserver((records, observer) => {
      // Stop observing while handling changes
      observer.disconnect();

      if (this.selection !== 'multiple' && this._selectedButtons.length > 1) {
        const added = this.getAddedButtons(records);

        const button = added.buttons.length
          ? (added.buttons.at(-1) as IgcToggleButtonComponent)
          : (records.at(-1)?.target as IgcToggleButtonComponent);

        const index = this.toggleButtons.indexOf(button);

        this.toggleButtons.forEach((b, i) => {
          if (b.selected && i !== index) {
            b.selected = false;
          }
        });
      }

      // Watch for changes again
      observer.observe(this, this.observerConfig);
    });
  }

  private getAddedButtons(records: MutationRecord[]) {
    const added: { buttons: IgcToggleButtonComponent[] } = { buttons: [] };

    records
      .filter((x) => x.type === 'childList')
      .reduce((prev, curr) => {
        prev.buttons = prev.buttons.concat(
          Array.from(curr.addedNodes).map(
            (node) => node as IgcToggleButtonComponent
          )
        );
        return prev;
      }, added);

    return added;
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

import { LitElement, html } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';
import { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { watch } from '../common/decorators/watch.js';
import { createCounter } from '../common/util.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { styles } from './themes/light/button-group.base.css.js';
import IgcToggleButtonComponent from './toggle-button.js';

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
 */
export default class IgcButtonGroupComponent extends EventEmitterMixin<
  IgcButtonGroupComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-button-group';
  public static styles = styles;

  private static readonly increment = createCounter();

  private _selectedItems: string[] = [];

  private mutationObserver!: MutationObserver;
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
      this._selectedItems = values;
      this.setSelection(values);
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
    this.id =
      this.getAttribute('id') ||
      `igc-button-group-${IgcButtonGroupComponent.increment()}`;
  }

  public override disconnectedCallback() {
    super.disconnectedCallback();
    this.mutationObserver.disconnect();
  }

  protected override firstUpdated() {
    if (this.disabled) {
      this.updateDisabledState();
    }

    // Button level selection takes priority
    if (this._selectedItems.length && !this._selectedButtons.length) {
      this.setSelection(this._selectedItems);
    } else if (
      this.selection !== 'multiple' &&
      this._selectedButtons.length > 1
    ) {
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
      switch (this.selection) {
        case 'single':
          this.handleSingleSelection(button);
          break;
        case 'single-required':
          this.handleSingleSelection(button, true);
          break;
        case 'multiple':
          this.handleMultipleSelection(button);
          break;
      }
    }
  };

  private handleSingleSelection(
    button: IgcToggleButtonComponent,
    required = false
  ) {
    const selectedButton = this._selectedButtons[0];

    if (selectedButton) {
      if (required && selectedButton.value === button.value) return;

      this.emitDeselectEvent(selectedButton);
    }

    if (!required && selectedButton && selectedButton.value === button.value)
      return;

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

  private setSelection(values: string[]) {
    values = values.filter(
      (v) => this.toggleButtons.map((b) => b.value).indexOf(v) !== -1
    );

    const buttons = this.toggleButtons.filter(
      (b) => values.indexOf(b.value) !== -1
    );

    if (buttons.length) {
      if (this.selection === 'multiple') {
        buttons.forEach((b) => (b.selected = true));
      } else {
        buttons.find((b) => b.value === values.at(-1))!.selected = true;
      }
    }
  }

  private setMutationsObserver() {
    this.mutationObserver = new MutationObserver(async (records, observer) => {
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
      await this.updateComplete;
      observer.observe(this, this.observerConfig);
    });

    this.mutationObserver.observe(this, this.observerConfig);
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

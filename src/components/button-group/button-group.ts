import { LitElement, html } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';

import { themes } from '../../theming/theming-decorator.js';
import {
  type MutationControllerParams,
  createMutationController,
} from '../common/controllers/mutation-observer.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { styles } from './themes/group.base.css.js';
import { all } from './themes/group.js';
import { styles as shared } from './themes/shared/group/group.common.css.js';
import IgcToggleButtonComponent from './toggle-button.js';

export interface IgcButtonGroupComponentEventMap {
  igcSelect: CustomEvent<string | undefined>;
  igcDeselect: CustomEvent<string | undefined>;
}

/* blazorAdditionalDependency: IgcToggleButtonComponent */
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
@themes(all, true)
export default class IgcButtonGroupComponent extends EventEmitterMixin<
  IgcButtonGroupComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-button-group';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcButtonGroupComponent, IgcToggleButtonComponent);
  }

  private get isMultiple() {
    return this.selection === 'multiple';
  }

  private _selectedItems: Set<string> = new Set();

  private _observerCallback({
    changes: { added, attributes },
  }: MutationControllerParams<IgcToggleButtonComponent>) {
    if (this.isMultiple || this._selectedButtons.length <= 1) {
      return;
    }

    const buttons = this.toggleButtons;
    const idx = buttons.indexOf(
      added.length ? added.at(-1)! : attributes.at(-1)!
    );

    buttons.forEach((button, i) => {
      if (button.selected && i !== idx) {
        button.selected = false;
      }
    });
  }

  private get _selectedButtons(): Array<IgcToggleButtonComponent> {
    return this.toggleButtons.filter((b) => b.selected);
  }

  @queryAssignedElements({ selector: IgcToggleButtonComponent.tagName })
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
  public get selectedItems(): string[] {
    return this._selectedButtons.map((b) => b.value).filter((v) => v);
  }

  public set selectedItems(values: string[]) {
    if (values?.length) {
      this._selectedItems = new Set(values);
      this.setSelection(this._selectedItems);
    }
  }

  @watch('disabled', { waitUntilFirstUpdate: true })
  protected updateDisabledState() {
    this.toggleButtons.forEach((b) => {
      b.disabled = this.disabled;
    });
  }

  @watch('selection', { waitUntilFirstUpdate: true })
  protected updateSelectionState() {
    if (this._selectedButtons.length) {
      this.toggleButtons.forEach((b) => {
        b.selected = false;
      });
    }
  }

  constructor() {
    super();

    createMutationController(this, {
      callback: this._observerCallback,
      filter: [IgcToggleButtonComponent.tagName],
      config: {
        attributeFilter: ['selected'],
        childList: true,
        subtree: true,
      },
    });
  }

  protected override firstUpdated() {
    if (this.disabled) {
      this.updateDisabledState();
    }

    const buttons = this._selectedButtons;

    if (buttons.length) {
      if (!this.isMultiple) {
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
      this.isMultiple
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
    button.selected = true;
    this.emitEvent('igcSelect', { detail: button.value });
  }

  private emitDeselectEvent(button: IgcToggleButtonComponent) {
    button.selected = false;
    this.emitEvent('igcDeselect', { detail: button.value });
  }

  private setSelection(values: Set<string>) {
    for (const button of this.toggleButtons) {
      if (values.has(button.value)) {
        button.selected = true;
        if (!this.isMultiple) {
          break;
        }
      }
    }
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

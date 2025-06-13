import { LitElement, html } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';
import { addThemingController } from '../../theming/theming-controller.js';
import { createMutationController } from '../common/controllers/mutation-observer.js';
import { registerComponent } from '../common/definitions/register.js';
import IgcRadioComponent from '../radio/radio.js';
import type { ContentOrientation } from '../types.js';
import { styles } from './themes/radio-group.base.css.js';
import { styles as shared } from './themes/shared/radio-group.common.css.js';
import { all } from './themes/themes.js';

/**
 * The igc-radio-group component unifies one or more igc-radio buttons.
 *
 * @element igc-radio-group
 *
 * @slot - Default slot
 */
export default class IgcRadioGroupComponent extends LitElement {
  public static readonly tagName = 'igc-radio-group';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcRadioGroupComponent, IgcRadioComponent);
  }

  private _defaultValue!: string;
  private _internals: ElementInternals;
  private _name!: string;
  private _value!: string;

  @queryAssignedElements({ selector: 'igc-radio', flatten: true })
  private _radios!: NodeListOf<IgcRadioComponent>;

  /**
   * Alignment of the radio controls inside this group.
   * @attr
   */
  @property({ reflect: true })
  public alignment: ContentOrientation = 'vertical';

  /* blazorCSSuppress */
  @property({ attribute: false })
  public set defaultValue(value: string) {
    this._defaultValue = value;
    this._setRadiosDefaultChecked();
  }

  public get defaultValue(): string {
    return this._defaultValue;
  }

  /**
   * Gets/Sets the name for all child igc-radio components.
   * @attr
   */
  @property({ reflect: true })
  public set name(value: string) {
    this._name = value;
    this._setRadiosName();
  }

  public get name(): string {
    return this._name;
  }

  /* @tsTwoWayProperty(true, "igcChange", "detail.value", false) */
  /**
   * Gets/Sets the checked igc-radio element that matches `value`
   * @attr
   */
  @property()
  public set value(value: string) {
    this._value = value;
    this._setSelectedRadio();
  }

  public get value(): string {
    if (this._radios.length) {
      this._value =
        Array.from(this._radios).find((radio) => radio.checked)?.value ?? '';
    }

    return this._value;
  }

  private _observerCallback() {
    const radios = Array.from(this._radios);
    const setState = (state: string, condition: boolean) =>
      condition
        ? this._internals.states.add(state)
        : this._internals.states.delete(state);

    setState(
      'disabled',
      radios.every((radio) => radio.disabled)
    );
    setState(
      'label-before',
      radios.some((radio) => radio.labelPosition === 'before')
    );
  }

  constructor() {
    super();

    addThemingController(this, all);

    createMutationController(this, {
      callback: this._observerCallback,
      filter: [IgcRadioComponent.tagName],
      config: {
        attributeFilter: ['disabled', 'label-position'],
        subtree: true,
      },
    });

    this._internals = this.attachInternals();
    this._internals.role = 'radiogroup';
  }

  protected override createRenderRoot() {
    const root = super.createRenderRoot();
    root.addEventListener('slotchange', () => this._setCSSGridVars());
    return root;
  }

  protected override firstUpdated() {
    const radios = Array.from(this._radios);
    const allRadiosUnchecked = radios.every((radio) => !radio.checked);

    this._setRadiosName();
    this._setRadiosDefaultChecked();

    if (allRadiosUnchecked && this._value) {
      this._setSelectedRadio();
      this._setDefaultValue();
    }
  }

  private _setCSSGridVars() {
    const slot = this.renderRoot.querySelector('slot');
    if (slot) {
      this.style.setProperty(
        '--layout-count',
        `${slot.assignedElements({ flatten: true }).length}`
      );
    }
  }

  private _setRadiosDefaultChecked() {
    if (this._defaultValue) {
      for (const radio of this._radios) {
        radio.defaultChecked = radio.value === this._defaultValue;
      }
    }
  }

  private _setRadiosName() {
    if (this._name) {
      for (const radio of this._radios) {
        radio.name = this._name;
      }
    }
  }

  private _setDefaultValue() {
    for (const radio of this._radios) {
      radio.toggleAttribute('checked', radio.checked);
    }
  }

  private _setSelectedRadio() {
    for (const radio of this._radios) {
      radio.checked = radio.value === this._value;
    }
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-radio-group': IgcRadioGroupComponent;
  }
}

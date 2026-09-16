import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { addInternalsController } from '#internals/controllers/internals.js';
import { createMutationController } from '#internals/controllers/mutation-observer.js';
import { addSlotController, setSlots } from '#internals/controllers/slot.js';
import { registerComponent } from '#internals/definitions/register.js';
import { isEmpty } from '#internals/utils/arrays.js';
import { isDefined } from '#internals/utils/types.js';
import { addThemingController } from '#theming/theming-controller.js';
import IgcRadioComponent from '../radio/radio.js';
import type { ContentOrientation } from '../types.js';
import { styles } from './themes/radio-group.base.css.js';
import { styles as shared } from './themes/shared/radio-group.common.css.js';
import { all } from './themes/themes.js';

/**
 * Unifies one or more radio components into a single group.
 *
 * @element igc-radio-group
 *
 * @slot - The radio controls of the group. They must be direct children of the group -
 * radios nested in a wrapper element are neither part of it, nor laid out by it.
 */
export default class IgcRadioGroupComponent extends LitElement {
  public static readonly tagName = 'igc-radio-group';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcRadioGroupComponent, IgcRadioComponent);
  }

  private readonly _internals = addInternalsController(this, {
    initialARIA: { role: 'radiogroup' },
    reflectRole: true,
    aria: () => ({ ariaOrientation: this.alignment }),
  });

  private readonly _slots = addSlotController(this, {
    slots: setSlots(),
    onChange: this._syncRadios,
  });

  private _defaultValue!: string;
  private _name!: string;
  /** The value that no radio holds yet. Empty as soon as a radio takes it. */
  private _pendingValue = '';

  private get _radios(): IgcRadioComponent[] {
    return this._slots.getAssignedElements<IgcRadioComponent>('[default]', {
      selector: IgcRadioComponent.tagName,
      flatten: true,
    });
  }

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
   * The name applied to all radio buttons in the group.
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
   * The value of the group, reflecting the value of the currently checked radio button.
   * Setting it checks the radio button in the group with a matching value.
   * @attr
   */
  @property()
  public set value(value: string) {
    this._pendingValue = value;
    this._setSelectedRadio();
  }

  public get value(): string {
    const radios = this._radios;

    // The checked radio holds the value of the group. Without radios to apply it to,
    // the group reports the value that is still pending.
    return isEmpty(radios)
      ? this._pendingValue
      : (radios.find((radio) => radio.checked)?.value ?? '');
  }

  constructor() {
    super();

    addThemingController(this, all);

    createMutationController(this, {
      callback: this._syncStates,
      filter: [IgcRadioComponent.tagName],
      config: {
        attributeFilter: ['disabled', 'label-position'],
        subtree: true,
      },
    });
  }

  protected override firstUpdated(): void {
    this._syncRadios();
  }

  /**
   * Brings the group in sync with its radios. Runs after the first render and after each
   * change of the slotted content, to adopt the radios that come in at run time. Without
   * the name of the group, such a radio makes a group of its own, outside of the keyboard
   * navigation and the single selection of this one.
   */
  private _syncRadios(): void {
    const radios = this._radios;

    this._setRadiosName();
    this._setRadiosDefaultChecked();

    // The value of the group applies while no radio holds a selection of its own. This
    // is the first render, or the moment a radio with a value that had no match comes in.
    // The `checked` attribute then makes that selection the default state.
    if (this._pendingValue && !radios.some((radio) => radio.checked)) {
      this._setSelectedRadio();

      for (const radio of radios) {
        radio.toggleAttribute('checked', radio.checked);
      }
    }

    this._syncStates();
    this.style.setProperty('--layout-count', `${radios.length}`);
  }

  private _syncStates(): void {
    const radios = this._radios;

    this._internals.setState(
      'disabled',
      !isEmpty(radios) && radios.every((radio) => radio.disabled)
    );
    this._internals.setState(
      'label-before',
      radios.some((radio) => radio.labelPosition === 'before')
    );
  }

  private _setRadiosDefaultChecked(): void {
    if (isDefined(this._defaultValue)) {
      for (const radio of this._radios) {
        radio.defaultChecked = radio.value === this._defaultValue;
      }
    }
  }

  private _setRadiosName(): void {
    if (isDefined(this._name)) {
      for (const radio of this._radios) {
        radio.name = this._name;
      }
    }
  }

  private _setSelectedRadio(): void {
    let applied = false;

    for (const radio of this._radios) {
      radio.checked = radio.value === this._pendingValue;
      applied ||= radio.checked;
    }

    // A radio holds the value now, so the group reads it from that radio. A value that
    // stays pending applies again each time the group loses its selection.
    if (applied) {
      this._pendingValue = '';
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

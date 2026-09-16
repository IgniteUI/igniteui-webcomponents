import type { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import type { Constructor } from '../constructor.js';
import {
  FormAssociatedCheckboxMixin,
  FormAssociatedMixin,
} from './associated.js';
import type {
  BaseFormAssociatedElement,
  FormAssociatedCheckboxElementInterface,
  FormAssociatedElementInterface,
  FormRequiredInterface,
} from './types.js';

function BaseFormAssociatedRequired<
  T extends Constructor<BaseFormAssociatedElement & LitElement>,
>(base: T) {
  class BaseFormAssociatedRequiredElement extends base {
    protected _required = false;

    /**
     * When set, makes the component a required field for validation.
     * @attr
     * @default false
     */
    @property({ type: Boolean, reflect: true })
    public set required(value: boolean) {
      this._required = Boolean(value);
      this._validate();
    }

    public get required(): boolean {
      return this._required;
    }
  }

  return BaseFormAssociatedRequiredElement;
}

/**
 * Mixes the passed class into a form associated custom element with an
 * additional `required` attribute.
 */
export function FormAssociatedRequiredMixin<T extends Constructor<LitElement>>(
  base: T
) {
  class FormAssociatedRequiredElement extends BaseFormAssociatedRequired(
    FormAssociatedMixin(base)
  ) {}

  return FormAssociatedRequiredElement as unknown as Constructor<
    FormRequiredInterface & FormAssociatedElementInterface
  > &
    T;
}

/**
 * Mixes the passed class into a form associated custom element with an
 * additional `required` attribute.
 */
export function FormAssociatedCheckboxRequiredMixin<
  T extends Constructor<LitElement>,
>(base: T) {
  class FormAssociatedCheckboxRequiredElement extends BaseFormAssociatedRequired(
    FormAssociatedCheckboxMixin(base)
  ) {}

  return FormAssociatedCheckboxRequiredElement as unknown as Constructor<
    FormRequiredInterface & FormAssociatedCheckboxElementInterface
  > &
    T;
}

import type { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { watch } from '../../decorators/watch.js';
import type { Constructor } from '../constructor.js';
import {
  FormAssociatedCheckboxMixin,
  FormAssociatedMixin,
} from './associated.js';
import type {
  FormAssociatedCheckboxElementInterface,
  FormAssociatedElementInterface,
  FormRequiredInterface,
} from './types.js';

export function FormAssociatedRequiredMixin<T extends Constructor<LitElement>>(
  base: T
) {
  class FormAssociatedRequiredElement extends FormAssociatedMixin(base) {
    /**
     * When set, makes the component a required field for validation.
     * @attr
     * @default false
     */
    @property({ type: Boolean, reflect: true })
    public required = false;

    @watch('required', { waitUntilFirstUpdate: true })
    protected requiredChange(): void {
      this._updateValidity();
      this.invalid = !this.checkValidity();
    }
  }

  return FormAssociatedRequiredElement as unknown as Constructor<
    FormRequiredInterface & FormAssociatedElementInterface
  > &
    T;
}

export function FormAssociatedCheckboxRequiredMixin<
  T extends Constructor<LitElement>,
>(base: T) {
  class FormAssociatedRequiredElement extends FormAssociatedCheckboxMixin(
    base
  ) {
    /**
     * When set, makes the component a required field for validation.
     * @attr
     * @default false
     */
    @property({ type: Boolean, reflect: true })
    public required = false;

    @watch('required', { waitUntilFirstUpdate: true })
    protected requiredChange(): void {
      this._updateValidity();
      this.invalid = !this.checkValidity();
    }
  }

  return FormAssociatedRequiredElement as unknown as Constructor<
    FormRequiredInterface & FormAssociatedCheckboxElementInterface
  > &
    T;
}

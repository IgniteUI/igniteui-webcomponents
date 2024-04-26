import type { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import { watch } from '../decorators/watch.js';
import type { Constructor } from './constructor.js';
import {
  type FormAssociatedElementInterface,
  FormAssociatedMixin,
} from './form-associated.js';

export declare class FormRequiredInterface {
  protected requiredChange(): void;

  /**
   * Makes the control a required field in a form context.
   * @attr
   */
  public required: boolean;
}

/**
 * Turns the passed class element into a Form Associated Custom Element with
 * additional `required` attribute.
 */
export function FormAssociatedRequiredMixin<T extends Constructor<LitElement>>(
  superClass: T
) {
  class FormAssociatedRequiredElement extends FormAssociatedMixin(superClass) {
    /**
     * Makes the control a required field in a form context.
     * @attr
     */
    @property({ type: Boolean, reflect: true })
    public required = false;

    @watch('required', { waitUntilFirstUpdate: true })
    protected requiredChange() {
      this.updateValidity();
      this.invalid = !this.checkValidity();
    }
  }

  return FormAssociatedRequiredElement as unknown as Constructor<
    FormRequiredInterface & FormAssociatedElementInterface
  > &
    T;
}

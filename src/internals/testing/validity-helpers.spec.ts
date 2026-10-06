import { elementUpdated, expect } from '@open-wc/testing';
import IgcValidationContainerComponent from '../../components/validation-container/validation-container.js';
import type { IgniteComponent } from '../definitions/register.js';
import type { Constructor } from '../mixins/constructor.js';
import type { IgcFormControl } from '../mixins/forms/types.js';
import { isEmpty } from '../utils/arrays.js';
import { toKebabCase } from '../utils/strings.js';

export type ValidationContainerTestsParams<T> = {
  slots: Array<keyof ValidityStateFlags | 'invalid'>;
  props?: { [K in keyof T]?: T[K] };
};

/**
 * Tests the validity state of form-associated components and their validation
 * container slots.
 */
export const ValidityHelpers = {
  /** Transitions the form associated component in **touched** state. */
  setTouchedState: (host: IgcFormControl): void => {
    host['_setTouchedState']();
  },
  /**
   * Asserts on the internal validity of the component.
   *
   * @remarks
   * Invalid styles apply only after the component is
   * {@link ValidityHelpers.setTouchedState | touched}, after a form submit or
   * after a `reportValidity` call.
   */
  isValid: (host: IgcFormControl): Chai.Assertion => {
    return expect(host.validity.valid);
  },
  /**
   * Asserts on the invalid styles of the component. See
   * {@link ValidityHelpers.isValid | isValid} for when they apply.
   */
  hasInvalidStyles: (host: IgcFormControl): Chai.Assertion => {
    return expect(host.matches(':state(ig-invalid)'));
  },
  /** Asserts that the validation container has the given slots. */
  hasSlots: (host: IgcFormControl, ...names: string[]): Chai.Assertion => {
    return expect(hasSlots(getValidationContainerRoot(host), ...names));
  },
  /** Asserts on the projected elements of a validation container slot. */
  hasSlottedContent: (host: IgcFormControl, name: string): Chai.Assertion => {
    return expect(hasSlotContent(getValidationContainerRoot(host), name));
  },
  /**
   * Checks that the component is invalid and projects content into `slots`.
   *
   * @remarks
   * {@link runValidationContainerTests} calls it.
   */
  checkValidationSlots: async (
    host: IgcFormControl,
    ...slots: Array<keyof ValidityStateFlags | 'invalid'>
  ): Promise<void> => {
    const mappedSlots = slots.map((each) => toKebabCase(each));

    host.reportValidity();
    await elementUpdated(host);

    ValidityHelpers.isValid(host).to.be.false;
    ValidityHelpers.hasInvalidStyles(host).to.be.true;
    ValidityHelpers.hasSlots(host, ...mappedSlots).to.be.true;

    for (const each of mappedSlots) {
      ValidityHelpers.hasSlottedContent(host, each).to.be.true;
    }
  },
} as const;

/**
 * Checks that a new `element` renders the validation slots of each case in
 * `testParams`, in sequence. A failure names the slots of its case.
 */
export async function runValidationContainerTests<T extends IgcFormControl>(
  element: Constructor<T> & IgniteComponent,
  testParams: ValidationContainerTestsParams<T>[]
): Promise<void> {
  for (const { slots, props } of testParams) {
    if (isEmpty(slots)) continue;

    const instance = document.createElement(element.tagName) as T;
    instance.append(
      ...slots.map((slot) =>
        Object.assign(document.createElement('div'), {
          slot: toKebabCase(slot),
        })
      )
    );
    Object.assign(instance, props);
    document.body.append(instance);

    try {
      await elementUpdated(instance);

      if (slots.includes('customError')) {
        instance.setCustomValidity('invalid');
      }

      await ValidityHelpers.checkValidationSlots(instance, ...slots);
    } catch (error) {
      if (error instanceof Error) {
        error.message = `[${slots.join(', ')}] ${error.message}`;
      }
      throw error;
    } finally {
      instance.remove();
    }
  }
}

/** Returns whether `root` has a slot for each of `names`. */
function hasSlots(
  root: HTMLElement | DocumentFragment,
  ...names: string[]
): boolean {
  const slotNames = new Set(
    Array.from(root.querySelectorAll('slot')).map((slot) => slot.name ?? '')
  );

  for (const name of names) {
    if (!slotNames.has(name)) {
      return false;
    }
  }
  return true;
}

/**
 * Returns whether the slot `name` of `root` has flattened assigned elements.
 * An empty `name` selects the default slot.
 */
function hasSlotContent(
  root: HTMLElement | DocumentFragment,
  name: string
): boolean {
  const slot = root.querySelector<HTMLSlotElement>(
    name ? `slot[name='${name}']` : 'slot:not([name])'
  );

  return !!slot && !isEmpty(slot.assignedElements({ flatten: true }));
}

function getValidationContainerRoot(
  host: IgcFormControl
): HTMLElement | DocumentFragment {
  return host.renderRoot.querySelector(IgcValidationContainerComponent.tagName)!
    .renderRoot;
}

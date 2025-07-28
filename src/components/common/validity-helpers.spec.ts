import { elementUpdated, expect } from '@open-wc/testing';
import IgcValidationContainerComponent from '../validation-container/validation-container.js';
import type { IgniteComponent } from './definitions/register.js';
import type { Constructor } from './mixins/constructor.js';
import type { IgcFormControl } from './mixins/forms/types.js';
import { isEmpty, toKebabCase } from './util.js';

export type ValidationContainerTestsParams<T> = {
  slots: Array<keyof ValidityStateFlags | 'invalid'>;
  props?: { [K in keyof T]?: T[K] };
};

/**
 * Helper object with utility methods to test form associated components for
 * validity state, both internal and external as well as their integration with
 * the validation container slots feature.
 */
export const ValidityHelpers = {
  /** Transitions the form associated component in **touched** state. */
  setTouchedState: (host: IgcFormControl): void => {
    // biome-ignore lint/complexity/useLiteralKeys: Emulate user interaction for the test case
    host['_setTouchedState']();
  },
  /**
   * Whether the form associated element is in invalid state.
   *
   * @remark
   * This is internal validity state. Unless the component is {@link ValidityHelpers.setTouchedState | touched}, there is an actual
   * form submit request or the end-user has called `reportValidity` no invalid styles will be
   * applied on the host component.
   */
  isValid: (host: IgcFormControl): Chai.Assertion => {
    return expect(host.validity.valid);
  },
  /**
   * Whether the invalid styles are applied on the form associated component.
   *
   * See {@link ValidityHelpers.isValid | isValid} documentation for when this is applied.
   */
  hasInvalidStyles: (host: IgcFormControl): Chai.Assertion => {
    return expect(host.matches(':state(ig-invalid)'));
  },
  /**
   * Whether the given slots exist inside the validation container of the
   * form associated component.
   */
  hasSlots: (host: IgcFormControl, ...names: string[]): Chai.Assertion => {
    return expect(hasSlots(getValidationContainerRoot(host), ...names));
  },
  /**
   * Whether the given slot name of the validation container of the form associated
   * component has any projected elements.
   */
  hasSlottedContent: (host: IgcFormControl, name: string): Chai.Assertion => {
    return expect(hasSlotContent(getValidationContainerRoot(host), name));
  },
  /**
   * Checks if the given configuration of a form associated component and validation
   * container slots is in a correct state.
   *
   * @remarks
   * Invoked by {@link runValidationContainerTests} so you don't really need to call
   * this function directly.
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

export function runValidationContainerTests<T extends IgcFormControl>(
  element: Constructor<T> & IgniteComponent,
  testParams: ValidationContainerTestsParams<T>[]
): void {
  const runner = async ({
    slots,
    props,
  }: ValidationContainerTestsParams<T>) => {
    if (isEmpty(slots)) return;

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
    await elementUpdated(instance);

    if (slots.includes('customError')) {
      instance.setCustomValidity('invalid');
    }

    await ValidityHelpers.checkValidationSlots(instance, ...slots);
    instance.remove();
  };

  for (const each of testParams) {
    runner(each);
  }
}

/**
 * Returns whether all passed `names` exist as slots in the given `root`.
 */
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
 * Returns whether the given slot `name` has any slotted content for the given `root`.
 * Pass an empty string for the default slot.
 *
 * The function will flatten the target slot discarding any slot re-projection and
 * will match only elements being projected.
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

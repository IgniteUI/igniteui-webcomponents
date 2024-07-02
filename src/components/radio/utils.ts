import { iterNodes } from '../common/util.js';
import type IgcRadioComponent from './radio.js';

type RadioQueryResult = {
  /** Radio components under the same group name */
  radios: IgcRadioComponent[];
  /** Radio components under the same group name that are not disabled */
  active: IgcRadioComponent[];
  /** Radio components under the same group name sans the radio member passed in `getGroup` */
  siblings: IgcRadioComponent[];
  /** Radio components under the same group name that are marked as checked */
  checked: IgcRadioComponent[];
};

export function getGroup(member: IgcRadioComponent) {
  const result: RadioQueryResult = {
    active: [],
    checked: [],
    radios: [],
    siblings: [],
  };

  // No name property for the passed radio. Skip DOM search and return a group of one radio
  // with appropriate states.
  if (!member.name) {
    result.radios.push(member);

    if (member.checked) {
      result.checked.push(member);
    }

    if (!member.disabled) {
      result.active.push(member);
    }

    return result;
  }

  const iterator = iterNodes<IgcRadioComponent>(
    globalThis.document.documentElement,
    'SHOW_ELEMENT',
    (radio) => radio.matches(`${member.tagName}[name='${member.name}']`)
  );

  for (const each of iterator) {
    result.radios.push(each);

    if (!each.disabled) {
      result.active.push(each);
    }

    if (each.checked) {
      result.checked.push(each);
    }

    if (each !== member) {
      result.siblings.push(each);
    }
  }

  return result;
}

import type IgcRadioComponent from './radio';
import { iterNodes } from '../common/util.js';

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
  const iterator = iterNodes<IgcRadioComponent>(
    document.body,
    'SHOW_ELEMENT',
    (radio) => radio.matches(`${member.tagName}[name='${member.name}']`)
  );

  const result: RadioQueryResult = {
    active: [],
    checked: [],
    radios: [],
    siblings: [],
  };

  for (const each of iterator) {
    result.radios.push(each);

    if (!each.disabled) {
      result.active.push(each);
    }

    if (each.checked) {
      result.checked.push(each);
    }

    if (!each.isSameNode(member)) {
      result.siblings.push(each);
    }
  }

  return result;
}

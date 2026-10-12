import {
  createGroupRegistry,
  type GroupMemberController,
} from '#internals/controllers/group.js';
import { getRoot } from '#internals/utils/dom.js';
import type IgcRadioComponent from './radio.js';

/**
 * Connected radios, grouped by form owner (or root node, as native radios do)
 * and name.
 *
 * The group state is true when an enabled radio is checked. A disabled radio is
 * out of the tab order, so its selection must not take the tab stop.
 */
const radioGroups = createGroupRegistry<IgcRadioComponent, boolean>({
  keyOf: (radio) => radio.name || '',
  scopeOf: (radio) => radio.form ?? getRoot(radio),
  deriveState: (radios) =>
    radios.some((radio) => radio.checked && !radio.disabled),
});

type RadioGroupController = GroupMemberController<IgcRadioComponent>;

export type { RadioGroupController };

export function addRadioGroupController(
  host: IgcRadioComponent,
  onSync: (hasCheckedRadio: boolean) => void
): RadioGroupController {
  return radioGroups.attach(host, onSync);
}

/** Returns the radios of the group of `member`, in DOM order. */
export function getGroupMembers(
  member: IgcRadioComponent
): IgcRadioComponent[] {
  return radioGroups.membersOf(member);
}

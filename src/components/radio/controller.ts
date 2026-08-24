import {
  createGroupRegistry,
  type GroupMemberController,
} from '#internals/controllers/group.js';
import { getRoot } from '#internals/utils/dom.js';
import type IgcRadioComponent from './radio.js';

/**
 * All connected radios that have a name, grouped by form owner and name - the
 * identity of a radio group. Radios without a form owner group by root node,
 * the way the native ones do.
 *
 * The group-wide state is whether the group holds a reachable selection:
 * a disabled radio is out of the tab order, so a selection that it holds must
 * not take the tab stop from the radios that the user can still reach.
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

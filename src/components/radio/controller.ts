import {
  createGroupRegistry,
  type GroupMemberController,
} from '#internals/controllers/group.js';
import type IgcRadioComponent from './radio.js';

/**
 * All connected radios that have a name, grouped by root node and name - the
 * identity of a radio group.
 *
 * The group-wide state is whether the group holds a reachable selection:
 * a disabled radio is out of the tab order, so a selection that it holds must
 * not take the tab stop from the radios that the user can still reach.
 */
const radioGroups = createGroupRegistry<IgcRadioComponent, boolean>({
  keyOf: (radio) => radio.name || '',
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

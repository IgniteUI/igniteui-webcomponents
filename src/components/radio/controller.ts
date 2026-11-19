import {
  createGroupRegistry,
  type GroupMemberCallbacks,
  type GroupMemberController,
} from '#internals/controllers/group.js';
import type IgcRadioComponent from './radio.js';

/** The state of a radio group, which each of its radios reads. */
export interface RadioGroupState {
  /** Whether a radio of the group is checked. */
  hasCheckedRadio: boolean;
  /** Whether an enabled radio of the group is checked. It sets the tab stop. */
  hasEnabledCheckedRadio: boolean;
  /** Whether a radio of the group is required. */
  hasRequiredRadio: boolean;
}

/**
 * Connected radios, grouped by form owner (or root node, as native radios do)
 * and name.
 */
const radioGroups = createGroupRegistry<IgcRadioComponent, RadioGroupState>({
  keyOf: (radio) => radio.name || '',
  scopeOf: (radio) => radio.form ?? radio.getRootNode(),
  deriveState: (radios) => ({
    hasCheckedRadio: radios.some((radio) => radio.checked),
    hasEnabledCheckedRadio: radios.some(
      (radio) => radio.checked && !radio.disabled
    ),
    hasRequiredRadio: radios.some((radio) => radio.required),
  }),
});

export function addRadioGroupController(
  host: IgcRadioComponent,
  callbacks: GroupMemberCallbacks<RadioGroupState>
): GroupMemberController<IgcRadioComponent> {
  return radioGroups.attach(host, callbacks);
}

/** Returns the radios of the group of `member`, in DOM order. */
export function getGroupMembers(
  member: IgcRadioComponent,
  ordered?: boolean
): IgcRadioComponent[] {
  return radioGroups.membersOf(member, ordered);
}

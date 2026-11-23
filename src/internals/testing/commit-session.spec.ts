import {
  type CommitPolicy,
  CommitSession,
} from '../../components/date-picker/commit-session.js';
import { equal } from '../utils/objects.js';

/**
 * A commit session over a recording picker whose value `initial` was set from
 * code. The picker keeps the reported value, as the form value of a picker does.
 */
export function createRecordingPicker<T>(
  policy: CommitPolicy,
  initial: T | null
) {
  const picker = {
    policy,
    value: initial,
    reported: initial,
    reports: [] as (T | null)[],
  };

  const session = new CommitSession<T>({
    policy: () => picker.policy,
    read: () => picker.value,
    write: (value) => {
      picker.value = value;
    },
    report: (force) => {
      if (force || !equal(picker.value, picker.reported)) {
        picker.reported = picker.value;
        picker.reports.push(picker.value);
      }
    },
  });

  /** A set from code: the picker takes the value as reported. */
  const setFromCode = (value: T | null): void => {
    picker.value = value;
    picker.reported = value;
    session.endDraft();
  };

  return { picker, session, setFromCode };
}

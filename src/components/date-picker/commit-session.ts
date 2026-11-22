/**
 * `at-once` commits and reports each calendar selection. `on-confirm` keeps it as a
 * draft until Done; Cancel or Escape restores the value from before the draft.
 */
export type CommitPolicy = 'at-once' | 'on-confirm';

export type CommitSessionHost<T> = {
  readonly policy: () => CommitPolicy;
  readonly read: () => T | null;
  /** Writes the value without events, as a change that waits for a report. */
  readonly write: (value: T | null) => void;
  /**
   * Reports the value with `igcChange` when it differs from the reported
   * value, or always with `force`. The host keeps the reported value.
   */
  readonly report: (force: boolean) => void;
};

/** Decides when a picker commits its value and reports it with `igcChange`. */
export class CommitSession<T> {
  private readonly _host: CommitSessionHost<T>;
  /** The value before the draft; `undefined` without a draft. */
  private _revertPoint?: T | null;

  constructor(host: CommitSessionHost<T>) {
    this._host = host;
  }

  /** A set from code ends the draft. */
  public endDraft(): void {
    this._revertPoint = undefined;
  }

  /** Under `at-once`, reports each pick, also an unchanged one. */
  public pick(value: T | null): void {
    if (this._host.policy() === 'at-once') {
      this._revertPoint = undefined;
      this._host.write(value);
      this._host.report(true);
      return;
    }

    if (this._revertPoint === undefined) {
      this._revertPoint = this._host.read();
    }
    this._host.write(value);
  }

  /** Done, or a close of the dialog on its own user action. */
  public confirm(): void {
    if (this._host.policy() === 'on-confirm') {
      this._revertPoint = undefined;
      this._host.report(false);
    }
  }

  /** Cancel or Escape. */
  public cancel(): void {
    if (this._revertPoint !== undefined) {
      this._host.write(this._revertPoint);
      this._revertPoint = undefined;
    }
  }

  public commitEdit(value: T | null): void {
    this._revertPoint = undefined;
    this._host.write(value);
    this._host.report(false);
  }

  /** The clear is reported on blur, or by the editor commit that follows it. */
  public clear(): void {
    this._revertPoint = undefined;
    this._host.write(null);
  }

  /** Reports what no other action reported, but never a draft. */
  public blur(): void {
    if (this._revertPoint === undefined) {
      this._host.report(false);
    }
  }
}

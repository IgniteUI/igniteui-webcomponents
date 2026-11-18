import { equal } from '#internals/utils/objects.js';

/**
 * `at-once` commits and reports each calendar selection. `on-confirm` keeps it as a
 * draft until Done; Cancel or Escape restores the value from before the draft.
 */
export type CommitPolicy = 'at-once' | 'on-confirm';

export type CommitSessionHost<T> = {
  readonly policy: () => CommitPolicy;
  readonly read: () => T | null;
  /** Writes the value without events. */
  readonly write: (value: T | null) => void;
  readonly emit: (value: T | null) => void;
};

/** Decides when a picker commits its value and reports it with `igcChange`. */
export class CommitSession<T> {
  private readonly _host: CommitSessionHost<T>;
  private _reported: T | null = null;
  /** The value before the draft; `undefined` without a draft. */
  private _revertPoint?: T | null;

  constructor(host: CommitSessionHost<T>) {
    this._host = host;
  }

  /** Takes the value as reported: set from code, or the initial value. */
  public adopt(): void {
    this._reported = this._host.read();
    this._revertPoint = undefined;
  }

  /** Under `at-once`, reports each pick, also an unchanged one. */
  public pick(value: T | null): void {
    if (this._host.policy() === 'at-once') {
      this._revertPoint = undefined;
      this._host.write(value);
      this._report(this._host.read());
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
      this._reportIfChanged();
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
    this._reportIfChanged();
  }

  /** The clear is reported on blur, or by the editor commit that follows it. */
  public clear(): void {
    this._revertPoint = undefined;
    this._host.write(null);
  }

  /** Reports what no other action reported, but never a draft. */
  public blur(): void {
    if (this._revertPoint === undefined) {
      this._reportIfChanged();
    }
  }

  private _reportIfChanged(): void {
    const value = this._host.read();
    if (!equal(value, this._reported)) {
      this._report(value);
    }
  }

  private _report(value: T | null): void {
    this._reported = value;
    this._host.emit(value);
  }
}

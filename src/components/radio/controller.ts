import type { ReactiveController } from 'lit';
import { isEmpty } from '#internals/utils/arrays.js';
import { getRoot } from '#internals/utils/dom.js';
import type IgcRadioComponent from './radio.js';

type RadioGroupRoot = Document | ShadowRoot;
type RadioGroup = Set<RadioGroupController>;

/**
 * All connected radios that have a name, keyed by root node and name - the identity
 * of a radio group.
 *
 * Each radio keeps its own entry through its life-cycle. A group read is then the size
 * of the group and not of the root node. It also lets the radios that stay behind update
 * their state when a member leaves - a change that a radio cannot see on its own.
 */
const registry = new WeakMap<RadioGroupRoot, Map<string, RadioGroup>>();
const controllers = new WeakMap<IgcRadioComponent, RadioGroupController>();

function byDocumentOrder(a: Node, b: Node): number {
  return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING
    ? -1
    : 1;
}

/** Returns the group of the given root node and name, and creates it if necessary. */
function groupOf(root: RadioGroupRoot, name: string): RadioGroup {
  const names = registry.get(root) ?? new Map<string, RadioGroup>();
  const group = names.get(name) ?? new Set<RadioGroupController>();

  names.set(name, group);
  registry.set(root, names);

  return group;
}

/** Keeps a radio in the group of its current root node and name. */
class RadioGroupController implements ReactiveController {
  /** Gives each radio of the group the state that the group derives. */
  private static _sync(group: Iterable<RadioGroupController>): void {
    const members = Array.from(group);
    const hasCheckedRadio = members.some((member) => member._host.checked);

    for (const member of members) {
      member._onSync(hasCheckedRadio);
    }
  }

  private readonly _host: IgcRadioComponent;
  private readonly _onSync: (hasCheckedRadio: boolean) => void;

  /** The root node the host is registered under, or null while it is not registered. */
  private _root: RadioGroupRoot | null = null;
  private _name = '';

  /** Whether the host still belongs to the group that holds its entry. */
  private get _isCurrent(): boolean {
    return this._host.name === this._name && getRoot(this._host) === this._root;
  }

  private get _group(): RadioGroupController[] {
    const entries = this._root
      ? Array.from(registry.get(this._root)?.get(this._name) ?? [])
      : [];

    // A radio moves to its new group on its next update, so an entry can be one
    // that has a different name or root node by now.
    const members = entries.filter((member) => member._isCurrent);

    return isEmpty(members)
      ? [this]
      : members.sort((a, b) => byDocumentOrder(a._host, b._host));
  }

  /** The radios of the host group, in DOM order. A radio with no group is on its own. */
  public get members(): IgcRadioComponent[] {
    return this._group.map((member) => member._host);
  }

  constructor(
    host: IgcRadioComponent,
    onSync: (hasCheckedRadio: boolean) => void
  ) {
    this._host = host;
    this._onSync = onSync;

    controllers.set(host, this);
    host.addController(this);
  }

  /** @internal */
  public hostConnected(): void {
    this.updateMembership();
  }

  /** @internal */
  public hostDisconnected(): void {
    this._unregister();
  }

  /**
   * Moves the host to the group of its current root node and name. Does nothing while
   * both stay the same. If not, the group that the host joins and the group that it
   * leaves both update their state.
   */
  public updateMembership(): void {
    const host = this._host;
    const root = host.isConnected ? getRoot(host) : null;
    const name = host.name || '';

    if (root === this._root && name === this._name) {
      return;
    }

    this._unregister();

    if (root && name) {
      this._root = root;
      this._name = name;
      groupOf(root, name).add(this);
    }

    this.sync();
  }

  /** Updates the state of the host group. */
  public sync(): void {
    RadioGroupController._sync(this._group);
  }

  private _unregister(): void {
    const { _root: root, _name: name } = this;
    const names = root ? registry.get(root) : undefined;
    const group = names?.get(name);

    this._root = null;
    this._name = '';

    if (!group?.delete(this)) {
      return;
    }

    if (isEmpty(group)) {
      names?.delete(name);
    } else {
      // The host is gone, and any selection that it held goes with it. What is left
      // of the group derives its state again and takes back the tab stop.
      RadioGroupController._sync(group);
    }
  }
}

export type { RadioGroupController };

export function addRadioGroupController(
  host: IgcRadioComponent,
  onSync: (hasCheckedRadio: boolean) => void
): RadioGroupController {
  return new RadioGroupController(host, onSync);
}

/** Returns the radios of the group of `member`, in DOM order. */
export function getGroupMembers(
  member: IgcRadioComponent
): IgcRadioComponent[] {
  const controller = controllers.get(member);

  // Move the member first, so that a read that comes right after a change of its
  // name or root node resolves against the correct group.
  controller?.updateMembership();

  return controller?.members ?? [member];
}

import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { isEmpty } from '../utils/arrays.js';
import { getRoot } from '../utils/dom.js';

type GroupHost = ReactiveControllerHost & Element;

/** The object a group's identity is bound to - a root node, a container element. */
type GroupScope = object;

type GroupRegistryConfig<T extends GroupHost, S> = {
  /**
   * The group key of a host. Together with the scope it forms the identity of
   * a group. A host with an empty key stays on its own.
   */
  keyOf: (host: T) => string;
  /**
   * Derives the group-wide state that each member receives on sync, from the
   * current members of the group.
   */
  deriveState: (members: T[]) => S;
  /**
   * The scope the group identity is bound to. Defaults to the host's root
   * node (document or shadow root).
   */
  scopeOf?: (host: T) => GroupScope;
};

/** The membership of one host, attached to it as a reactive controller. */
interface GroupMemberController<
  T extends GroupHost,
> extends ReactiveController {
  /** The hosts of this member's group, in DOM order. A host with no group is on its own. */
  readonly members: T[];
  /**
   * Moves the host to the group of its current scope and key. Does nothing
   * while both stay the same. If not, the group that the host joins and the
   * group that it leaves both update their state.
   */
  updateMembership(): void;
  /** Updates the state of the host group. */
  sync(): void;
}

interface GroupRegistry<T extends GroupHost, S> {
  /** Creates and attaches a membership controller to the host. */
  attach(host: T, onSync: (state: S) => void): GroupMemberController<T>;
  /** Returns the hosts of the group of `member`, in DOM order. */
  membersOf(member: T): T[];
}

function byDocumentOrder(a: Node, b: Node): number {
  if (a === b) {
    return 0;
  }

  return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING
    ? -1
    : 1;
}

/**
 * Creates a registry of groups whose members discover each other through a
 * shared scope and key instead of a common parent element - the way native
 * radio buttons group by their `name` within a form root.
 *
 * Each member keeps its own entry through its life-cycle, so a group read
 * reflects the actual membership, and the members that stay behind update
 * their state when one leaves - a change a member cannot see on its own.
 *
 * One registry holds one kind of group; create it at module level:
 *
 * @example
 * ```typescript
 * const radioGroups = createGroupRegistry<IgcRadioComponent, boolean>({
 *   keyOf: (radio) => radio.name || '',
 *   deriveState: (radios) => radios.some((radio) => radio.checked),
 * });
 *
 * // In the component:
 * private readonly _group = radioGroups.attach(this, (state) => { ... });
 * ```
 */
export function createGroupRegistry<T extends GroupHost, S>(
  config: GroupRegistryConfig<T, S>
): GroupRegistry<T, S> {
  const groups = new WeakMap<GroupScope, Map<string, Set<Member>>>();
  const controllers = new WeakMap<T, Member>();

  function scopeOf(host: T): GroupScope {
    return config.scopeOf?.(host) ?? getRoot(host);
  }

  /** Gives each member of the group the state that the group derives. */
  function syncGroup(group: Iterable<Member>): void {
    const members = Array.from(group);
    const state = config.deriveState(members.map((member) => member.host));

    for (const member of members) {
      member.onSync(state);
    }
  }

  class Member implements GroupMemberController<T> {
    public readonly host: T;
    public readonly onSync: (state: S) => void;

    /** The scope the host is registered under, or null while it is not registered. */
    private _scope: GroupScope | null = null;
    private _key = '';

    /** Whether the host still belongs to the group that holds its entry. */
    private get _isCurrent(): boolean {
      return (
        config.keyOf(this.host) === this._key &&
        scopeOf(this.host) === this._scope
      );
    }

    private get _group(): Member[] {
      const entries = this._scope
        ? Array.from(groups.get(this._scope)?.get(this._key) ?? [])
        : [];

      // A host moves to its new group on its next update, so an entry can be
      // one that has a different key or scope by now.
      const members = entries.filter((member) => member._isCurrent);

      return isEmpty(members)
        ? [this]
        : members.sort((a, b) => byDocumentOrder(a.host, b.host));
    }

    public get members(): T[] {
      return this._group.map((member) => member.host);
    }

    constructor(host: T, onSync: (state: S) => void) {
      this.host = host;
      this.onSync = onSync;
      host.addController(this);
    }

    public hostConnected(): void {
      this.updateMembership();
    }

    public hostDisconnected(): void {
      this._unregister();
    }

    public updateMembership(): void {
      const scope = this.host.isConnected ? scopeOf(this.host) : null;
      const key = config.keyOf(this.host);

      if (scope === this._scope && key === this._key) {
        return;
      }

      this._unregister();

      if (scope && key) {
        this._scope = scope;
        this._key = key;

        const keys = groups.get(scope) ?? new Map<string, Set<Member>>();
        const group = keys.get(key) ?? new Set<Member>();

        keys.set(key, group);
        groups.set(scope, keys);
        group.add(this);
      }

      this.sync();
    }

    public sync(): void {
      syncGroup(this._group);
    }

    private _unregister(): void {
      const { _scope: scope, _key: key } = this;
      const keys = scope ? groups.get(scope) : undefined;
      const group = keys?.get(key);

      this._scope = null;
      this._key = '';

      if (!group?.delete(this)) {
        return;
      }

      if (isEmpty(group)) {
        keys?.delete(key);
      } else {
        // The host is gone, and any state that it held goes with it. What is
        // left of the group derives its state again.
        syncGroup(group);
      }
    }
  }

  return {
    attach(host, onSync) {
      const controller = new Member(host, onSync);
      controllers.set(host, controller);
      return controller;
    },

    membersOf(member) {
      const controller = controllers.get(member);

      // Move the member first, so that a read that comes right after a change
      // of its key or scope resolves against the correct group.
      controller?.updateMembership();

      return controller?.members ?? [member];
    },
  };
}

export type { GroupMemberController, GroupRegistry, GroupRegistryConfig };

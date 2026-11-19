import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { isEmpty } from '../utils/arrays.js';
import { getOrInsertComputed } from '../utils/objects.js';

type GroupHost = ReactiveControllerHost & Element;

/** The identity of a group: a root node or a container element. */
type GroupScope = object;

type GroupRegistryConfig<T extends GroupHost, S> = {
  /** The group key of a host. An empty key leaves the host on its own. */
  keyOf: (host: T) => string;
  /** Derives the state of each member on a sync, from the members in any order. */
  deriveState: (members: T[]) => S;
  /** The scope of the group identity. Defaults to the host root node. */
  scopeOf?: (host: T) => GroupScope;
};

/** The callbacks of one member. */
interface GroupMemberCallbacks<S> {
  /** Gets the state of the group on each sync. */
  onSync: (state: S) => void;
  /**
   * Runs after the host enters a group, at connect or on a change of its key
   * or scope, before the group syncs.
   */
  onJoin?: () => void;
}

/** The membership of one host, added to it as a reactive controller. */
interface GroupMemberController<
  T extends GroupHost,
> extends ReactiveController {
  /** The hosts of the group, in DOM order when `ordered`. A lone host is its own group. */
  getMembers(ordered: boolean): T[];
  /** Moves the host to the group of its scope and key, and syncs both. */
  updateMembership(): void;
  sync(): void;
}

interface GroupRegistry<T extends GroupHost, S> {
  /** Creates a membership controller and adds it to the host. */
  attach(host: T, callbacks: GroupMemberCallbacks<S>): GroupMemberController<T>;
  /** The hosts of the group of `member`, in DOM order unless `ordered` is `false`. */
  membersOf(member: T, ordered?: boolean): T[];
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
 * Creates a registry of groups.
 *
 * @remarks
 * Members find each other through a shared scope and key, as native radio
 * buttons group by `name` in a form root. Create one registry per kind of
 * group, at module level.
 *
 * @example
 * ```typescript
 * const radioGroups = createGroupRegistry<IgcRadioComponent, boolean>({
 *   keyOf: (radio) => radio.name || '',
 *   deriveState: (radios) => radios.some((radio) => radio.checked),
 * });
 *
 * // In the component:
 * private readonly _group = radioGroups.attach(this, {
 *   onSync: (hasCheckedRadio) => { ... },
 * });
 * ```
 */
export function createGroupRegistry<T extends GroupHost, S>(
  config: GroupRegistryConfig<T, S>
): GroupRegistry<T, S> {
  const groups = new WeakMap<GroupScope, Map<string, Set<Member>>>();
  const controllers = new WeakMap<T, Member>();

  function scopeOf(host: T): GroupScope {
    return config.scopeOf?.(host) ?? host.getRootNode();
  }

  /** Derives the group state and gives it to each member. */
  function syncGroup(group: Iterable<Member>): void {
    const members = Array.from(group);
    const state = config.deriveState(members.map((member) => member.host));

    for (const member of members) {
      member.callbacks.onSync(state);
    }
  }

  class Member implements GroupMemberController<T> {
    public readonly host: T;
    public readonly callbacks: GroupMemberCallbacks<S>;

    /** The scope of the host, or `null` while it is not registered. */
    private _scope: GroupScope | null = null;
    private _key = '';

    /** Whether the host still belongs to the group that holds its entry. */
    private get _isCurrent(): boolean {
      return (
        config.keyOf(this.host) === this._key &&
        scopeOf(this.host) === this._scope
      );
    }

    /** The members of the group, in no particular order. */
    private get _group(): Member[] {
      const entries = this._scope
        ? Array.from(groups.get(this._scope)?.get(this._key) ?? [])
        : [];

      // A read can come between a change of the key or scope of a host and
      // its move, so an entry can hold a stale key.
      const members = entries.filter((member) => member._isCurrent);

      return isEmpty(members) ? [this] : members;
    }

    public getMembers(ordered: boolean): T[] {
      const group = this._group;

      if (ordered) {
        group.sort((a, b) => byDocumentOrder(a.host, b.host));
      }

      return group.map((member) => member.host);
    }

    constructor(host: T, callbacks: GroupMemberCallbacks<S>) {
      this.host = host;
      this.callbacks = callbacks;

      controllers.set(host, this);
      host.addController(this);
    }

    public hostConnected(): void {
      this.updateMembership();
    }

    /** A disconnected host is a group of its own. */
    public hostDisconnected(): void {
      this.updateMembership();
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

        const keys = getOrInsertComputed(groups, scope, () => new Map());
        getOrInsertComputed(keys, key, () => new Set()).add(this);
        this.callbacks.onJoin?.();
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
        // The remaining members derive their state again without this host.
        syncGroup(group);
      }
    }
  }

  return {
    attach(host, callbacks) {
      return new Member(host, callbacks);
    },

    membersOf(member, ordered = true) {
      const controller = controllers.get(member);

      // Move first, so a read after a key or scope change resolves right.
      controller?.updateMembership();

      return controller?.getMembers(ordered) ?? [member];
    },
  };
}

export type {
  GroupMemberCallbacks,
  GroupMemberController,
  GroupRegistry,
  GroupRegistryConfig,
};

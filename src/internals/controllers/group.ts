import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { isEmpty } from '../utils/arrays.js';
import { getRoot } from '../utils/dom.js';

type GroupHost = ReactiveControllerHost & Element;

/** The identity of a group: a root node or a container element. */
type GroupScope = object;

type GroupRegistryConfig<T extends GroupHost, S> = {
  /** The group key of a host. An empty key leaves the host on its own. */
  keyOf: (host: T) => string;
  /** Derives the state that each member receives on a sync. */
  deriveState: (members: T[]) => S;
  /** The scope of the group identity. Defaults to the host root node. */
  scopeOf?: (host: T) => GroupScope;
};

/** The membership of one host, added to it as a reactive controller. */
interface GroupMemberController<
  T extends GroupHost,
> extends ReactiveController {
  /** The hosts of the group, in DOM order. A lone host gets its own group. */
  readonly members: T[];
  /** Moves the host to the group of its scope and key, and syncs both. */
  updateMembership(): void;
  sync(): void;
}

interface GroupRegistry<T extends GroupHost, S> {
  /** Creates a membership controller and adds it to the host. */
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

  /** Derives the group state and gives it to each member. */
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

    private get _group(): Member[] {
      const entries = this._scope
        ? Array.from(groups.get(this._scope)?.get(this._key) ?? [])
        : [];

      // A host moves on its next update, so an entry can hold a stale key.
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

      controllers.set(host, this);
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
        // The remaining members derive their state again without this host.
        syncGroup(group);
      }
    }
  }

  return {
    attach(host, onSync) {
      return new Member(host, onSync);
    },

    membersOf(member) {
      const controller = controllers.get(member);

      // Move first, so a read after a key or scope change resolves right.
      controller?.updateMembership();

      return controller?.members ?? [member];
    },
  };
}

export type { GroupMemberController, GroupRegistry, GroupRegistryConfig };

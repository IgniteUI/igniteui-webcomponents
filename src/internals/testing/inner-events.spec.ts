/**
 * Fails a test file when an `igc*` event of an element in the shadow root of
 * an `igc-*` host reaches a listener on the outermost `igc-*` host, the one
 * that a page sees. A composite stops the events of its inner elements (see
 * "Custom Events" in CODING_GUIDELINES.md). `testRunnerHtml` in the runner
 * config loads this module for every test file, before mocha.
 *
 * The check runs during the dispatch, so it also finds a composed event that
 * does not bubble: such an event still calls the listeners on each shadow host.
 */

/** The title of the root hooks that check for leaks. */
export const INNER_EVENTS_HOOK = 'inner events guard';

type GuardState = { pending: string[]; failures: string[] };

// A spec that imports this module can get a second instance of it, so the
// state lives on the global object and only the first instance patches.
const STATE_KEY = Symbol.for('igc.innerEventGuard');
const globals = globalThis as typeof globalThis & {
  [STATE_KEY]?: GuardState;
};

/**
 * Returns the leaks of the current test and clears them, so that a spec can
 * check the guard itself without a failure of its file.
 */
export function takeInnerEventLeaks(): string[] {
  return globals[STATE_KEY]?.pending.splice(0) ?? [];
}

function libraryHostOf(node: Node): Element | null {
  const root = node.getRootNode();

  return root instanceof ShadowRoot && root.host.localName.startsWith('igc-')
    ? root.host
    : null;
}

/** The `igc-*` hosts around `node`, from the outermost one in. */
function libraryHostsOf(node: Node): Element[] {
  const hosts: Element[] = [];

  for (let host = libraryHostOf(node); host; host = libraryHostOf(host)) {
    hosts.unshift(host);
  }

  return hosts;
}

/**
 * Mocha's BDD interface assigns `before` to the global object in
 * `mocha.setup()`. The setter registers a root hook at that moment. When a
 * spec file imports this module, mocha has the global already.
 */
function onMochaBefore(register: (before: Mocha.HookFunction) => void): void {
  const current = globalThis.before as Mocha.HookFunction | undefined;

  if (typeof current === 'function') {
    register(current);
    return;
  }

  let value: unknown;
  let registered = false;

  Object.defineProperty(globalThis, 'before', {
    configurable: true,
    get: () => value,
    set(next: Mocha.HookFunction) {
      value = next;

      if (!registered) {
        registered = true;
        register(next);
      }
    },
  });
}

function install(state: GuardState): void {
  const dispatchEvent = EventTarget.prototype.dispatchEvent;

  EventTarget.prototype.dispatchEvent = function (event: Event): boolean {
    const hosts =
      event.composed && event.type.startsWith('igc') && this instanceof Node
        ? libraryHostsOf(this)
        : [];

    if (!hosts.length) {
      return dispatchEvent.call(this, event);
    }

    const [host] = hosts;
    let leaked = false;
    const listener = (received: Event) => {
      leaked ||= received === event;
    };

    host.addEventListener(event.type, listener);

    try {
      return dispatchEvent.call(this, event);
    } finally {
      host.removeEventListener(event.type, listener);

      if (leaked) {
        // The last host in the chain is the composite that should stop it.
        const path = [...hosts, this as Node].map((node) =>
          node.nodeName.toLowerCase()
        );
        state.pending.push(`${path.join(' > ')}: ${event.type}`);
      }
    }
  };

  // Mocha runs the hooks of a suite in the order that they were added. The
  // spec files add their root hooks after `mocha.setup()`, so the checks go
  // in when the run starts, behind the teardown hooks of the specs.
  onMochaBefore((before) =>
    before(function () {
      const root = this.test!.parent!;

      root.afterEach(INNER_EVENTS_HOOK, function () {
        const title = this.currentTest?.fullTitle();

        for (const key of new Set(state.pending.splice(0))) {
          state.failures.push(`${title}: ${key}`);
        }
      });

      // A failing `afterEach` skips the remaining tests of its suite, so the
      // failure waits for the end of the file.
      root.afterAll(INNER_EVENTS_HOOK, () => {
        // Leaks after the last test, for example in an `after` hook.
        state.failures.push(...new Set(state.pending.splice(0)));

        if (state.failures.length) {
          throw new Error(
            `An inner event reached a component host:\n${state.failures.join('\n')}`
          );
        }
      });
    })
  );
}

if (!globals[STATE_KEY]) {
  globals[STATE_KEY] = { pending: [], failures: [] };
  install(globals[STATE_KEY]);
}

import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { createAbortHandle } from '../abort-handler.js';
import { isEmpty } from '../utils/arrays.js';

type RootClickControllerConfig = {
  /** Runs on an outside click. Defaults to the `hide()` method of the host. */
  onHide?: () => void;
  /** An additional element whose clicks do not hide the host. */
  target?: HTMLElement;
};

interface RootClickControllerHost extends ReactiveControllerHost, HTMLElement {
  open: boolean;
  keepOpenOnOutsideClick?: boolean;
  hide(): void;
}

/** Aborts the shared document listeners. */
const SHARED_ABORT_HANDLER = createAbortHandle();

/** The hosts that received a pointerdown event inside them. */
const POINTER_DOWN_HOSTS = new Set<RootClickControllerHost>();

const HOST_CONFIGURATIONS = new WeakMap<
  RootClickControllerHost,
  RootClickControllerConfig
>();

const ACTIVE_HOSTS = new Set<RootClickControllerHost>();

/**
 * Whether `path` contains the host or the `target` of its configuration.
 *
 * @remarks
 * The caller builds the composed path once per event, and a scan of it beats
 * a set for the one or two hosts that are open together.
 */
function isInsideHost(
  path: EventTarget[],
  host: RootClickControllerHost,
  target?: HTMLElement
): boolean {
  return path.includes(host) || (target != null && path.includes(target));
}

function handlePointerDown(event: PointerEvent): void {
  POINTER_DOWN_HOSTS.clear();
  const path = event.composedPath();

  for (const host of ACTIVE_HOSTS) {
    if (isInsideHost(path, host, HOST_CONFIGURATIONS.get(host)?.target)) {
      POINTER_DOWN_HOSTS.add(host);
    }
  }
}

function handleRootClick(event: PointerEvent): void {
  const path = event.composedPath();

  // A hidden host leaves ACTIVE_HOSTS, so the loop runs over a copy.
  for (const host of Array.from(ACTIVE_HOSTS)) {
    if (host.keepOpenOnOutsideClick || POINTER_DOWN_HOSTS.has(host)) {
      continue;
    }

    const config = HOST_CONFIGURATIONS.get(host);

    if (!isInsideHost(path, host, config?.target)) {
      config?.onHide ? config.onHide.call(host) : host.hide();
    }
  }

  POINTER_DOWN_HOSTS.clear();
}

/* blazorSuppress */
/**
 * Hides a component when a click occurs outside of it, or outside the
 * configured target.
 *
 * @remarks
 * The document keeps one pair of listeners for all active controllers, which
 * act on the hosts of a shared set.
 */
class RootClickController implements ReactiveController {
  private readonly _host: RootClickControllerHost;
  private _config?: RootClickControllerConfig;

  constructor(
    host: RootClickControllerHost,
    config?: RootClickControllerConfig
  ) {
    this._host = host;
    this._config = config;
    this._host.addController(this);

    if (this._config) {
      HOST_CONFIGURATIONS.set(this._host, this._config);
    }
  }

  /** Adds the host, and the document listeners for the first host. */
  private _addActiveHost(): void {
    const isFirstHost = isEmpty(ACTIVE_HOSTS);
    ACTIVE_HOSTS.add(this._host);

    if (isFirstHost) {
      const options: AddEventListenerOptions = {
        capture: true,
        signal: SHARED_ABORT_HANDLER.signal,
      };

      document.addEventListener('pointerdown', handlePointerDown, {
        ...options,
        passive: true,
      });
      document.addEventListener('click', handleRootClick, options);
    }
  }

  /** Removes the host, and the document listeners for the last host. */
  private _removeActiveHost(): void {
    ACTIVE_HOSTS.delete(this._host);
    POINTER_DOWN_HOSTS.delete(this._host);

    if (isEmpty(ACTIVE_HOSTS)) {
      SHARED_ABORT_HANDLER.abort();
    }
  }

  /** Activates while the host is open and not kept open on an outside click. */
  private _configureListeners(): void {
    this._host.open && !this._host.keepOpenOnOutsideClick
      ? this._addActiveHost()
      : this._removeActiveHost();
  }

  /** Updates the controller configuration and active state. */
  public update(config?: RootClickControllerConfig): void {
    if (config) {
      this._config = { ...this._config, ...config };
      HOST_CONFIGURATIONS.set(this._host, this._config);
    }

    this._configureListeners();
  }

  /** @internal */
  public hostConnected(): void {
    this._configureListeners();
  }

  /** @internal */
  public hostDisconnected(): void {
    this._removeActiveHost();
  }
}

/** Creates a {@link RootClickController} and adds it to `host`. */
export function addRootClickController(
  host: RootClickControllerHost,
  config?: RootClickControllerConfig
): RootClickController {
  return new RootClickController(host, config);
}

export type { RootClickController };

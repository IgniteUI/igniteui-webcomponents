import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { createAbortHandle } from '../abort-handler.js';
import { findElementFromEventPath, isEmpty } from '../util.js';

/** Configuration options for the RootClickController */
type RootClickControllerConfig = {
  /**
   * An optional callback function to execute when an outside click occurs.
   * If not provided, the `hide()` method of the host will be called.
   */
  onHide?: () => void;
  /**
   * An optional additional HTMLElement that, if clicked, should not trigger the hide action.
   * This is useful for elements like a toggle button that opens the component.
   */
  target?: HTMLElement;
};

/** Interface for the host element that the RootClickController will be attached to. */
interface RootClickControllerHost extends ReactiveControllerHost, HTMLElement {
  /**
   * Indicates whether the host element is currently open or visible.
   */
  open: boolean;
  /**
   * If true, outside clicks will not trigger the hide action.
   */
  keepOpenOnOutsideClick?: boolean;
  /**
   * A method on the host to hide or close itself.
   * This will be called if `hideCallback` is not provided in the config.
   */
  hide(): void;
}

let rootClickListenerActive = false;
let pointerDownInsideHost = false;

const HOST_CONFIGURATIONS = new WeakMap<
  RootClickControllerHost,
  RootClickControllerConfig
>();

const ACTIVE_HOSTS = new Set<RootClickControllerHost>();

function handlePointerDown(event: PointerEvent): void {
  // Check if the pointerdown occurred inside any active host or its target
  for (const host of ACTIVE_HOSTS) {
    const config = HOST_CONFIGURATIONS.get(host);
    const targets: Set<Element> = new Set(
      config?.target ? [host, config.target] : [host]
    );

    if (findElementFromEventPath((node) => targets.has(node), event)) {
      pointerDownInsideHost = true;
      return;
    }
  }

  pointerDownInsideHost = false;
}

function handleRootClick(event: PointerEvent): void {
  // If the interaction started inside a host, don't trigger hide
  if (pointerDownInsideHost) {
    pointerDownInsideHost = false;
    return;
  }

  for (const host of ACTIVE_HOSTS) {
    const config = HOST_CONFIGURATIONS.get(host);

    if (host.keepOpenOnOutsideClick) {
      continue;
    }

    const targets: Set<Element> = new Set(
      config?.target ? [host, config.target] : [host]
    );

    if (!findElementFromEventPath((node) => targets.has(node), event)) {
      config?.onHide ? config.onHide.call(host) : host.hide();
    }
  }
}

/* blazorSuppress */
/**
 * A Lit ReactiveController that manages global click listeners to hide a component
 * when a click occurs outside of the component or its specified target.
 *
 * This controller implements a singleton pattern for the document click listener,
 * meaning only one event listener is attached to `document` regardless of how many
 * instances of `RootClickController` are active. Each controller instance
 * subscribes to this single listener.
 */
class RootClickController implements ReactiveController {
  private readonly _host: RootClickControllerHost;
  private readonly _abortHandler = createAbortHandle();
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

  /**
   * Adds the host to the set of active hosts and ensures the global
   * document click listener is active if needed.
   */
  private _addActiveHost(): void {
    ACTIVE_HOSTS.add(this._host);

    if (this._config) {
      HOST_CONFIGURATIONS.set(this._host, this._config);

      if (!rootClickListenerActive) {
        const options = { capture: true, signal: this._abortHandler.signal };

        document.addEventListener('pointerdown', handlePointerDown, options);
        document.addEventListener('click', handleRootClick, options);
        rootClickListenerActive = true;
      }
    }
  }

  /**
   * Removes the host from the set of active hosts and removes the global
   * document click listener if no other hosts are active.
   */
  private _removeActiveHost(): void {
    ACTIVE_HOSTS.delete(this._host);

    if (isEmpty(ACTIVE_HOSTS) && rootClickListenerActive) {
      this._abortHandler.abort();
      rootClickListenerActive = false;
    }
  }

  /**
   * Configures the active state of the controller based on the host's `open` property.
   * If `host.open` is true, the controller becomes active; otherwise, it becomes inactive.
   */
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

/**
 * Creates and adds a {@link RootClickController} instance with a {@link RootClickControllerConfig | configuration}
 * to the given {@link RootClickControllerHost | host}.
 */
export function addRootClickController(
  host: RootClickControllerHost,
  config?: RootClickControllerConfig
): RootClickController {
  return new RootClickController(host, config);
}

export type { RootClickController };

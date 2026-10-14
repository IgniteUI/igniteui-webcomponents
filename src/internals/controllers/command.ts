import type { LitElement } from 'lit';
import { addHostListeners } from './host-listeners.js';

/**
 * Connects the native
 * [Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API)
 * to the programmatic API of a component.
 *
 * @remarks
 * An element with the `command` and `commandfor` attributes makes the browser
 * send a `CommandEvent` to the host, and the controller runs the callback of
 * that command string.
 *
 * @example
 * ```ts
 * class MyElement extends LitElement {
 *   constructor() {
 *     super();
 *     addCommandController(this).set('--next', this.next);
 *   }
 * }
 * ```
 */
class CommandController {
  private readonly _host: LitElement;
  private readonly _commandMap = new Map<string, () => unknown>();

  constructor(host: LitElement) {
    this._host = host;

    addHostListeners(host, { events: ['command'], listener: this });
  }

  /**
   * Registers a command string and its handler callback.
   *
   * @param command - The command string to listen for, for example the
   *   built-in `'toggle-popover'` or a custom `'--show'`.
   * @param callback - The method that runs when the command arrives. The
   *   controller calls it with the host as `this`.
   */
  public set(command: string, callback: () => unknown): this {
    this._commandMap.set(command, callback);
    return this;
  }

  /** @internal */
  public handleEvent(event: Event): void {
    const commandEvent = event as CommandEvent;
    this._commandMap.get(commandEvent.command)?.call(this._host);
  }
}

/** Creates a {@link CommandController} and adds it to the given host. */
export function addCommandController(host: LitElement): CommandController {
  return new CommandController(host);
}

type ToggleCommandsHost = LitElement & {
  show(): unknown;
  hide(): unknown;
  toggle(): unknown;
};

/**
 * Adds a {@link CommandController} that runs the `show`, `hide` and `toggle`
 * methods of the host for the `--show`, `--hide` and `--toggle` commands.
 */
export function addToggleCommands(host: ToggleCommandsHost): CommandController {
  return addCommandController(host)
    .set('--show', host.show)
    .set('--hide', host.hide)
    .set('--toggle', host.toggle);
}

export type { CommandController };

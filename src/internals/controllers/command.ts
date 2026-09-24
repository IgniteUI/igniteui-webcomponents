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
 * class IgcDialogComponent extends LitElement {
 *   private readonly _commands = addCommandController(this)
 *     .set('open', this.show)
 *     .set('close', this.hide)
 *     .set('toggle-popover', this.toggle);
 * }
 * ```
 *
 * A button in the document then controls the dialog declaratively:
 *
 * ```html
 * <igc-button command="open" commandfor="my-dialog">Open</igc-button>
 * <igc-dialog id="my-dialog"></igc-dialog>
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
   * @param command - The command string to listen for, for example `'open'`,
   *   `'toggle-popover'`, or a custom `'--my-command'`.
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

export type { CommandController };

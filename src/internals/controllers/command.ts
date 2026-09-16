import type { LitElement, ReactiveController } from 'lit';

/**
 * A Lit reactive controller that bridges the native
 * [Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API)
 * with a component's programmatic API.
 *
 * When an `igc-button` (or any element using the `command` / `commandfor`
 * attributes) invokes a command on the host, the browser dispatches a
 * `CommandEvent` on the target element. This controller listens for that
 * event and forwards it to the registered callback for the given command
 * string.
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
 * With the above setup, a button in the document can control the dialog
 * declaratively:
 *
 * ```html
 * <igc-button command="open" commandfor="my-dialog">Open</igc-button>
 * <igc-dialog id="my-dialog"></igc-dialog>
 * ```
 */
class CommandController implements ReactiveController {
  private readonly _host: LitElement;
  private readonly _commandMap = new Map<string, () => unknown>();

  constructor(host: LitElement) {
    this._host = host;
    host.addController(this);
  }

  /**
   * Registers a command string and its corresponding handler callback.
   *
   * Returns `this` to allow chained calls:
   * ```ts
   * addCommandController(this)
   *   .set('open', this.show)
   *   .set('close', this.hide);
   * ```
   *
   * @param command - The command string to listen for (e.g. `'open'`,
   *   `'toggle-popover'`, or a custom `'--my-command'`).
   * @param callback - The method to invoke when the command is received.
   *   Called with the host as `this`.
   */
  public set(command: string, callback: () => unknown): this {
    this._commandMap.set(command, callback);
    return this;
  }

  /** @internal */
  public hostConnected(): void {
    this._host.addEventListener('command', this);
  }

  /** @internal */
  public hostDisconnected(): void {
    this._host.removeEventListener('command', this);
  }

  /** @internal */
  public handleEvent(event: Event): void {
    const commandEvent = event as CommandEvent;
    this._commandMap.get(commandEvent.command)?.call(this._host);
  }
}

/**
 * Creates a {@link CommandController} and attaches it to the given host.
 */
export function addCommandController(host: LitElement): CommandController {
  return new CommandController(host);
}

export type { CommandController };

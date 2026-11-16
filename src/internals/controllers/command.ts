import type { LitElement } from 'lit';
import { addSafeEventListeners } from '../utils/events.js';

type ToggleCommandsHost = LitElement & {
  show(): unknown;
  hide(): unknown;
  toggle(): unknown;
};

const TOGGLE_COMMANDS = new Map<string, 'show' | 'hide' | 'toggle'>([
  ['--show', 'show'],
  ['--hide', 'hide'],
  ['--toggle', 'toggle'],
]);

function handleCommand(this: ToggleCommandsHost, event: Event): void {
  const method = TOGGLE_COMMANDS.get((event as CommandEvent).command);

  if (method) {
    this[method]();
  }
}

/** Runs the host `show`, `hide` and `toggle` for the `--show`, `--hide` and `--toggle` invoker commands. */
export function addToggleCommands(host: ToggleCommandsHost): void {
  addSafeEventListeners(host, ['command'], handleCommand);
}

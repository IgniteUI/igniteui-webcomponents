import { html, type TemplateResult } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import type { Theme } from '#theming/types.js';
// Satisfies the lit-analyzer element resolution for `igc-button`. No side
// effects; the consuming components register the button.
import './button.js';

interface ActionButton {
  label: string;
  onClick: (event: MouseEvent) => void;
  part?: string;
}

interface ConfirmButtonsOptions {
  theme: Theme;
  cancel: ActionButton;
  confirm: ActionButton;
  slot?: string;
}

/**
 * Renders the cancel and confirm buttons of a popup, such as Cancel and Apply:
 * an outlined and a contained button in Indigo, two flat buttons in the other
 * themes. The caller owns the wrapping element and registers the button.
 */
export function renderConfirmButtons({
  theme,
  cancel,
  confirm,
  slot,
}: ConfirmButtonsOptions): TemplateResult {
  const indigo = theme === 'indigo';

  return html`
    <igc-button
      part=${ifDefined(cancel.part)}
      slot=${ifDefined(slot)}
      variant=${indigo ? 'outlined' : 'flat'}
      @click=${cancel.onClick}
      >${cancel.label}</igc-button
    >
    <igc-button
      part=${ifDefined(confirm.part)}
      slot=${ifDefined(slot)}
      variant=${indigo ? 'contained' : 'flat'}
      @click=${confirm.onClick}
      >${confirm.label}</igc-button
    >
  `;
}

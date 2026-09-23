import { html, type TemplateResult } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
// Satisfies the lit-analyzer element resolution for `igc-icon`. No side
// effects; the consuming components register the icon.
import '../../components/icon/icon.js';
import { bindIf } from '../utils/lit.js';

export interface SlottedIconOptions {
  /** The name of the slot that overrides the default icon. */
  slot: string;
  /** The registry name of the default icon in the fallback content. */
  icon: string;
  /** Controls the `hidden` attribute of the slot element. */
  hidden?: boolean;
  /** The `title` of the default icon. */
  title?: string;
  /** The accessible label of the default icon. Suppresses `aria-hidden`. */
  label?: string;
  /**
   * Adds `aria-hidden="true"` to a default icon that has no label. Pass
   * `false` when an ancestor already hides the icon.
   *
   * @default true
   */
  ariaHidden?: boolean;
}

/**
 * Renders a named slot with a default icon from the `default` collection as
 * the fallback content. The caller owns the wrapping element and registers
 * the icon component.
 */
export function renderSlottedIcon(options: SlottedIconOptions): TemplateResult {
  const ariaHidden = options.label ? false : (options.ariaHidden ?? true);

  return html`
    <slot name=${options.slot} ?hidden=${options.hidden ?? false}>
      <igc-icon
        name=${options.icon}
        collection="default"
        title=${ifDefined(options.title)}
        aria-label=${ifDefined(options.label)}
        aria-hidden=${bindIf(ariaHidden, 'true')}
      ></igc-icon>
    </slot>
  `;
}

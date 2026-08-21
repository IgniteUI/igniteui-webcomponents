import { html, type TemplateResult } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
// The import satisfies the lit-analyzer element resolution for `igc-icon`.
// It carries no side effects - registration stays with the consuming components.
import '../../components/icon/icon.js';
import { bindIf } from '../utils/lit.js';

export interface SlottedIconOptions {
  /** The name of the slot that overrides the default icon. */
  slot: string;
  /** The registry name of the default icon rendered as fallback content. */
  icon: string;
  /** Controls the `hidden` attribute of the slot element. */
  hidden?: boolean;
  /** The `title` of the default icon. */
  title?: string;
  /**
   * The accessible label of the default icon. When set, the icon is exposed
   * to the accessibility tree with that label instead of being `aria-hidden`.
   */
  label?: string;
  /**
   * Whether an unlabeled default icon carries `aria-hidden="true"`.
   * Pass false when an ancestor element already hides the icon from the
   * accessibility tree.
   *
   * @default true
   */
  ariaHidden?: boolean;
}

/**
 * Renders a named slot with a default icon from the internal collection as
 * fallback content - the "overridable built-in control" idiom of the library.
 * Callers own the wrapping element with its parts, visibility gating and
 * event handlers, and must register the icon component themselves.
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

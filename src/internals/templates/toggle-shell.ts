import { html, nothing, type TemplateResult } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { partMap } from '../part-map.js';
import { bindIf } from '../utils/lit.js';

export interface ToggleShellOptions {
  /** The type of the native input element. */
  type: 'checkbox' | 'radio';
  /** The id of the native input; the `for` target of the wrapping label. */
  inputId: string;
  /** The id of the label span, the fallback `aria-labelledby` target. */
  labelId: string;
  /** Resolved part-name map for the wrapping label element. */
  baseParts: Record<string, boolean>;
  /** Resolved part-name map for the control span. */
  controlParts: Record<string, boolean>;
  /** Resolved part-name map for the label span. */
  labelParts: Record<string, boolean>;
  /** Renders the control indicator inside the control span. */
  renderControl: () => TemplateResult;
  /** Current checked state rendered through `live()`. */
  checked: boolean;
  /** Hides the label span when the default slot has no assigned content. */
  hideLabel: boolean;
  name?: string;
  value?: string;
  required: boolean;
  disabled: boolean;
  /**
   * The current indeterminate state, rendered through `live()`. Defaults to
   * `false`, and `live()` then writes nothing.
   */
  indeterminate?: boolean;
  /** When provided, sets the `tabindex` attribute. */
  tabindex?: number;
  /** Resolved `aria-labelledby` target - an external id or `labelId`. */
  ariaLabelledBy: string;
  /** When provided, sets the `aria-describedby` attribute. */
  ariaDescribedBy?: string;

  onClick: (event: PointerEvent) => void;
  onKeyDown: (event: KeyboardEvent) => void;
  onBlur?: () => void;
}

/**
 * Renders the native input and its wrapping label for a toggle control, with
 * the input bindings, so a leaf component describes only its part maps and
 * its control indicator.
 */
export function renderToggleShell(options: ToggleShellOptions): TemplateResult {
  return html`
    <label part=${partMap(options.baseParts)} for=${options.inputId}>
      <input
        id=${options.inputId}
        type=${options.type}
        name=${ifDefined(options.name)}
        value=${ifDefined(options.value)}
        ?required=${options.required}
        ?disabled=${options.disabled}
        .checked=${live(options.checked)}
        .indeterminate=${live(options.indeterminate ?? false)}
        tabindex=${bindIf(options.tabindex != null, options.tabindex)}
        aria-labelledby=${options.ariaLabelledBy}
        aria-describedby=${ifDefined(options.ariaDescribedBy)}
        @keydown=${options.onKeyDown}
        @click=${options.onClick}
        @blur=${options.onBlur ?? nothing}
      />
      <span part=${partMap(options.controlParts)}
        >${options.renderControl()}</span
      >
      <span
        id=${options.labelId}
        part=${partMap(options.labelParts)}
        ?hidden=${options.hideLabel}
      >
        <slot></slot>
      </span>
    </label>
  `;
}

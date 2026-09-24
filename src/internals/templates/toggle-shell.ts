import { html, nothing, type TemplateResult } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { ariaBindings, resolveNaming } from '../controllers/aria-projection.js';
import { partMap } from '../part-map.js';
import { bindIf } from '../utils/lit.js';

export interface ToggleShellOptions {
  /** The type of the native input element. */
  type: 'checkbox' | 'radio';
  /** The id of the native input; the `for` target of the wrapping label. */
  inputId: string;
  /** The id of the label span. */
  labelId: string;
  /** Resolved part-name map for the wrapping label element. */
  baseParts: Record<string, boolean>;
  /** Resolved part-name map for the control span. */
  controlParts: Record<string, boolean>;
  /** Resolved part-name map for the label span. */
  labelParts: Record<string, boolean>;
  /** Renders the control indicator inside the control span. */
  renderControl: () => TemplateResult;
  /** Hides the label span when the default slot has no assigned content. */
  hideLabel: boolean;
  /**
   * The current indeterminate state, rendered through `live()`. Defaults to
   * `false`, and `live()` then writes nothing.
   */
  indeterminate?: boolean;
  /** When provided, sets the `tabindex` attribute. */
  tabindex?: number;
  /** The id of the helper-text container that describes the native input. */
  describedBy?: string;

  onClick: (event: PointerEvent) => void;
  onKeyDown: (event: KeyboardEvent) => void;
  onBlur?: () => void;
}

/** The host state that {@link renderToggleShell} binds onto the native input. */
type ToggleShellHost = HTMLElement & {
  checked: boolean;
  disabled: boolean;
  required: boolean;
  name?: string;
  value?: string;
};

/**
 * Renders the native input and its wrapping label for a toggle control, with
 * the input bindings and the name, so a leaf component describes only its part
 * maps and its control indicator.
 */
export function renderToggleShell(
  host: ToggleShellHost,
  options: ToggleShellOptions
): TemplateResult {
  const aria = {
    ...resolveNaming(host, !options.hideLabel && options.labelId),
    describedByRef: options.describedBy,
  };

  return html`
    <label part=${partMap(options.baseParts)} for=${options.inputId}>
      <input
        ${ariaBindings(aria)}
        id=${options.inputId}
        type=${options.type}
        name=${ifDefined(host.name)}
        value=${ifDefined(host.value)}
        ?required=${host.required}
        ?disabled=${host.disabled}
        .checked=${live(host.checked)}
        .indeterminate=${live(options.indeterminate ?? false)}
        tabindex=${bindIf(options.tabindex != null, options.tabindex)}
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

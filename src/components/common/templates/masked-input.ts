import { html, type TemplateResult } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { partMap } from '../part-map.js';
import { bindIf } from '../util.js';

export interface MaskedInputOptions {
  /** Optional id for the native input element. */
  id?: string;
  /** Resolved part-name map applied to the input. */
  partNames: Record<string, boolean>;
  /** The form-associated name attribute. */
  name?: string;
  /** Current value to render through `live()`. */
  value: string;
  /** Pre-resolved placeholder text. Caller decides empty-string semantics. */
  placeholder: string;
  readOnly: boolean;
  disabled: boolean;
  autofocus?: boolean;
  inputMode?: string;
  /** When provided, sets the `tabindex` attribute. */
  tabindex?: number;
  /** When provided, sets the `aria-describedby` attribute. */
  ariaDescribedBy?: string;

  // Required mask handlers
  onInput: (event: InputEvent) => void;
  onFocus: (event: FocusEvent) => void;
  onBlur: (event: FocusEvent) => void;
  onClick: () => void;
  /** Wired to `keydown`, `cut`, and `dragstart` to capture the current selection. */
  onSetMaskSelection: () => void;
  onCompositionStart: () => void;
  onCompositionEnd: (event: CompositionEvent) => void;

  // Optional handlers
  onChange?: () => void;
  onWheel?: (event: WheelEvent) => void;
  onDragEnter?: () => void;
  onDragLeave?: () => void;
}

/**
 * Renders the native `<input>` element shared by mask-driven components
 * (`igc-mask-input`, `igc-date-time-input`, `igc-date-range-input`).
 * Centralizes mask event wiring so leaves only describe their extras.
 */
export function renderMaskedNativeInput(
  opts: MaskedInputOptions
): TemplateResult {
  return html`
    <input
      id=${ifDefined(opts.id)}
      type="text"
      part=${partMap(opts.partNames)}
      name=${ifDefined(opts.name)}
      .value=${live(opts.value)}
      .placeholder=${opts.placeholder}
      ?readonly=${opts.readOnly}
      ?disabled=${opts.disabled}
      ?autofocus=${opts.autofocus}
      inputmode=${ifDefined(opts.inputMode)}
      tabindex=${bindIf(opts.tabindex !== undefined, opts.tabindex)}
      aria-describedby=${bindIf(!!opts.ariaDescribedBy, opts.ariaDescribedBy)}
      @input=${opts.onInput}
      @focus=${opts.onFocus}
      @blur=${opts.onBlur}
      @click=${opts.onClick}
      @keydown=${opts.onSetMaskSelection}
      @cut=${opts.onSetMaskSelection}
      @dragstart=${opts.onSetMaskSelection}
      @compositionstart=${opts.onCompositionStart}
      @compositionend=${opts.onCompositionEnd}
      @change=${opts.onChange}
      @wheel=${opts.onWheel}
      @dragenter=${opts.onDragEnter}
      @dragleave=${opts.onDragLeave}
    />
  `;
}

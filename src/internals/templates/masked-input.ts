import { html, type TemplateResult } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import {
  ariaBindings,
  type ResolvedARIABindings,
} from '../controllers/aria-projection.js';
import { partMap } from '../part-map.js';
import { bindIf } from '../utils/lit.js';

export interface MaskedInputOptions {
  /** Optional id for the native input element. */
  id?: string;
  /** Resolved part-name map applied to the input. */
  partNames: Record<string, boolean>;
  /** The form-associated name attribute. */
  name?: string;
  /** Current value to render through `live()`. */
  value: string;
  /** The resolved placeholder text. The caller defines an empty string. */
  placeholder: string;
  readOnly: boolean;
  disabled: boolean;
  autofocus?: boolean;
  inputMode?: string;
  /** When provided, sets the `tabindex` attribute. */
  tabindex?: number;
  /**
   * The projected host state merged with the editor bindings. See
   * `AriaTargetController.resolveBindings`.
   */
  aria: ResolvedARIABindings;

  // Required mask handlers
  onInput: (event: InputEvent) => void;
  /** Owns `historyUndo` and `historyRedo` through `beforeinput`. */
  onBeforeInput: (event: InputEvent) => void;
  onFocus: (event: FocusEvent) => void;
  onBlur: (event: FocusEvent) => void;
  onClick: () => void;
  /** Captures the selection on `keydown`, `cut` and `dragstart`. */
  onSetMaskSelection: (event: Event) => void;
  onCompositionStart: () => void;
  onCompositionEnd: (event: CompositionEvent) => void;

  // Optional handlers
  onChange?: () => void;
  onWheel?: (event: WheelEvent) => void;
  onDragEnter?: () => void;
  onDragLeave?: () => void;
}

/**
 * Renders the native `<input>` of the mask-driven components, with the mask
 * event bindings, so a leaf component describes only its extras.
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
      tabindex=${bindIf(opts.tabindex != null, opts.tabindex)}
      ${ariaBindings(opts.aria)}
      @input=${opts.onInput}
      @beforeinput=${opts.onBeforeInput}
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

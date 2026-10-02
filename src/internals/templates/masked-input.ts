import { html, type TemplateResult } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import {
  ariaBindings,
  type ResolvedARIABindings,
} from '../controllers/aria-projection.js';
import { partMap } from '../part-map.js';
import { hasNegativeTabIndex } from '../utils/dom.js';
import { bindIf } from '../utils/lit.js';

export interface MaskedInputOptions {
  id?: string;
  /** Resolved part-name map applied to the input. */
  partNames: Record<string, boolean>;
  /** Current value to render through `live()`. */
  value: string;
  /** The resolved placeholder text. The caller defines an empty string. */
  placeholder: string;
  autofocus?: boolean;
  inputMode?: string;
  /**
   * The projected host state merged with the editor bindings. See
   * `AriaTargetController.resolveBindings`.
   */
  aria: ResolvedARIABindings;

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

  onChange?: () => void;
  onWheel?: (event: WheelEvent) => void;
  onDragEnter?: () => void;
  onDragLeave?: () => void;
}

/** The host state that {@link renderMaskedNativeInput} binds onto the native input. */
type MaskedInputHost = Element & {
  name?: string;
  readOnly: boolean;
  disabled: boolean;
  /** Binds `aria-required`: the native `required` would validate the prompts. */
  required: boolean;
};

/**
 * Renders the native `<input>` of the mask-driven components, with the mask
 * event bindings, so a leaf component describes only its extras.
 */
export function renderMaskedNativeInput(
  host: MaskedInputHost,
  opts: MaskedInputOptions
): TemplateResult {
  return html`
    <input
      id=${ifDefined(opts.id)}
      type="text"
      part=${partMap(opts.partNames)}
      name=${ifDefined(host.name)}
      .value=${live(opts.value)}
      .placeholder=${opts.placeholder}
      ?readonly=${host.readOnly}
      ?disabled=${host.disabled}
      ?autofocus=${opts.autofocus}
      inputmode=${ifDefined(opts.inputMode)}
      tabindex=${bindIf(hasNegativeTabIndex(host), -1)}
      ${ariaBindings(host.required ? { ...opts.aria, required: 'true' } : opts.aria)}
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

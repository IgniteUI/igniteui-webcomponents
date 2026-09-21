import { html, nothing, type TemplateResult } from 'lit';
import IgcValidationContainerComponent from '../../components/validation-container/validation-container.js';
import type { SlotController } from '../controllers/slot.js';
import type { IgcFormControl } from '../mixins/forms/types.js';
import { partMap } from '../part-map.js';
import { stopPropagation } from '../utils/events.js';
import { createIdGenerator } from '../utils/strings.js';

/** Returns a unique id for a native input element. */
export const nextInputId = createIdGenerator('input');

/** Returns the shared container part names of an input-like component. */
export function resolveInputPartNames(
  slots: Pick<SlotController<'prefix' | 'suffix'>, 'hasAssignedElements'>,
  base: string,
  filled: boolean
): Record<string, boolean> {
  return {
    [base]: true,
    prefixed: slots.hasAssignedElements('prefix', {
      selector: '[slot="prefix"]:not([hidden])',
    }),
    suffixed: slots.hasAssignedElements('suffix', {
      selector: '[slot="suffix"]:not([hidden])',
    }),
    filled,
  };
}

export interface InputShellOptions {
  /** Active theme name. The `material` theme uses the notch layout. */
  theme: string;
  /** The label text. Empty string skips label rendering. */
  label: string;
  /** The id of the input element used by the label `for` attribute. */
  labelId: string;
  /** Resolved part-name map for the container element. */
  containerParts: Record<string, boolean>;
  /** Renders the native `<input>` element. */
  renderInput: () => TemplateResult;
  /** Renders extra parts inside the container, as `igc-file-input` needs. */
  renderFileParts?: () => TemplateResult | typeof nothing;
  /** Container part names that only the material notch layout adds. */
  materialParts?: Record<string, boolean>;
  /**
   * Hides the prefix and suffix wrappers whose `containerParts` entry is
   * false. Off by default, so the wrappers always render.
   */
  hideEmptyAffixes?: boolean;
}

/**
 * Renders the label of the input.
 *
 * @remarks
 * A label click reaches the host twice: the label click, then the synthetic
 * click that label activation sends to the input. That double-fires a
 * consumer click handler and breaks the toggles of `igc-combo` and
 * `igc-select`. The label therefore keeps its own click inside the shadow
 * root; activation is a default action, so focus still moves to the input.
 */
function renderLabel(forId: string, label: string) {
  return label
    ? html`<label part="label" for=${forId} @click=${stopPropagation}
        >${label}</label
      >`
    : nothing;
}

function renderAffix(name: 'prefix' | 'suffix', hidden: boolean) {
  return html`<div part=${name} ?hidden=${hidden}>
    <slot name=${name}></slot>
  </div>`;
}

/**
 * Renders the label, prefix, suffix and validation container around the input
 * template of a leaf component, in the notch or the standard layout.
 */
export function renderInputShell(
  host: IgcFormControl,
  {
    containerParts,
    materialParts,
    hideEmptyAffixes = false,
    renderFileParts,
    renderInput,
    theme,
    label,
    labelId,
  }: InputShellOptions
): TemplateResult {
  const validator = IgcValidationContainerComponent.create(host);
  const input = renderInput.call(host);
  const fileParts = renderFileParts?.call(host) ?? nothing;
  const prefix = renderAffix(
    'prefix',
    hideEmptyAffixes && !containerParts.prefixed
  );
  const suffix = renderAffix(
    'suffix',
    hideEmptyAffixes && !containerParts.suffixed
  );

  if (theme === 'material') {
    return html`
      <div
        part=${partMap({
          ...containerParts,
          ...materialParts,
          labelled: !!label,
        })}
      >
        <div part="start">${prefix}</div>
        ${input}${fileParts}
        <div part="notch">${renderLabel(labelId, label)}</div>
        <div part="filler"></div>
        <div part="end">${suffix}</div>
      </div>
      ${validator}
    `;
  }

  return html`
    ${renderLabel(labelId, label)}
    <div part=${partMap(containerParts)}>
      ${prefix}${fileParts}${input}${suffix}
    </div>
    ${validator}
  `;
}

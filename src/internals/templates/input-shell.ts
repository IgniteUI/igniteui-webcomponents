import { html, nothing, type TemplateResult } from 'lit';
import IgcValidationContainerComponent from '../../components/validation-container/validation-container.js';
import type { SlotController } from '../controllers/slot.js';
import type { IgcFormControl } from '../mixins/forms/types.js';
import { partMap } from '../part-map.js';
import { createIdGenerator } from '../utils/strings.js';

/** Returns a unique id for native input elements rendered by input components. */
export const nextInputId = createIdGenerator('input');

/**
 * Resolves the shared container part names of an input-like component based
 * on its current slotted and filled state.
 * Used to apply conditional styling via CSS parts.
 */
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
  /** Optional renderer for components that need extra parts inside the container (e.g. file-input). */
  renderFileParts?: () => TemplateResult | typeof nothing;
}

function renderLabel(forId: string, label: string) {
  return label
    ? html`<label part="label" for=${forId}>${label}</label>`
    : nothing;
}

function renderPrefix() {
  return html`<div part="prefix"><slot name="prefix"></slot></div>`;
}

function renderSuffix() {
  return html`<div part="suffix"><slot name="suffix"></slot></div>`;
}

/**
 * Renders the shared input chrome (label, prefix, suffix, validator container)
 * around a leaf-provided input template, switching layouts between the
 * material notch and the standard flow.
 */
export function renderInputShell(
  host: IgcFormControl,
  {
    containerParts,
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

  if (theme === 'material') {
    return html`
      <div part=${partMap({ ...containerParts, labelled: !!label })}>
        <div part="start">${renderPrefix()}</div>
        ${input}${fileParts}
        <div part="notch">${renderLabel(labelId, label)}</div>
        <div part="filler"></div>
        <div part="end">${renderSuffix()}</div>
      </div>
      ${validator}
    `;
  }

  return html`
    ${renderLabel(labelId, label)}
    <div part=${partMap(containerParts)}>
      ${renderPrefix()}${fileParts}${input}${renderSuffix()}
    </div>
    ${validator}
  `;
}

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
  /**
   * Container part names contributed only by the material notch layout
   * (e.g. the `placeholder` part of `igc-textarea`).
   */
  materialParts?: Record<string, boolean>;
  /**
   * Whether the prefix/suffix wrappers are hidden while their slot has no
   * visible assigned elements, driven by the `prefixed` and `suffixed` entries
   * of `containerParts`. Off by default, so the wrappers always render.
   */
  hideEmptyAffixes?: boolean;
}

function renderLabel(forId: string, label: string) {
  return label
    ? html`<label part="label" for=${forId}>${label}</label>`
    : nothing;
}

function renderAffix(name: 'prefix' | 'suffix', hidden: boolean) {
  return html`<div part=${name} ?hidden=${hidden}>
    <slot name=${name}></slot>
  </div>`;
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

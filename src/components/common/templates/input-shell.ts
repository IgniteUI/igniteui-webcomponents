import { html, nothing, type TemplateResult } from 'lit';
import IgcValidationContainerComponent from '../../validation-container/validation-container.js';
import type { IgcFormControl } from '../mixins/forms/types.js';
import { partMap } from '../part-map.js';

let _nextInputId = 1;

/** Returns a unique id for native input elements rendered by input components. */
export function nextInputId(): string {
  return `input-${_nextInputId++}`;
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
  opts: InputShellOptions
): TemplateResult {
  const validator = IgcValidationContainerComponent.create(host);
  const fileParts = opts.renderFileParts?.() ?? nothing;

  if (opts.theme === 'material') {
    return html`
      <div part=${partMap({ ...opts.containerParts, labelled: !!opts.label })}>
        <div part="start">${renderPrefix()}</div>
        ${opts.renderInput()} ${fileParts}
        <div part="notch">${renderLabel(opts.labelId, opts.label)}</div>
        <div part="filler"></div>
        <div part="end">${renderSuffix()}</div>
      </div>
      ${validator}
    `;
  }

  return html`
    ${renderLabel(opts.labelId, opts.label)}
    <div part=${partMap(opts.containerParts)}>
      ${renderPrefix()}${fileParts}${opts.renderInput()}${renderSuffix()}
    </div>
    ${validator}
  `;
}

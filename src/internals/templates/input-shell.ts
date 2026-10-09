import { html, nothing, type TemplateResult } from 'lit';
import { cache } from 'lit/directives/cache.js';
import IgcValidationContainerComponent from '../../components/validation-container/validation-container.js';
import type { SlotController } from '../controllers/slot.js';
import type { IgcFormControl } from '../mixins/forms/types.js';
import { partMap } from '../part-map.js';
import { stopPropagation } from '../utils/events.js';
import { createIdGenerator } from '../utils/strings.js';

/** Returns a unique id for a native input element. */
export const nextInputId = createIdGenerator('input');

type PartSlots = Pick<
  SlotController<'prefix' | 'suffix'>,
  'hasAssignedElements'
>;

/** An element assigned to a named slot without flattening has its `slot` attribute. */
const VISIBLE = { selector: ':not([hidden])' };

/** Returns the `prefixed`, `suffixed` and `filled` parts of an input-like component. */
export function resolveInputPartFlags(
  slots: PartSlots,
  filled: boolean
): Record<string, boolean> {
  return {
    prefixed: slots.hasAssignedElements('prefix', VISIBLE),
    suffixed: slots.hasAssignedElements('suffix', VISIBLE),
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
  /**
   * Hides the prefix and suffix wrappers whose `containerParts` entry is
   * false. Off by default, so the wrappers always render.
   */
  hideEmptyAffixes?: boolean;
}

/**
 * Renders the label of the input. The label stops its own click, because a label click
 * otherwise reaches the host twice and breaks the `igc-combo` and `igc-select` toggles.
 * Activation is a default action, so focus still moves.
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
    hideEmptyAffixes = false,
    renderFileParts,
    renderInput,
    theme,
    label,
    labelId,
  }: InputShellOptions
) {
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
    return cache(html`
      <div part=${partMap({ ...containerParts, labelled: !!label })}>
        <div part="start">${prefix}</div>
        ${input}${fileParts}
        <div part="notch">${renderLabel(labelId, label)}</div>
        <div part="filler"></div>
        <div part="end">${suffix}</div>
      </div>
      ${validator}
    `);
  }

  return cache(html`
    ${renderLabel(labelId, label)}
    <div part=${partMap(containerParts)}>
      ${prefix}${fileParts}${input}${suffix}
    </div>
    ${validator}
  `);
}

import type { ComponentThemes } from '#theming/types.js';
// Shared Styles
import { styles as bootstrap } from './shared/item/dropdown-item.bootstrap.css.js';
import { styles as fluent } from './shared/item/dropdown-item.fluent.css.js';
import { styles as indigo } from './shared/item/dropdown-item.indigo.css.js';

const light = {
  bootstrap,
  indigo,
  fluent,
};

const dark = {
  bootstrap,
  indigo,
  fluent,
};

export const all: ComponentThemes = { light, dark };

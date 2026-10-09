import type { ComponentThemes } from '#theming/types.js';
// Shared Styles
import { styles as bootstrap } from './shared/item/list-item.bootstrap.css.js';
import { styles as fluent } from './shared/item/list-item.fluent.css.js';
import { styles as indigo } from './shared/item/list-item.indigo.css.js';

const light = {
  bootstrap,
  fluent,
  indigo,
};

const dark = {
  bootstrap,
  fluent,
  indigo,
};

export const all: ComponentThemes = { light, dark };

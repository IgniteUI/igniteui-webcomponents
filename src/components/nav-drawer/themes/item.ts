import type { ComponentThemes } from '#theming/types.js';
// Shared Styles
import { styles as bootstrap } from './shared/item/item.bootstrap.css.js';
import { styles as fluent } from './shared/item/item.fluent.css.js';
import { styles as indigo } from './shared/item/item.indigo.css.js';
import { styles as material } from './shared/item/item.material.css.js';

const light = {
  bootstrap,
  material,
  fluent,
  indigo,
};

const dark = {
  bootstrap,
  material,
  fluent,
  indigo,
};

export const all: ComponentThemes = { light, dark };

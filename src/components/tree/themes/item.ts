import type { ComponentThemes } from '#theming/types.js';
// Share Styles
import { styles as indigo } from './shared/item.indigo.css.js';
import { styles as material } from './shared/item.material.css.js';

const light = {
  material,
  indigo,
};

const dark = {
  material,
  indigo,
};

export const all: ComponentThemes = { light, dark };

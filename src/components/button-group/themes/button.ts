import type { ComponentThemes } from '#theming/types.js';
// Shared Styles
import { styles as bootstrap } from './shared/button/button.bootstrap.css.js';
import { styles as fluent } from './shared/button/button.fluent.css.js';
import { styles as indigo } from './shared/button/button.indigo.css.js';
import { styles as material } from './shared/button/button.material.css.js';

const light = {
  bootstrap,
  fluent,
  indigo,
  material,
};

const dark = {
  bootstrap,
  fluent,
  indigo,
  material,
};

export const all: ComponentThemes = { light, dark };

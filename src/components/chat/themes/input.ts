import type { ComponentThemes } from '#theming/types.js';
// Shared Styles
import { styles as bootstrap } from './shared/input/input.bootstrap.css.js';
import { styles as fluent } from './shared/input/input.fluent.css.js';
import { styles as indigo } from './shared/input/input.indigo.css.js';
import { styles as material } from './shared/input/input.material.css.js';

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

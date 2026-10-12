import type { ComponentThemes } from '#theming/types.js';
// Shared Styles
import { styles as bootstrap } from './shared/tab/tab.bootstrap.css.js';
import { styles as fluent } from './shared/tab/tab.fluent.css.js';
import { styles as indigo } from './shared/tab/tab.indigo.css.js';
import { styles as material } from './shared/tab/tab.material.css.js';

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

import type { ComponentThemes } from '#theming/types.js';
// Shared Styles
import { styles as bootstrap } from './shared/tile/tile.bootstrap.css.js';
import { styles as fluent } from './shared/tile/tile.fluent.css.js';
import { styles as indigo } from './shared/tile/tile.indigo.css.js';

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

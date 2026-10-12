import type { ComponentThemes } from '#theming/types.js';
// Shared Styles
import { styles as bootstrap } from './shared/indicator-container/indicator-container.bootstrap.css.js';
import { styles as fluent } from './shared/indicator-container/indicator-container.fluent.css.js';
import { styles as indigo } from './shared/indicator-container/indicator-container.indigo.css.js';

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

import type { ComponentThemes } from '#theming/types.js';
import { styles as fluent } from './shared/header/dropdown-header.fluent.css.js';
// Shared Styles
import { styles as indigo } from './shared/header/dropdown-header.indigo.css.js';

const light = {
  indigo,
  fluent,
};

const dark = {
  indigo,
  fluent,
};

export const all: ComponentThemes = { light, dark };

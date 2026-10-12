import type { ComponentThemes } from '#theming/types.js';
// Shared Styles
import { styles as bootstrap } from './shared/header/card.header.bootstrap.css.js';
import { styles as fluent } from './shared/header/card.header.fluent.css.js';
import { styles as indigo } from './shared/header/card.header.indigo.css.js';

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

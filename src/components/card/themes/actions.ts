import type { ComponentThemes } from '#theming/types.js';
// Shared Styles
import { styles as bootstrap } from './shared/actions/card.actions.bootstrap.css.js';
import { styles as indigo } from './shared/actions/card.actions.indigo.css.js';

const light = {
  bootstrap,
  indigo,
};

const dark = {
  bootstrap,
  indigo,
};

export const all: ComponentThemes = { light, dark };

import type { ComponentThemes } from '#theming/types.js';
// Shared Styles
import { styles as indigo } from './shared/predefined-ranges-area.indigo.css.js';

const light = {
  indigo,
};

const dark = {
  indigo,
};

export const all: ComponentThemes = { light, dark };

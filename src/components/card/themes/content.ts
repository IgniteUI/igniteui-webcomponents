import type { ComponentThemes } from '#theming/types.js';
// Shared Styles
import { styles as bootstrap } from './shared/content/card.content.bootstrap.css.js';

const light = {
  bootstrap,
};

const dark = {
  bootstrap,
};

export const all: ComponentThemes = { light, dark };

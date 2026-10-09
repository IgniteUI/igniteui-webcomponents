import type { ComponentThemes } from '#theming/types.js';
// Shared Styles
import { styles as fluent } from './shared/group/dropdown-group.fluent.css.js';

const light = {
  fluent,
};

const dark = {
  fluent,
};

export const all: ComponentThemes = { light, dark };

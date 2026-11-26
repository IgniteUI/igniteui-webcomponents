import type { ComponentThemes } from '#theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/scrollbar.bootstrap.css.js';
import { styles as indigoDark } from './dark/scrollbar.indigo.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/scrollbar.bootstrap.css.js';
import { styles as fluentLight } from './light/scrollbar.fluent.css.js';
import { styles as indigoLight } from './light/scrollbar.indigo.css.js';
import { styles as materialLight } from './light/scrollbar.material.css.js';

const light = {
  bootstrap: bootstrapLight,
  material: materialLight,
  fluent: fluentLight,
  indigo: indigoLight,
};

const dark = {
  bootstrap: [bootstrapLight, bootstrapDark],
  material: materialLight,
  fluent: fluentLight,
  indigo: [indigoLight, indigoDark],
};

/** The scrollbar tokens and properties of each theme, scoped to `:host`. */
export const all: ComponentThemes = { light, dark };

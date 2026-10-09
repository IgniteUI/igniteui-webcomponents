import type { ComponentThemes } from '#theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/date-picker.bootstrap.css.js';
import { styles as fluentDark } from './dark/date-picker.fluent.css.js';
import { styles as indigoDark } from './dark/date-picker.indigo.css.js';
import { styles as materialDark } from './dark/date-picker.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/date-picker.bootstrap.css.js';
import { styles as fluentLight } from './light/date-picker.fluent.css.js';
import { styles as indigoLight } from './light/date-picker.indigo.css.js';
import { styles as materialLight } from './light/date-picker.material.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/date-picker.bootstrap.css.js';
import { styles as fluent } from './shared/date-picker.fluent.css.js';
import { styles as indigo } from './shared/date-picker.indigo.css.js';
import { styles as material } from './shared/date-picker.material.css.js';

const light = {
  bootstrap: [bootstrap, bootstrapLight],
  material: [material, materialLight],
  fluent: [fluent, fluentLight],
  indigo: [indigo, indigoLight],
};

const dark = {
  bootstrap: [bootstrap, bootstrapDark],
  material: [material, materialDark],
  fluent: [fluent, fluentDark],
  indigo: [indigo, indigoDark],
};

export const all: ComponentThemes = { light, dark };

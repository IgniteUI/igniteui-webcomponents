import type { ComponentThemes } from '#theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/date-range-picker.bootstrap.css.js';
import { styles as fluentDark } from './dark/date-range-picker.fluent.css.js';
import { styles as indigoDark } from './dark/date-range-picker.indigo.css.js';
import { styles as materialDark } from './dark/date-range-picker.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/date-range-picker.bootstrap.css.js';
import { styles as fluentLight } from './light/date-range-picker.fluent.css.js';
import { styles as indigoLight } from './light/date-range-picker.indigo.css.js';
import { styles as materialLight } from './light/date-range-picker.material.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/date-range-picker.bootstrap.css.js';
import { styles as fluent } from './shared/date-range-picker.fluent.css.js';
import { styles as indigo } from './shared/date-range-picker.indigo.css.js';
import { styles as material } from './shared/date-range-picker.material.css.js';

const light = {
  bootstrap: [bootstrap, bootstrapLight],
  material: [material, materialLight],
  fluent: [fluent, fluentLight],
  indigo: [indigo, indigoLight],
};

const dark = {
  bootstrap: [bootstrap, bootstrapLight, bootstrapDark],
  material: [material, materialLight, materialDark],
  fluent: [fluent, fluentLight, fluentDark],
  indigo: [indigo, indigoLight, indigoDark],
};

export const all: ComponentThemes = { light, dark };

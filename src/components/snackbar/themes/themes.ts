import type { ComponentThemes } from '#theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/snackbar.bootstrap.css.js';
import { styles as fluentDark } from './dark/snackbar.fluent.css.js';
import { styles as indigoDark } from './dark/snackbar.indigo.css.js';
import { styles as materialDark } from './dark/snackbar.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/snackbar.bootstrap.css.js';
import { styles as fluentLight } from './light/snackbar.fluent.css.js';
import { styles as indigoLight } from './light/snackbar.indigo.css.js';
import { styles as materialLight } from './light/snackbar.material.css.js';
import { styles as shared } from './light/snackbar.shared.css.js';
// Shared Styles
import { styles as fluent } from './shared/snackbar.fluent.css.js';
import { styles as indigo } from './shared/snackbar.indigo.css.js';

const light = {
  shared,
  bootstrap: bootstrapLight,
  material: materialLight,
  fluent: [fluent, fluentLight],
  indigo: [indigo, indigoLight],
};

const dark = {
  shared,
  bootstrap: bootstrapDark,
  material: materialDark,
  fluent: [fluent, fluentDark],
  indigo: [indigo, indigoDark],
};

export const all: ComponentThemes = { light, dark };

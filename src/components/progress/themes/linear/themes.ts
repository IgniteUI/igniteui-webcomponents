import type { ComponentThemes } from '#theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/linear.progress.bootstrap.css.js';
import { styles as fluentDark } from './dark/linear.progress.fluent.css.js';
import { styles as indigoDark } from './dark/linear.progress.indigo.css.js';
import { styles as materialDark } from './dark/linear.progress.material.css.js';
import { styles as sharedDark } from './dark/linear.progress.shared.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/linear.progress.bootstrap.css.js';
import { styles as fluentLight } from './light/linear.progress.fluent.css.js';
import { styles as indigoLight } from './light/linear.progress.indigo.css.js';
import { styles as materialLight } from './light/linear.progress.material.css.js';
import { styles as sharedLight } from './light/linear.progress.shared.css.js';
import { styles as bootstrap } from './shared/linear.progress.bootstrap.css.js';
// Shared Styles
import { styles as fluent } from './shared/linear.progress.fluent.css.js';
import { styles as indigo } from './shared/linear.progress.indigo.css.js';

const light = {
  shared: sharedLight,
  bootstrap: [bootstrap, bootstrapLight],
  material: materialLight,
  fluent: [fluent, fluentLight],
  indigo: [indigo, indigoLight],
};

const dark = {
  shared: sharedDark,
  bootstrap: [bootstrap, bootstrapDark],
  material: materialDark,
  fluent: [fluent, fluentDark],
  indigo: [indigo, indigoDark],
};

export const all: ComponentThemes = { light, dark };

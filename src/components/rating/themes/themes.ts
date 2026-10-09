import type { ComponentThemes } from '#theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/rating.bootstrap.css.js';
import { styles as fluentDark } from './dark/rating.fluent.css.js';
import { styles as indigoDark } from './dark/rating.indigo.css.js';
import { styles as materialDark } from './dark/rating.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/rating.bootstrap.css.js';
import { styles as fluentLight } from './light/rating.fluent.css.js';
import { styles as indigoLight } from './light/rating.indigo.css.js';
import { styles as materialLight } from './light/rating.material.css.js';
import { styles as shared } from './light/rating.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/rating.bootstrap.css.js';
import { styles as fluent } from './shared/rating.fluent.css.js';
import { styles as indigo } from './shared/rating.indigo.css.js';

const light = {
  shared,
  bootstrap: [bootstrap, bootstrapLight],
  material: materialLight,
  fluent: [fluent, fluentLight],
  indigo: [indigo, indigoLight],
};

const dark = {
  shared,
  bootstrap: [bootstrap, bootstrapDark],
  material: materialDark,
  fluent: [fluent, fluentDark],
  indigo: [indigo, indigoDark],
};

export const all: ComponentThemes = { light, dark };

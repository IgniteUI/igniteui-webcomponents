import type { ComponentThemes } from '#theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/badge.bootstrap.css.js';
import { styles as fluentDark } from './dark/badge.fluent.css.js';
import { styles as indigoDark } from './dark/badge.indigo.css.js';
import { styles as materialDark } from './dark/badge.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/badge.bootstrap.css.js';
import { styles as fluentLight } from './light/badge.fluent.css.js';
import { styles as indigoLight } from './light/badge.indigo.css.js';
import { styles as materialLight } from './light/badge.material.css.js';
import { styles as shared } from './light/badge.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/badge.bootstrap.css.js';
import { styles as fluent } from './shared/badge.fluent.css.js';
import { styles as indigo } from './shared/badge.indigo.css.js';
import { styles as material } from './shared/badge.material.css.js';

const light = {
  shared,
  bootstrap: [bootstrap, bootstrapLight],
  material: [material, materialLight],
  fluent: [fluent, fluentLight],
  indigo: [indigo, indigoLight],
};

const dark = {
  shared,
  bootstrap: [bootstrap, bootstrapDark],
  material: [material, materialDark],
  fluent: [fluent, fluentDark],
  indigo: [indigo, indigoDark],
};

export const all: ComponentThemes = { light, dark };

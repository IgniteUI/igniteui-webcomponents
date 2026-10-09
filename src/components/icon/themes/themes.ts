import type { ComponentThemes } from '#theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/icon.bootstrap.css.js';
import { styles as fluentDark } from './dark/icon.fluent.css.js';
import { styles as indigoDark } from './dark/icon.indigo.css.js';
import { styles as materialDark } from './dark/icon.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/icon.bootstrap.css.js';
import { styles as fluentLight } from './light/icon.fluent.css.js';
import { styles as indigoLight } from './light/icon.indigo.css.js';
import { styles as materialLight } from './light/icon.material.css.js';
import { styles as shared } from './light/icon.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/icon.bootstrap.css.js';
import { styles as fluent } from './shared/icon.fluent.css.js';
import { styles as indigo } from './shared/icon.indigo.css.js';

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

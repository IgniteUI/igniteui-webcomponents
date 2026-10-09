import type { ComponentThemes } from '#theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/navbar.bootstrap.css.js';
import { styles as fluentDark } from './dark/navbar.fluent.css.js';
import { styles as indigoDark } from './dark/navbar.indigo.css.js';
import { styles as materialDark } from './dark/navbar.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/navbar.bootstrap.css.js';
import { styles as fluentLight } from './light/navbar.fluent.css.js';
import { styles as indigoLight } from './light/navbar.indigo.css.js';
import { styles as materialLight } from './light/navbar.material.css.js';
import { styles as shared } from './light/navbar.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/navbar.bootstrap.css.js';
import { styles as fluent } from './shared/navbar.fluent.css.js';
import { styles as indigo } from './shared/navbar.indigo.css.js';

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

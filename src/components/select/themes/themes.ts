import type { ComponentThemes } from '#theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/select.bootstrap.css.js';
import { styles as fluentDark } from './dark/select.fluent.css.js';
import { styles as indigoDark } from './dark/select.indigo.css.js';
import { styles as materialDark } from './dark/select.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/select.bootstrap.css.js';
import { styles as fluentLight } from './light/select.fluent.css.js';
import { styles as indigoLight } from './light/select.indigo.css.js';
import { styles as materialLight } from './light/select.material.css.js';
import { styles as shared } from './light/select.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/select.bootstrap.css.js';
import { styles as fluent } from './shared/select.fluent.css.js';
import { styles as indigo } from './shared/select.indigo.css.js';
import { styles as material } from './shared/select.material.css.js';

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

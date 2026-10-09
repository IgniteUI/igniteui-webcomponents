import type { ComponentThemes } from '#theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/combo.bootstrap.css.js';
import { styles as fluentDark } from './dark/combo.fluent.css.js';
import { styles as indigoDark } from './dark/combo.indigo.css.js';
import { styles as materialDark } from './dark/combo.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/combo.bootstrap.css.js';
import { styles as fluentLight } from './light/combo.fluent.css.js';
import { styles as indigoLight } from './light/combo.indigo.css.js';
import { styles as materialLight } from './light/combo.material.css.js';
import { styles as shared } from './light/combo.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/combo.bootstrap.css.js';
import { styles as fluent } from './shared/combo.fluent.css.js';
import { styles as indigo } from './shared/combo.indigo.css.js';
import { styles as material } from './shared/combo.material.css.js';

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

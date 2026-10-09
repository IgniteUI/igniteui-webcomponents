import type { ComponentThemes } from '#theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/checkbox/checkbox.bootstrap.css.js';
import { styles as fluentDark } from './dark/checkbox/checkbox.fluent.css.js';
import { styles as indigoDark } from './dark/checkbox/checkbox.indigo.css.js';
import { styles as materialDark } from './dark/checkbox/checkbox.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/checkbox/checkbox.bootstrap.css.js';
import { styles as fluentLight } from './light/checkbox/checkbox.fluent.css.js';
import { styles as indigoLight } from './light/checkbox/checkbox.indigo.css.js';
import { styles as materialLight } from './light/checkbox/checkbox.material.css.js';
import { styles as shared } from './light/checkbox/checkbox.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/checkbox/checkbox.bootstrap.css.js';
import { styles as fluent } from './shared/checkbox/checkbox.fluent.css.js';
import { styles as indigo } from './shared/checkbox/checkbox.indigo.css.js';
import { styles as material } from './shared/checkbox/checkbox.material.css.js';

const light = {
  shared,
  bootstrap: [bootstrap, bootstrapLight],
  material: [material, materialLight],
  fluent: [fluent, fluentLight],
  indigo: [indigo, indigoLight],
};

const dark = {
  shared,
  bootstrap: [bootstrap, bootstrapLight, bootstrapDark],
  material: [material, materialLight, materialDark],
  fluent: [fluent, fluentLight, fluentDark],
  indigo: [indigo, indigoLight, indigoDark],
};

export const all: ComponentThemes = { light, dark };

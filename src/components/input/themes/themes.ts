import type { ComponentThemes } from '#theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/input.bootstrap.css.js';
import { styles as fluentDark } from './dark/input.fluent.css.js';
import { styles as indigoDark } from './dark/input.indigo.css.js';
import { styles as materialDark } from './dark/input.material.css.js';
import { styles as sharedDark } from './dark/input.shared.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/input.bootstrap.css.js';
import { styles as fluentLight } from './light/input.fluent.css.js';
import { styles as indigoLight } from './light/input.indigo.css.js';
import { styles as materialLight } from './light/input.material.css.js';
import { styles as sharedLight } from './light/input.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/input.bootstrap.css.js';
import { styles as fluent } from './shared/input.fluent.css.js';
import { styles as indigo } from './shared/input.indigo.css.js';
import { styles as material } from './shared/input.material.css.js';

const light = {
  shared: sharedLight,
  bootstrap: [bootstrap, bootstrapLight],
  material: [material, materialLight],
  fluent: [fluent, fluentLight],
  indigo: [indigo, indigoLight],
};

const dark = {
  shared: sharedDark,
  bootstrap: [bootstrap, bootstrapLight, bootstrapDark],
  material: [material, materialLight, materialDark],
  fluent: [fluent, fluentLight, fluentDark],
  indigo: [indigo, indigoLight, indigoDark],
};

export const all: ComponentThemes = { light, dark };

import type { ComponentThemes } from '#theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/banner.bootstrap.css.js';
import { styles as fluentDark } from './dark/banner.fluent.css.js';
import { styles as indigoDark } from './dark/banner.indigo.css.js';
import { styles as materialDark } from './dark/banner.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/banner.bootstrap.css.js';
import { styles as fluentLight } from './light/banner.fluent.css.js';
import { styles as indigoLight } from './light/banner.indigo.css.js';
import { styles as materialLight } from './light/banner.material.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/banner.bootstrap.css.js';
import { styles as fluent } from './shared/banner.fluent.css.js';
import { styles as indigo } from './shared/banner.indigo.css.js';
import { styles as material } from './shared/banner.material.css.js';

const light = {
  bootstrap: [bootstrap, bootstrapLight],
  material: [material, materialLight],
  fluent: [fluent, fluentLight],
  indigo: [indigo, indigoLight],
};

const dark = {
  bootstrap: [bootstrap, bootstrapLight, bootstrapDark],
  material: [material, materialLight, materialDark],
  fluent: [fluent, fluentLight, fluentDark],
  indigo: [indigo, indigoLight, indigoDark],
};

export const all: ComponentThemes = { light, dark };

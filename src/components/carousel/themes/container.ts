import type { ComponentThemes } from '#theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/carousel.bootstrap.css.js';
import { styles as fluentDark } from './dark/carousel.fluent.css.js';
import { styles as indigoDark } from './dark/carousel.indigo.css.js';
import { styles as materialDark } from './dark/carousel.material.css.js';
import { styles as sharedDark } from './dark/carousel.shared.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/carousel.bootstrap.css.js';
import { styles as fluentLight } from './light/carousel.fluent.css.js';
import { styles as indigoLight } from './light/carousel.indigo.css.js';
import { styles as materialLight } from './light/carousel.material.css.js';
import { styles as sharedLight } from './light/carousel.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/carousel.bootstrap.css.js';
import { styles as fluent } from './shared/carousel.fluent.css.js';
import { styles as indigo } from './shared/carousel.indigo.css.js';

const light = {
  shared: sharedLight,
  bootstrap: [bootstrap, bootstrapLight],
  material: materialLight,
  fluent: [fluent, fluentLight],
  indigo: [indigo, indigoLight],
};

const dark = {
  shared: sharedDark,
  bootstrap: [bootstrap, bootstrapLight, bootstrapDark],
  material: [materialLight, materialDark],
  fluent: [fluent, fluentLight, fluentDark],
  indigo: [indigo, indigoLight, indigoDark],
};

export const all: ComponentThemes = { light, dark };

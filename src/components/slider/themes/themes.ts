import type { ComponentThemes } from '#theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/slider.bootstrap.css.js';
import { styles as fluentDark } from './dark/slider.fluent.css.js';
import { styles as indigoDark } from './dark/slider.indigo.css.js';
import { styles as materialDark } from './dark/slider.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/slider.bootstrap.css.js';
import { styles as fluentLight } from './light/slider.fluent.css.js';
import { styles as indigoLight } from './light/slider.indigo.css.js';
import { styles as materialLight } from './light/slider.material.css.js';
import { styles as shared } from './light/slider.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/slider.bootstrap.css.js';
import { styles as fluent } from './shared/slider.fluent.css.js';
import { styles as indigo } from './shared/slider.indigo.css.js';
import { styles as material } from './shared/slider.material.css.js';

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

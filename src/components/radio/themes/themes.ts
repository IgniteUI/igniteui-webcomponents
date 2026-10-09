import type { ComponentThemes } from '#theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/radio.bootstrap.css.js';
import { styles as fluentDark } from './dark/radio.fluent.css.js';
import { styles as indigoDark } from './dark/radio.indigo.css.js';
import { styles as materialDark } from './dark/radio.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/radio.bootstrap.css.js';
import { styles as fluentLight } from './light/radio.fluent.css.js';
import { styles as indigoLight } from './light/radio.indigo.css.js';
import { styles as materialLight } from './light/radio.material.css.js';
import { styles as shared } from './light/radio.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/radio.bootstrap.css.js';
import { styles as fluent } from './shared/radio.fluent.css.js';
import { styles as indigo } from './shared/radio.indigo.css.js';
import { styles as material } from './shared/radio.material.css.js';

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

import type { ComponentThemes } from '#theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/icon-button.bootstrap.css.js';
import { styles as fluentDark } from './dark/icon-button.fluent.css.js';
import { styles as indigoDark } from './dark/icon-button.indigo.css.js';
import { styles as materialDark } from './dark/icon-button.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/icon-button.bootstrap.css.js';
import { styles as fluentLight } from './light/icon-button.fluent.css.js';
import { styles as indigoLight } from './light/icon-button.indigo.css.js';
import { styles as materialLight } from './light/icon-button.material.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/icon-button.bootstrap.css.js';
import { styles as fluent } from './shared/icon-button.fluent.css.js';
import { styles as indigo } from './shared/icon-button.indigo.css.js';
import { styles as material } from './shared/icon-button.material.css.js';

const light = {
  bootstrap: [bootstrap, bootstrapLight],
  material: [material, materialLight],
  fluent: [fluent, fluentLight],
  indigo: [indigo, indigoLight],
};

const dark = {
  bootstrap: [bootstrap, bootstrapDark],
  material: [material, materialDark],
  fluent: [fluent, fluentDark],
  indigo: [indigo, indigoDark],
};

export const all: ComponentThemes = { light, dark };

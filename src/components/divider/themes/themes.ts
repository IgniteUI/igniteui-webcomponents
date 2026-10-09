import type { ComponentThemes } from '#theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/divider.bootstrap.css.js';
import { styles as fluentDark } from './dark/divider.fluent.css.js';
import { styles as indigoDark } from './dark/divider.indigo.css.js';
import { styles as materialDark } from './dark/divider.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/divider.bootstrap.css.js';
import { styles as fluentLight } from './light/divider.fluent.css.js';
import { styles as indigoLight } from './light/divider.indigo.css.js';
import { styles as materialLight } from './light/divider.material.css.js';
import { styles as shared } from './light/divider.shared.css.js';
// Shared Styles
import { styles as indigo } from './shared/divider.indigo.css.js';

const light = {
  shared,
  bootstrap: bootstrapLight,
  material: materialLight,
  fluent: fluentLight,
  indigo: [indigo, indigoLight],
};

const dark = {
  shared,
  bootstrap: [bootstrapLight, bootstrapDark],
  material: [materialLight, materialDark],
  fluent: [fluentLight, fluentDark],
  indigo: [indigo, indigoLight, indigoDark],
};

export const all: ComponentThemes = { light, dark };

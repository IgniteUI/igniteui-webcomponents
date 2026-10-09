import type { ComponentThemes } from '#theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/chip.bootstrap.css.js';
import { styles as fluentDark } from './dark/chip.fluent.css.js';
import { styles as indigoDark } from './dark/chip.indigo.css.js';
import { styles as materialDark } from './dark/chip.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/chip.bootstrap.css.js';
import { styles as fluentLight } from './light/chip.fluent.css.js';
import { styles as indigoLight } from './light/chip.indigo.css.js';
import { styles as materialLight } from './light/chip.material.css.js';
import { styles as shared } from './light/chip.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/chip.bootstrap.css.js';
import { styles as fluent } from './shared/chip.fluent.css.js';
import { styles as indigo } from './shared/chip.indigo.css.js';

const light = {
  shared,
  bootstrap: [bootstrap, bootstrapLight],
  material: materialLight,
  fluent: [fluent, fluentLight],
  indigo: [indigo, indigoLight],
};

const dark = {
  shared,
  bootstrap: [bootstrap, bootstrapDark],
  material: materialDark,
  fluent: [fluent, fluentDark],
  indigo: [indigo, indigoDark],
};

export const all: ComponentThemes = { light, dark };

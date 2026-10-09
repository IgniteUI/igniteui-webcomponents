import type { ComponentThemes } from '#theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/toast.bootstrap.css.js';
import { styles as fluentDark } from './dark/toast.fluent.css.js';
import { styles as indigoDark } from './dark/toast.indigo.css.js';
import { styles as materialDark } from './dark/toast.material.css.js';
import { styles as sharedDark } from './dark/toast.shared.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/toast.bootstrap.css.js';
import { styles as fluentLight } from './light/toast.fluent.css.js';
import { styles as indigoLight } from './light/toast.indigo.css.js';
import { styles as materialLight } from './light/toast.material.css.js';
import { styles as sharedLight } from './light/toast.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/toast.bootstrap.css.js';
import { styles as fluent } from './shared/toast.fluent.css.js';

const light = {
  shared: sharedLight,
  bootstrap: [bootstrap, bootstrapLight],
  material: materialLight,
  fluent: [fluent, fluentLight],
  indigo: indigoLight,
};

const dark = {
  shared: sharedDark,
  bootstrap: [bootstrap, bootstrapLight, bootstrapDark],
  material: [materialLight, materialDark],
  fluent: [fluent, fluentLight, fluentDark],
  indigo: [indigoLight, indigoDark],
};

export const all: ComponentThemes = { light, dark };

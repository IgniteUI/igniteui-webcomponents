import type { ComponentThemes } from '#theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/container.bootstrap.css.js';
import { styles as fluentDark } from './dark/container.fluent.css.js';
import { styles as indigoDark } from './dark/container.indigo.css.js';
import { styles as materialDark } from './dark/container.material.css.js';
import { styles as sharedDark } from './dark/container.shared.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/container.bootstrap.css.js';
import { styles as fluentLight } from './light/container.fluent.css.js';
import { styles as indigoLight } from './light/container.indigo.css.js';
import { styles as materialLight } from './light/container.material.css.js';
import { styles as sharedLight } from './light/container.shared.css.js';

const light = {
  shared: sharedLight,
  bootstrap: bootstrapLight,
  material: materialLight,
  fluent: fluentLight,
  indigo: indigoLight,
};

const dark = {
  shared: sharedDark,
  bootstrap: [bootstrapLight, bootstrapDark],
  material: [materialLight, materialDark],
  fluent: [fluentLight, fluentDark],
  indigo: [indigoLight, indigoDark],
};

export const all: ComponentThemes = { light, dark };

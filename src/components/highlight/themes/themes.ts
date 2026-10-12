import type { ComponentThemes } from '#theming/types.js';

// Dark Overrides
import { styles as bootstrapDark } from './dark/highlight.bootstrap.css.js';
import { styles as fluentDark } from './dark/highlight.fluent.css.js';
import { styles as indigoDark } from './dark/highlight.indigo.css.js';
import { styles as materialDark } from './dark/highlight.material.css.js';
import { styles as sharedDark } from './dark/highlight.shared.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/highlight.bootstrap.css.js';
import { styles as fluentLight } from './light/highlight.fluent.css.js';
import { styles as indigoLight } from './light/highlight.indigo.css.js';
import { styles as materialLight } from './light/highlight.material.css.js';
import { styles as sharedLight } from './light/highlight.shared.css.js';

const light = {
  shared: sharedLight,
  bootstrap: bootstrapLight,
  material: materialLight,
  indigo: indigoLight,
  fluent: fluentLight,
};

const dark = {
  shared: sharedDark,
  bootstrap: [bootstrapLight, bootstrapDark],
  material: [materialLight, materialDark],
  indigo: [indigoLight, indigoDark],
  fluent: [fluentLight, fluentDark],
};

export const all: ComponentThemes = { light, dark };

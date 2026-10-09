import type { ComponentThemes } from '#theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/tile-manager.bootstrap.css.js';
import { styles as fluentDark } from './dark/tile-manager.fluent.css.js';
import { styles as indigoDark } from './dark/tile-manager.indigo.css.js';
import { styles as materialDark } from './dark/tile-manager.material.css.js';
import { styles as sharedDark } from './dark/tile-manager.shared.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/tile-manager.bootstrap.css.js';
import { styles as fluentLight } from './light/tile-manager.fluent.css.js';
import { styles as indigoLight } from './light/tile-manager.indigo.css.js';
import { styles as materialLight } from './light/tile-manager.material.css.js';
import { styles as sharedLight } from './light/tile-manager.shared.css.js';

// Shared Styles

const light = {
  shared: sharedLight,
  bootstrap: bootstrapLight,
  material: materialLight,
  fluent: fluentLight,
  indigo: indigoLight,
};

const dark = {
  shared: sharedDark,
  bootstrap: bootstrapDark,
  material: materialDark,
  fluent: fluentDark,
  indigo: indigoDark,
};

export const all: ComponentThemes = { light, dark };

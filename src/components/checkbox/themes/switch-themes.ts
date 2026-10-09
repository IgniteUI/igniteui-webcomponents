import type { ComponentThemes } from '#theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/switch/switch.bootstrap.css.js';
import { styles as fluentDark } from './dark/switch/switch.fluent.css.js';
import { styles as indigoDark } from './dark/switch/switch.indigo.css.js';
import { styles as materialDark } from './dark/switch/switch.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/switch/switch.bootstrap.css.js';
import { styles as fluentLight } from './light/switch/switch.fluent.css.js';
import { styles as indigoLight } from './light/switch/switch.indigo.css.js';
import { styles as materialLight } from './light/switch/switch.material.css.js';
import { styles as shared } from './light/switch/switch.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/switch/switch.bootstrap.css.js';
import { styles as fluent } from './shared/switch/switch.fluent.css.js';
import { styles as indigo } from './shared/switch/switch.indigo.css.js';
import { styles as material } from './shared/switch/switch.material.css.js';

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

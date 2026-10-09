import type { ComponentThemes } from '#theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/tab.bootstrap.css.js';
import { styles as fluentDark } from './dark/tab.fluent.css.js';
import { styles as indigoDark } from './dark/tab.indigo.css.js';
import { styles as materialDark } from './dark/tab.material.css.js';
import { styles as sharedDark } from './dark/tab.shared.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/tab.bootstrap.css.js';
import { styles as fluentLight } from './light/tab.fluent.css.js';
import { styles as indigoLight } from './light/tab.indigo.css.js';
import { styles as materialLight } from './light/tab.material.css.js';
import { styles as sharedLight } from './light/tab.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/tabs/tabs.bootstrap.css.js';
import { styles as fluent } from './shared/tabs/tabs.fluent.css.js';
import { styles as indigo } from './shared/tabs/tabs.indigo.css.js';
import { styles as material } from './shared/tabs/tabs.material.css.js';

const light = {
  shared: sharedLight,
  bootstrap: [bootstrap, bootstrapLight],
  material: [material, materialLight],
  fluent: [fluent, fluentLight],
  indigo: [indigo, indigoLight],
};

const dark = {
  shared: sharedDark,
  bootstrap: [bootstrap, bootstrapLight, bootstrapDark],
  material: [material, materialLight, materialDark],
  fluent: [fluent, fluentLight, fluentDark],
  indigo: [indigo, indigoLight, indigoDark],
};

export const all: ComponentThemes = { light, dark };

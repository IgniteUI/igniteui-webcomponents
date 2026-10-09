import type { ComponentThemes } from '#theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/container/nav-drawer.bootstrap.css.js';
import { styles as fluentDark } from './dark/container/nav-drawer.fluent.css.js';
import { styles as indigoDark } from './dark/container/nav-drawer.indigo.css.js';
import { styles as materialDark } from './dark/container/nav-drawer.material.css.js';
import { styles as sharedDark } from './dark/container/nav-drawer.shared.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/container/nav-drawer.bootstrap.css.js';
import { styles as fluentLight } from './light/container/nav-drawer.fluent.css.js';
import { styles as indigoLight } from './light/container/nav-drawer.indigo.css.js';
import { styles as materialLight } from './light/container/nav-drawer.material.css.js';
import { styles as sharedLight } from './light/container/nav-drawer.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/container/nav-drawer.bootstrap.css.js';
import { styles as indigo } from './shared/container/nav-drawer.indigo.css.js';
import { styles as material } from './shared/container/nav-drawer.material.css.js';

const light = {
  shared: sharedLight,
  bootstrap: [bootstrap, bootstrapLight],
  material: [material, materialLight],
  fluent: fluentLight,
  indigo: [indigo, indigoLight],
};

const dark = {
  shared: sharedDark,
  bootstrap: [bootstrap, bootstrapDark],
  material: [material, materialDark],
  fluent: fluentDark,
  indigo: [indigo, indigoDark],
};

export const all: ComponentThemes = { light, dark };

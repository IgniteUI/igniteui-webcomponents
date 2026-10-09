import type { ComponentThemes } from '#theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/circular.progress.bootstrap.css.js';
import { styles as fluentDark } from './dark/circular.progress.fluent.css.js';
import { styles as indigoDark } from './dark/circular.progress.indigo.css.js';
import { styles as materialDark } from './dark/circular.progress.material.css.js';
import { styles as sharedDark } from './dark/circular.progress.shared.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/circular.progress.bootstrap.css.js';
import { styles as fluentLight } from './light/circular.progress.fluent.css.js';
import { styles as indigoLight } from './light/circular.progress.indigo.css.js';
import { styles as materialLight } from './light/circular.progress.material.css.js';
import { styles as sharedLight } from './light/circular.progress.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/circular.progress.bootstrap.css.js';
import { styles as fluent } from './shared/circular.progress.fluent.css.js';
import { styles as indigo } from './shared/circular.progress.indigo.css.js';

const light = {
  shared: sharedLight,
  bootstrap: [bootstrap, bootstrapLight],
  material: materialLight,
  fluent: [fluent, fluentLight],
  indigo: [indigo, indigoLight],
};

const dark = {
  shared: sharedDark,
  bootstrap: [bootstrap, bootstrapLight, bootstrapDark],
  material: [materialLight, materialDark],
  fluent: [fluent, fluentLight, fluentDark],
  indigo: [indigo, indigoLight, indigoDark],
};

export const all: ComponentThemes = { light, dark };

import type { ComponentThemes } from '#theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/breadcrumb.bootstrap.css.js';
import { styles as fluentDark } from './dark/breadcrumb.fluent.css.js';
import { styles as indigoDark } from './dark/breadcrumb.indigo.css.js';
import { styles as materialDark } from './dark/breadcrumb.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/breadcrumb.bootstrap.css.js';
import { styles as fluentLight } from './light/breadcrumb.fluent.css.js';
import { styles as indigoLight } from './light/breadcrumb.indigo.css.js';
import { styles as materialLight } from './light/breadcrumb.material.css.js';
import { styles as shared } from './light/breadcrumb.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/breadcrumb.bootstrap.css.js';
import { styles as fluent } from './shared/breadcrumb.fluent.css.js';
import { styles as indigo } from './shared/breadcrumb.indigo.css.js';
import { styles as material } from './shared/breadcrumb.material.css.js';

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

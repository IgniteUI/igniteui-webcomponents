import type { ComponentThemes } from '#theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/calendar.bootstrap.css.js';
import { styles as fluentDark } from './dark/calendar.fluent.css.js';
import { styles as indigoDark } from './dark/calendar.indigo.css.js';
import { styles as materialDark } from './dark/calendar.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/calendar.bootstrap.css.js';
import { styles as fluentLight } from './light/calendar.fluent.css.js';
import { styles as indigoLight } from './light/calendar.indigo.css.js';
import { styles as materialLight } from './light/calendar.material.css.js';
import { styles as shared } from './light/calendar.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/bootstrap/calendar.bootstrap.css.js';
import { styles as fluent } from './shared/fluent/calendar.fluent.css.js';
import { styles as indigo } from './shared/indigo/calendar.indigo.css.js';
import { styles as material } from './shared/material/calendar.material.css.js';

const light = {
  shared,
  bootstrap: [bootstrap, bootstrapLight],
  material: [material, materialLight],
  fluent: [fluent, fluentLight],
  indigo: [indigo, indigoLight],
};

const dark = {
  shared,
  bootstrap: [bootstrap, bootstrapDark],
  material: [material, materialDark],
  fluent: [fluent, fluentDark],
  indigo: [indigo, indigoDark],
};

export const all: ComponentThemes = { light, dark };

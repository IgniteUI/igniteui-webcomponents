import type { ComponentThemes } from '#theming/types.js';
// Dark Overrides (the input's, from the same schema)
import { styles as bootstrapDark } from '../../input/themes/dark/input.bootstrap.css.js';
import { styles as fluentDark } from '../../input/themes/dark/input.fluent.css.js';
import { styles as indigoDark } from '../../input/themes/dark/input.indigo.css.js';
import { styles as materialDark } from '../../input/themes/dark/input.material.css.js';
// Light Overrides (the input's, from the same schema)
import { styles as bootstrapLight } from '../../input/themes/light/input.bootstrap.css.js';
import { styles as fluentLight } from '../../input/themes/light/input.fluent.css.js';
import { styles as indigoLight } from '../../input/themes/light/input.indigo.css.js';
import { styles as materialLight } from '../../input/themes/light/input.material.css.js';
import { styles as shared } from './light/textarea.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/textarea.bootstrap.css.js';
import { styles as fluent } from './shared/textarea.fluent.css.js';
import { styles as indigo } from './shared/textarea.indigo.css.js';
import { styles as material } from './shared/textarea.material.css.js';

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

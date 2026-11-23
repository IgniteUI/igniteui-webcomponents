import type { ComponentThemes } from '#theming/types.js';
// The color picker theme variables. The panel takes the color picker theme.
import { styles as bootstrapDark } from '../../color-picker/themes/dark/color-picker.bootstrap.css.js';
import { styles as fluentDark } from '../../color-picker/themes/dark/color-picker.fluent.css.js';
import { styles as indigoDark } from '../../color-picker/themes/dark/color-picker.indigo.css.js';
import { styles as materialDark } from '../../color-picker/themes/dark/color-picker.material.css.js';
import { styles as bootstrapLight } from '../../color-picker/themes/light/color-picker.bootstrap.css.js';
import { styles as fluentLight } from '../../color-picker/themes/light/color-picker.fluent.css.js';
import { styles as indigoLight } from '../../color-picker/themes/light/color-picker.indigo.css.js';
import { styles as materialLight } from '../../color-picker/themes/light/color-picker.material.css.js';
import { styles as shared } from '../../color-picker/themes/light/color-picker.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/color-panel.bootstrap.css.js';
import { styles as fluent } from './shared/color-panel.fluent.css.js';
import { styles as indigo } from './shared/color-panel.indigo.css.js';
import { styles as material } from './shared/color-panel.material.css.js';

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

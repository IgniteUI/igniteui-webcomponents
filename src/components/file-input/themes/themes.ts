import { all as inputThemes } from '#themes/input/themes/themes.js';
import type { ComponentThemes } from '#theming/types.js';

// Dark Overrides
import { styles as bootstrapDark } from './dark/file-input.bootstrap.css.js';
import { styles as fluentDark } from './dark/file-input.fluent.css.js';
import { styles as indigoDark } from './dark/file-input.indigo.css.js';
import { styles as materialDark } from './dark/file-input.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/file-input.bootstrap.css.js';
import { styles as fluentLight } from './light/file-input.fluent.css.js';
import { styles as indigoLight } from './light/file-input.indigo.css.js';
import { styles as materialLight } from './light/file-input.material.css.js';
import { styles as shared } from './light/file-input.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/file-input.bootstrap.css.js';
import { styles as fluent } from './shared/file-input.fluent.css.js';
import { styles as indigo } from './shared/file-input.indigo.css.js';
import { styles as material } from './shared/file-input.material.css.js';

const light = {
  shared: [shared, inputThemes.light.shared!].flat(),
  bootstrap: [bootstrap, bootstrapLight, inputThemes.light.bootstrap!].flat(),
  material: [material, materialLight, inputThemes.light.material!].flat(),
  indigo: [indigo, indigoLight, inputThemes.light.indigo!].flat(),
  fluent: [fluent, fluentLight, inputThemes.light.fluent!].flat(),
};

const dark = {
  shared: [shared, inputThemes.dark.shared!].flat(),
  bootstrap: [
    bootstrap,
    bootstrapLight,
    bootstrapDark,
    inputThemes.dark.bootstrap!,
  ].flat(),
  material: [
    material,
    materialLight,
    materialDark,
    inputThemes.dark.material!,
  ].flat(),
  indigo: [indigo, indigoLight, indigoDark, inputThemes.dark.indigo!].flat(),
  fluent: [fluent, fluentLight, fluentDark, inputThemes.dark.fluent!].flat(),
};

export const all: ComponentThemes = { light, dark };

import { all as inputThemes } from '#themes/input/themes/themes.js';
import type { ComponentThemes } from '#theming/types.js';
import { styles as indigo } from './shared/validator.indigo.css.js';

// The validator adopts the input themes. Its own Indigo sheet sizes the icon of
// the reserved message line.
const light = {
  shared: inputThemes.light.shared!,
  bootstrap: inputThemes.light.bootstrap!,
  material: inputThemes.light.material!,
  indigo: [inputThemes.light.indigo!, indigo].flat(),
  fluent: inputThemes.light.fluent!,
};

const dark = {
  shared: inputThemes.dark.shared!,
  bootstrap: inputThemes.dark.bootstrap!,
  material: inputThemes.dark.material!,
  indigo: [inputThemes.dark.indigo!, indigo].flat(),
  fluent: inputThemes.dark.fluent!,
};

export const all: ComponentThemes = { light, dark };

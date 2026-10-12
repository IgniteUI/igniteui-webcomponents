import type { ComponentThemes } from '#theming/types.js';
import { styles as bootstrap } from './stepper.bootstrap.css.js';
import { styles as fluent } from './stepper.fluent.css.js';
import { styles as indigo } from './stepper.indigo.css.js';

const light = {
  bootstrap,
  fluent,
  indigo,
};

const dark = {
  bootstrap,
  fluent,
  indigo,
};

export const all: ComponentThemes = { light, dark };

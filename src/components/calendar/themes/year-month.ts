import type { ComponentThemes } from '#theming/types.js';
import { styles as bootstrap } from './shared/bootstrap/year-month-view.bootstrap.css.js';
import { styles as fluent } from './shared/fluent/year-month-view.fluent.css.js';
import { styles as indigo } from './shared/indigo/year-month-view.indigo.css.js';
import { styles as material } from './shared/material/year-month-view.material.css.js';

const light = {
  bootstrap,
  material,
  fluent,
  indigo,
};

const dark = {
  bootstrap,
  material,
  fluent,
  indigo,
};

export const all: ComponentThemes = { light, dark };

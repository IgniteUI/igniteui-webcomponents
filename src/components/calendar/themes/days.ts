import type { ComponentThemes } from '#theming/types.js';
import { styles as bootstrap } from './shared/bootstrap/days-view.bootstrap.css.js';
import { styles as fluent } from './shared/fluent/days-view.fluent.css.js';
import { styles as indigo } from './shared/indigo/days-view.indigo.css.js';
import { styles as material } from './shared/material/days-view.material.css.js';

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

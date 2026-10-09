import type { ComponentThemes } from '#theming/types.js';

// Shared Styles
import { styles as bootstrap } from './shared/header-item/header-item.bootstrap.css.js';
import { styles as fluent } from './shared/header-item/header-item.fluent.css.js';
import { styles as indigo } from './shared/header-item/header-item.indigo.css.js';
import { styles as material } from './shared/header-item/header-item.material.css.js';

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

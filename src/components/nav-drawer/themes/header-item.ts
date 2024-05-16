import { css } from 'lit';
import type { Themes } from '../../../theming/types.js';

// Shared Styles
import { styles as bootstrap } from './shared/header-item/header-item.bootstrap.css.js';
import { styles as fluent } from './shared/header-item/header-item.fluent.css.js';
import { styles as indigo } from './shared/header-item/header-item.indigo.css.js';
import { styles as material } from './shared/header-item/header-item.material.css.js';

const light = {
  bootstrap: css`
    ${bootstrap}
  `,
  material: css`
    ${material}
  `,
  fluent: css`
    ${fluent}
  `,
  indigo: css`
    ${indigo}
  `,
};

const dark = {
  bootstrap: css`
    ${bootstrap}
  `,
  material: css`
    ${material}
  `,
  fluent: css`
    ${fluent}
  `,
  indigo: css`
    ${indigo}
  `,
};

export const all: Themes = { light, dark };

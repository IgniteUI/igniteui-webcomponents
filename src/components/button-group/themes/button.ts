import { css } from 'lit';

// Shared Styles
import { styles as bootstrap } from './shared/button/button.bootstrap.css.js';
import { styles as fluent } from './shared/button/button.fluent.css.js';
import { styles as indigo } from './shared/button/button.indigo.css.js';
import { styles as material } from './shared/button/button.material.css.js';
import type { Themes } from '../../../theming/types';

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
import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Shared Styles
import { styles as bootstrap } from './shared/button/button.bootstrap.css.js';
import { styles as fluent } from './shared/button/button.fluent.css.js';
import { styles as indigo } from './shared/button/button.indigo.css.js';
import { styles as material } from './shared/button/button.material.css.js';

const light = {
  bootstrap: css`
    ${bootstrap}
  `,
  fluent: css`
    ${fluent}
  `,
  indigo: css`
    ${indigo}
  `,
  material: css`
    ${material}
  `,
};

const dark = {
  bootstrap: css`
    ${bootstrap}
  `,
  fluent: css`
    ${fluent}
  `,
  indigo: css`
    ${indigo}
  `,
  material: css`
    ${material}
  `,
};

export const all: Themes = { light, dark };

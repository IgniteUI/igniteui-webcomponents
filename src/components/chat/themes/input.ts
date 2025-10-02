import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Shared Styles
import { styles as bootstrap } from './shared/input/input.bootstrap.css.js';
import { styles as fluent } from './shared/input/input.fluent.css.js';
import { styles as indigo } from './shared/input/input.indigo.css.js';
import { styles as material } from './shared/input/input.material.css.js';

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

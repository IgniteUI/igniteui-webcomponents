import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
import { styles as bootstrap } from './shared/bootstrap/year-month-view.bootstrap.css.js';
import { styles as fluent } from './shared/fluent/year-month-view.fluent.css.js';
import { styles as indigo } from './shared/indigo/year-month-view.indigo.css.js';
import { styles as material } from './shared/material/year-month-view.material.css.js';

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

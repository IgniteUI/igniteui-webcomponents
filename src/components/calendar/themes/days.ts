import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
import { styles as bootstrap } from './shared/bootstrap/days-view.bootstrap.css.js';
import { styles as fluent } from './shared/fluent/days-view.fluent.css.js';
import { styles as indigo } from './shared/indigo/days-view.indigo.css.js';
import { styles as material } from './shared/material/days-view.material.css.js';

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

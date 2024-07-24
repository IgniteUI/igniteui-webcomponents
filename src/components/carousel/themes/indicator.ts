import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Shared Styles
import { styles as bootstrap } from './shared/indicator/indicator.bootstrap.css.js';
import { styles as fluent } from './shared/indicator/indicator.fluent.css.js';
import { styles as indigo } from './shared/indicator/indicator.indigo.css.js';

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
};

export const all: Themes = { light, dark };

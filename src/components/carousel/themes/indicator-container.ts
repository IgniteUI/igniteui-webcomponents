import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Shared Styles
import { styles as bootstrap } from './shared/indicator-container/indicator-container.bootstrap.css.js';
import { styles as fluent } from './shared/indicator-container/indicator-container.fluent.css.js';
import { styles as indigo } from './shared/indicator-container/indicator-container.indigo.css.js';

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

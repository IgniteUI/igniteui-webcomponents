import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Shared Styles
import { styles as bootstrap } from './shared/tile/tile.bootstrap.css.js';
import { styles as fluent } from './shared/tile/tile.fluent.css.js';
import { styles as indigo } from './shared/tile/tile.indigo.css.js';

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

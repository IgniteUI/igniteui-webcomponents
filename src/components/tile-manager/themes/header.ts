import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Shared Styles
import { styles as bootstrap } from './shared/header/tile-header.bootstrap.css.js';
import { styles as fluent } from './shared/header/tile-header.fluent.css.js';

const light = {
  bootstrap: css`
    ${bootstrap}
  `,
  fluent: css`
    ${fluent}
  `,
};

const dark = {
  bootstrap: css`
    ${bootstrap}
  `,
  fluent: css`
    ${fluent}
  `,
};

export const all: Themes = { light, dark };

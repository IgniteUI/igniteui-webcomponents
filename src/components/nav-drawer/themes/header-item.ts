import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Shared Styles
import { styles as bootstrap } from './shared/header-item/header-item.bootstrap.css.js';
import { styles as indigo } from './shared/header-item/header-item.indigo.css.js';
import { Themes } from '../../../theming/types.js';

const light = {
  bootstrap: css`
    ${bootstrap}
  `,
  indigo: css`
    ${indigo}
  `,
};

const dark = {
  bootstrap: css`
    ${bootstrap}
  `,
  indigo: css`
    ${indigo}
  `,
};

export const all: Themes = { light, dark };

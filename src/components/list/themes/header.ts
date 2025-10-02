import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
import { styles as indigo } from './shared/header/list-header.indigo.css.js';

const light = {
  indigo: css`
    ${indigo}
  `,
};

const dark = {
  indigo: css`
    ${indigo}
  `,
};

export const all: Themes = { light, dark };

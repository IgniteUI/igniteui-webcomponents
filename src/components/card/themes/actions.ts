import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Shared Styles
import { styles as bootstrap } from './shared/actions/card.actions.bootstrap.css.js';
import { styles as indigo } from './shared/actions/card.actions.indigo.css.js';

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

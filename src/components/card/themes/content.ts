import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Shared Styles
import { styles as bootstrap } from './shared/content/card.content.bootstrap.css.js';
import { styles as indigo } from './shared/content/card.content.indigo.css.js';

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

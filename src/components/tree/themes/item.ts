import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Share Styles
import { styles as indigo } from './shared/item.indigo.css.js';
import { styles as material } from './shared/item.material.css.js';

const light = {
  material: css`
    ${material}
  `,
  indigo: css`
    ${indigo}
  `,
};

const dark = {
  material: css`
    ${material}
  `,
  indigo: css`
    ${indigo}
  `,
};

export const all: Themes = { light, dark };

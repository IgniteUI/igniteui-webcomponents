import { css } from 'lit';

// Share Styles
import { styles as indigo } from './shared/item.indigo.css.js';
import { styles as material } from './shared/item.material.css.js';
import { Themes } from '../../../theming/types.js';

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

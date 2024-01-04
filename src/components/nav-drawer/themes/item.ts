import { css } from 'lit';

// Shared Styles
import { styles as fluent } from './shared/item/item.fluent.css.js';
import { styles as indigo } from './shared/item/item.indigo.css.js';
import { Themes } from '../../../theming/types.js';

const light = {
  fluent: css`
    ${fluent}
  `,
  indigo: css`
    ${indigo}
  `,
};

const dark = {
  fluent: css`
    ${fluent}
  `,
  indigo: css`
    ${indigo}
  `,
};

export const all: Themes = { light, dark };

import { css } from 'lit';

// Shared Styles
import { styles as fluent } from './shared/item/dropdown-item.fluent.css.js';
import { Themes } from '../../../theming/types.js';

const light = {
  fluent: css`
    ${fluent}
  `,
};

const dark = {
  fluent: css`
    ${fluent}
  `,
};

export const all: Themes = { light, dark };

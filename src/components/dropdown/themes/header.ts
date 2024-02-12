import { css } from 'lit';

// Shared Styles
import { styles as fluent } from './shared/header/dropdown-header.fluent.css.js';
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

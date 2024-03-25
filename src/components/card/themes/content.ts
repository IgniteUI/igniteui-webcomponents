import { css } from 'lit';

// Shared Styles
import { styles as bootstrap } from './shared/content/card.content.bootstrap.css.js';
import { Themes } from '../../../theming/types.js';

const light = {
  bootstrap: css`
    ${bootstrap}
  `,
};

const dark = {
  bootstrap: css`
    ${bootstrap}
  `,
};

export const all: Themes = { light, dark };

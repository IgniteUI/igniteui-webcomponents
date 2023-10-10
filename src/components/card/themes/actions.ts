import { css } from 'lit';
import { Themes } from '../../../theming/types.js';

// Shared Styles
import { styles as bootstrap } from './shared/actions/card.actions.bootstrap.css.js';

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

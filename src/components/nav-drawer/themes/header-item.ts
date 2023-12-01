import { css } from 'lit';

// Shared Styles
import { styles as bootstrap } from './shared/header-item/header-item.bootstrap.css.js';
import { styles as shared } from './shared/header-item/header-item.common.css.js';
import { Themes } from '../../../theming/types.js';

const light = {
  bootstrap: css`
    ${shared} ${bootstrap}
  `,
  material: css`
    ${shared}
  `,
  fluent: css`
    ${shared}
  `,
  indigo: css`
    ${shared}
  `,
};

const dark = {
  bootstrap: css`
    ${shared} ${bootstrap}
  `,
  material: css`
    ${shared}
  `,
  fluent: css`
    ${shared}
  `,
  indigo: css`
    ${shared}
  `,
};

export const all: Themes = { light, dark };

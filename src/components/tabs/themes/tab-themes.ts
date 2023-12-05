import { css } from 'lit';

// Shared Styles
import { styles as bootstrap } from './shared/tab/tab.bootstrap.css.js';
import { styles as shared } from './shared/tab/tab.common.css.js';
import { styles as fluent } from './shared/tab/tab.fluent.css.js';
import { Themes } from '../../../theming/types.js';

const light = {
  bootstrap: css`
    ${shared} ${bootstrap}
  `,
  material: css`
    ${shared}
  `,
  fluent: css`
    ${shared} ${fluent}
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
    ${shared} ${fluent}
  `,
  indigo: css`
    ${shared}
  `,
};

export const all: Themes = { light, dark };

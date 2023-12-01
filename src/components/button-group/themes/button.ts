import { css } from 'lit';

// Shared Styles
import { styles as bootstrap } from './shared/button/button.bootstrap.css.js';
import { styles as shared } from './shared/button/button.common.css.js';
import { styles as fluent } from './shared/button/button.fluent.css.js';
import { styles as indigo } from './shared/button/button.indigo.css.js';
import type { Themes } from '../../../theming/types';

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
    ${shared} ${indigo}
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
    ${shared} ${indigo}
  `,
};

export const all: Themes = { light, dark };

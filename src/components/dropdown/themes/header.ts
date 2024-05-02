import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
import { styles as fluent } from './shared/header/dropdown-header.fluent.css.js';
// Shared Styles
import { styles as indigo } from './shared/header/dropdown-header.indigo.css.js';

const light = {
  indigo: css`
    ${indigo}
  `,
  fluent: css`
    ${fluent}
  `,
};

const dark = {
  indigo: css`
    ${indigo}
  `,
  fluent: css`
    ${fluent}
  `,
};

export const all: Themes = { light, dark };

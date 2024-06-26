import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Shared Styles
import { styles as fluent } from './shared/group/dropdown-group.fluent.css.js';

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

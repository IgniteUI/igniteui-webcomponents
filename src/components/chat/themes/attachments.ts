import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Shared Styles
import { styles as indigo } from './shared/message-attachments/message-attachments.indigo.css.js';

const light = {
  indigo: css`
    ${indigo}
  `,
};

const dark = {
  indigo: css`
    ${indigo}
  `,
};

export const all: Themes = { light, dark };

import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Shared Styles
import { styles as bootstrap } from './shared/chat-message/chat-message.bootstrap.css.js';
import { styles as fluent } from './shared/chat-message/chat-message.fluent.css.js';
import { styles as indigo } from './shared/chat-message/chat-message.indigo.css.js';

const light = {
  bootstrap: css`
    ${bootstrap}
  `,
  indigo: css`
    ${indigo}
  `,
  fluent: css`
    ${fluent}
  `,
};

const dark = {
  bootstrap: css`
    ${bootstrap}
  `,
  indigo: css`
    ${indigo}
  `,
  fluent: css`
    ${fluent}
  `,
};

export const all: Themes = { light, dark };

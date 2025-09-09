import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/chat.bootstrap.css.js';
import { styles as fluentDark } from './dark/chat.fluent.css.js';
import { styles as indigoDark } from './dark/chat.indigo.css.js';
import { styles as materialDark } from './dark/chat.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/chat.bootstrap.css.js';
import { styles as fluentLight } from './light/chat.fluent.css.js';
import { styles as indigoLight } from './light/chat.indigo.css.js';
import { styles as materialLight } from './light/chat.material.css.js';
// Shared Styles
import { styles as shared } from './light/chat.shared.css.js';
import { styles as bootstrap } from './shared/chat.bootstrap.css.js';
import { styles as fluent } from './shared/chat.fluent.css.js';
import { styles as indigo } from './shared/chat.indigo.css.js';

const light = {
  shared: css`
    ${shared}
  `,
  bootstrap: css`
    ${bootstrap} ${bootstrapLight}
  `,
  material: css`
    ${materialLight}
  `,
  fluent: css`
    ${fluent} ${fluentLight}
  `,
  indigo: css`
    ${indigo} ${indigoLight}
  `,
};

const dark = {
  shared: css`
    ${shared}
  `,
  bootstrap: css`
    ${bootstrap} ${bootstrapDark}
  `,
  material: css`
    ${materialDark}
  `,
  fluent: css`
    ${fluent} ${fluentDark}
  `,
  indigo: css`
    ${indigo} ${indigoDark}
  `,
};

export const all: Themes = { light, dark };

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
import { styles as shared } from './light/chat.shared.css.js';

const light = {
  shared: css`
    ${shared}
  `,
  bootstrap: css`
    ${bootstrapLight}
  `,
  material: css`
    ${materialLight}
  `,
  fluent: css`
    ${fluentLight}
  `,
  indigo: css`
    ${indigoLight}
  `,
};

const dark = {
  shared: css`
    ${shared}
  `,
  bootstrap: css`
    ${bootstrapDark}
  `,
  material: css`
    ${materialDark}
  `,
  fluent: css`
    ${fluentDark}
  `,
  indigo: css`
    ${indigoDark}
  `,
};

export const all: Themes = { light, dark };

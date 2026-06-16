import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';

// Dark Overrides
import { styles as bootstrapDark } from './dark/highlight.bootstrap.css.js';
import { styles as fluentDark } from './dark/highlight.fluent.css.js';
import { styles as indigoDark } from './dark/highlight.indigo.css.js';
import { styles as materialDark } from './dark/highlight.material.css.js';
import { styles as sharedDark } from './dark/highlight.shared.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/highlight.bootstrap.css.js';
import { styles as fluentLight } from './light/highlight.fluent.css.js';
import { styles as indigoLight } from './light/highlight.indigo.css.js';
import { styles as materialLight } from './light/highlight.material.css.js';
import { styles as sharedLight } from './light/highlight.shared.css.js';

const light = {
  shared: css`
    ${sharedLight}
  `,
  bootstrap: css`
    ${bootstrapLight}
  `,
  material: css`
    ${materialLight}
  `,
  indigo: css`
    ${indigoLight}
  `,
  fluent: css`
    ${fluentLight}
  `,
};

const dark = {
  shared: css`
    ${sharedDark}
  `,
  bootstrap: css`
    ${bootstrapDark}
  `,
  material: css`
    ${materialDark}
  `,
  indigo: css`
    ${indigoDark}
  `,
  fluent: css`
    ${fluentDark}
  `,
};

export const all: Themes = { light, dark };

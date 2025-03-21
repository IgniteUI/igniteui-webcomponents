import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/resize-indicator.bootstrap.css.js';
import { styles as fluentDark } from './dark/resize-indicator.fluent.css.js';
import { styles as indigoDark } from './dark/resize-indicator.indigo.css.js';
import { styles as materialDark } from './dark/resize-indicator.material.css.js';
import { styles as sharedDark } from './dark/resize-indicator.shared.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/resize-indicator.bootstrap.css.js';
import { styles as fluentLight } from './light/resize-indicator.fluent.css.js';
import { styles as indigoLight } from './light/resize-indicator.indigo.css.js';
import { styles as materialLight } from './light/resize-indicator.material.css.js';
import { styles as sharedLight } from './light/resize-indicator.shared.css.js';

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
  fluent: css`
    ${fluentLight}
  `,
  indigo: css`
    ${indigoLight}
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
  fluent: css`
    ${fluentDark}
  `,
  indigo: css`
    ${indigoDark}
  `,
};

export const all: Themes = { light, dark };

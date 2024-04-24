import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/container.bootstrap.css.js';
import { styles as fluentDark } from './dark/container.fluent.css.js';
import { styles as indigoDark } from './dark/container.indigo.css.js';
import { styles as materialDark } from './dark/container.material.css.js';
import { styles as sharedDark } from './dark/container.shared.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/container.bootstrap.css.js';
import { styles as fluentLight } from './light/container.fluent.css.js';
import { styles as indigoLight } from './light/container.indigo.css.js';
import { styles as materialLight } from './light/container.material.css.js';
import { styles as sharedLight } from './light/container.shared.css.js';

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

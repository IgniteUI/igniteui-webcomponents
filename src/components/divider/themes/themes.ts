import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/divider.bootstrap.css.js';
import { styles as fluentDark } from './dark/divider.fluent.css.js';
import { styles as indigoDark } from './dark/divider.indigo.css.js';
import { styles as materialDark } from './dark/divider.material.css.js';
import { styles as sharedDark } from './dark/divider.shared.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/divider.bootstrap.css.js';
import { styles as fluentLight } from './light/divider.fluent.css.js';
import { styles as indigoLight } from './light/divider.indigo.css.js';
import { styles as materialLight } from './light/divider.material.css.js';
import { styles as sharedLight } from './light/divider.shared.css.js';
// Shared Styles
import { styles as indigo } from './shared/divider.indigo.css.js';

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
    ${indigo} ${indigoLight}
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
    ${indigo} ${indigoDark}
  `,
};

export const all: Themes = { light, dark };

import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/toast.bootstrap.css.js';
import { styles as fluentDark } from './dark/toast.fluent.css.js';
import { styles as indigoDark } from './dark/toast.indigo.css.js';
import { styles as materialDark } from './dark/toast.material.css.js';
import { styles as sharedDark } from './dark/toast.shared.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/toast.bootstrap.css.js';
import { styles as fluentLight } from './light/toast.fluent.css.js';
import { styles as indigoLight } from './light/toast.indigo.css.js';
import { styles as materialLight } from './light/toast.material.css.js';
import { styles as sharedLight } from './light/toast.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/toast.bootstrap.css.js';
import { styles as fluent } from './shared/toast.fluent.css.js';

const light = {
  shared: css`
    ${sharedLight}
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
    ${indigoLight}
  `,
};

const dark = {
  shared: css`
    ${sharedDark}
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
    ${indigoDark}
  `,
};

export const all: Themes = { light, dark };

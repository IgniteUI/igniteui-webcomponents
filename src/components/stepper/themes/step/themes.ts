import { css } from 'lit';

import type { Themes } from '../../../../theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/step.bootstrap.css.js';
import { styles as fluentDark } from './dark/step.fluent.css.js';
import { styles as indigoDark } from './dark/step.indigo.css.js';
import { styles as materialDark } from './dark/step.material.css.js';
import { styles as sharedDark } from './dark/step.shared.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/step.bootstrap.css.js';
import { styles as fluentLight } from './light/step.fluent.css.js';
import { styles as indigoLight } from './light/step.indigo.css.js';
import { styles as materialLight } from './light/step.material.css.js';
import { styles as sharedLight } from './light/step.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/step.bootstrap.css.js';
import { styles as fluent } from './shared/step.fluent.css.js';
import { styles as indigo } from './shared/step.indigo.css.js';

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
    ${indigo} ${indigoLight}
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
    ${indigo} ${indigoDark}
  `,
};

export const all: Themes = { light, dark };

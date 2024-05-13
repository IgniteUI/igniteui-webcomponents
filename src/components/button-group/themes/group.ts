import { css } from 'lit';

import type { Themes } from '../../../theming/types';
// Dark Overrides
import { styles as bootstrapDark } from './dark/button-group.bootstrap.css.js';
import { styles as fluentDark } from './dark/button-group.fluent.css.js';
import { styles as indigoDark } from './dark/button-group.indigo.css.js';
import { styles as materialDark } from './dark/button-group.material.css.js';
import { styles as sharedDark } from './dark/button-group.shared.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/button-group.bootstrap.css.js';
import { styles as fluentLight } from './light/button-group.fluent.css.js';
import { styles as indigoLight } from './light/button-group.indigo.css.js';
import { styles as materialLight } from './light/button-group.material.css.js';
import { styles as sharedLight } from './light/button-group.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/group/group.bootstrap.css.js';
import { styles as fluent } from './shared/group/group.fluent.css.js';
import { styles as indigo } from './shared/group/group.indigo.css.js';

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

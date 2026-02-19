import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/splitter.bootstrap.css.js';
import { styles as fluentDark } from './dark/splitter.fluent.css.js';
import { styles as indigoDark } from './dark/splitter.indigo.css.js';
import { styles as materialDark } from './dark/splitter.material.css.js';
import { styles as sharedDark } from './dark/splitter.shared.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/splitter.bootstrap.css.js';
import { styles as fluentLight } from './light/splitter.fluent.css.js';
import { styles as indigoLight } from './light/splitter.indigo.css.js';
import { styles as materialLight } from './light/splitter.material.css.js';
import { styles as sharedLight } from './light/splitter.shared.css.js';
//Shared Styles
import { styles as indigo } from './shared/splitter.indigo.css.js';

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

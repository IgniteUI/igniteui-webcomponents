import { css } from 'lit';

import type { Themes } from '../../../../theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/button.bootstrap.css.js';
import { styles as fluentDark } from './dark/button.fluent.css.js';
import { styles as indigoDark } from './dark/button.indigo.css.js';
import { styles as materialDark } from './dark/button.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/button.bootstrap.css.js';
import { styles as fluentLight } from './light/button.fluent.css.js';
import { styles as indigoLight } from './light/button.indigo.css.js';
import { styles as materialLight } from './light/button.material.css.js';
import { styles as shared } from './light/button.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/button.bootstrap.css.js';
import { styles as fluent } from './shared/button.fluent.css.js';
import { styles as indigo } from './shared/button.indigo.css.js';
import { styles as material } from './shared/button.material.css.js';

const light = {
  shared: css`
    ${shared}
  `,
  bootstrap: css`
    ${bootstrap} ${bootstrapLight}
  `,
  material: css`
    ${material} ${materialLight}
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
    ${material} ${materialDark}
  `,
  fluent: css`
    ${fluent} ${fluentDark}
  `,
  indigo: css`
    ${indigo} ${indigoDark}
  `,
};

export const all: Themes = { light, dark };

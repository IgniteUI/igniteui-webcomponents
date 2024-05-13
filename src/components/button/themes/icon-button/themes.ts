import { css } from 'lit';

import type { Themes } from '../../../../theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/icon-button.bootstrap.css.js';
import { styles as fluentDark } from './dark/icon-button.fluent.css.js';
import { styles as indigoDark } from './dark/icon-button.indigo.css.js';
import { styles as materialDark } from './dark/icon-button.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/icon-button.bootstrap.css.js';
import { styles as fluentLight } from './light/icon-button.fluent.css.js';
import { styles as indigoLight } from './light/icon-button.indigo.css.js';
import { styles as materialLight } from './light/icon-button.material.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/icon-button.bootstrap.css.js';
import { styles as fluent } from './shared/icon-button.fluent.css.js';
import { styles as indigo } from './shared/icon-button.indigo.css.js';
import { styles as material } from './shared/icon-button.material.css.js';

const light = {
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

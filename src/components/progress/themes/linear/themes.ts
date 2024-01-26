import { css } from 'lit';

// Dark Overrides
import { styles as bootstrapDark } from './dark/linear.progress.bootstrap.css.js';
import { styles as fluentDark } from './dark/linear.progress.fluent.css.js';
import { styles as indigoDark } from './dark/linear.progress.indigo.css.js';
import { styles as materialDark } from './dark/linear.progress.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/linear.progress.bootstrap.css.js';
import { styles as fluentLight } from './light/linear.progress.fluent.css.js';
import { styles as indigoLight } from './light/linear.progress.indigo.css.js';
import { styles as materialLight } from './light/linear.progress.material.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/linear.progress.bootstrap.css.js';
import { styles as fluent } from './shared/linear.progress.fluent.css.js';
import { styles as indigo } from './shared/linear.progress.indigo.css.js';
import { Themes } from '../../../../theming/types.js';

const light = {
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

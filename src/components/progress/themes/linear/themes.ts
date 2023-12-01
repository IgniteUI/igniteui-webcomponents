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
import { styles as shared } from './shared/linear.progress.common.css.js';
import { styles as fluent } from './shared/linear.progress.fluent.css.js';
import { styles as indigo } from './shared/linear.progress.indigo.css.js';
import { Themes } from '../../../../theming/types.js';

const light = {
  bootstrap: css`
    ${shared} ${bootstrap} ${bootstrapLight}
  `,
  material: css`
    ${shared} ${materialLight}
  `,
  fluent: css`
    ${shared} ${fluent} ${fluentLight}
  `,
  indigo: css`
    ${shared} ${indigo} ${indigoLight}
  `,
};

const dark = {
  bootstrap: css`
    ${shared} ${bootstrap} ${bootstrapDark}
  `,
  material: css`
    ${shared} ${materialDark}
  `,
  fluent: css`
    ${shared} ${fluent} ${fluentDark}
  `,
  indigo: css`
    ${shared} ${indigo} ${indigoDark}
  `,
};

export const all: Themes = { light, dark };

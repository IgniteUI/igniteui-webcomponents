import { css } from 'lit';

// Dark Overrides
import { styles as bootstrapDark } from './dark/snackbar.bootstrap.css.js';
import { styles as fluentDark } from './dark/snackbar.fluent.css.js';
import { styles as indigoDark } from './dark/snackbar.indigo.css.js';
import { styles as materialDark } from './dark/snackbar.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/snackbar.bootstrap.css.js';
import { styles as fluentLight } from './light/snackbar.fluent.css.js';
import { styles as indigoLight } from './light/snackbar.indigo.css.js';
import { styles as materialLight } from './light/snackbar.material.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/snackbar.bootstrap.css.js';
import { styles as shared } from './shared/snackbar.common.css.js';
import { styles as fluent } from './shared/snackbar.fluent.css.js';
import { styles as indigo } from './shared/snackbar.indigo.css.js';
import { Themes } from '../../../theming/types.js';

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

import { css } from 'lit';
import { Themes } from '../../../theming/types.js';

// Shared Styles
import { styles as material } from './shared/snackbar.material.css.js';
import { styles as bootstrap } from './shared/snackbar.bootstrap.css.js';
import { styles as fluent } from './shared/snackbar.fluent.css.js';
import { styles as indigo } from './shared/snackbar.indigo.css.js';

// Light Overrides
import { styles as materialLight } from './light/snackbar.material.css.js';
import { styles as bootstrapLight } from './light/snackbar.bootstrap.css.js';
import { styles as fluentLight } from './light/snackbar.fluent.css.js';
import { styles as indigoLight } from './light/snackbar.indigo.css.js';

// Dark Overrides
import { styles as materialDark } from './dark/snackbar.material.css.js';
import { styles as bootstrapDark } from './dark/snackbar.bootstrap.css.js';
import { styles as fluentDark } from './dark/snackbar.fluent.css.js';
import { styles as indigoDark } from './dark/snackbar.indigo.css.js';

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

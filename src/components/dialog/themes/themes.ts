import { css } from 'lit';

// Dark Overrides
import { styles as bootstrapDark } from './dark/dialog.bootstrap.css.js';
import { styles as fluentDark } from './dark/dialog.fluent.css.js';
import { styles as indigoDark } from './dark/dialog.indigo.css.js';
import { styles as materialDark } from './dark/dialog.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/dialog.bootstrap.css.js';
import { styles as fluentLight } from './light/dialog.fluent.css.js';
import { styles as indigoLight } from './light/dialog.indigo.css.js';
import { styles as materialLight } from './light/dialog.material.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/dialog.bootstrap.css.js';
import { styles as fluent } from './shared/dialog.fluent.css.js';
import { styles as indigo } from './shared/dialog.indigo.css.js';
import { styles as material } from './shared/dialog.material.css.js';
import { Themes } from '../../../theming/types.js';

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

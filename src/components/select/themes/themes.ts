import { css } from 'lit';

// Dark Overrides
import { styles as bootstrapDark } from './dark/select.bootstrap.css.js';
import { styles as fluentDark } from './dark/select.fluent.css.js';
import { styles as indigoDark } from './dark/select.indigo.css.js';
import { styles as materialDark } from './dark/select.material.css.js';
import { styles as bootstrapLight } from './light/select.bootstrap.css.js';
// Light Overrides
import { styles as fluentLight } from './light/select.fluent.css.js';
import { styles as indigoLight } from './light/select.indigo.css.js';
import { styles as materialLight } from './light/select.material.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/select.bootstrap.css.js';
import { styles as fluent } from './shared/select.fluent.css.js';
import { styles as indigo } from './shared/select.indigo.css.js';
import { styles as material } from './shared/select.material.css.js';
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

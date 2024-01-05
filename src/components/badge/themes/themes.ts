import { css } from 'lit';

// Dark Overrides
import { styles as bootstrapDark } from './dark/badge.bootstrap.css.js';
import { styles as fluentDark } from './dark/badge.fluent.css.js';
import { styles as indigoDark } from './dark/badge.indigo.css.js';
import { styles as materialDark } from './dark/badge.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/badge.bootstrap.css.js';
import { styles as fluentLight } from './light/badge.fluent.css.js';
import { styles as indigoLight } from './light/badge.indigo.css.js';
import { styles as materialLight } from './light/badge.material.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/badge.bootstrap.css.js';
import { Themes } from '../../../theming/types.js';

const light = {
  bootstrap: css`
    ${bootstrap} ${bootstrapLight}
  `,
  material: css`
    ${materialLight}
  `,
  fluent: css`
    ${fluentLight}
  `,
  indigo: css`
    ${indigoLight}
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
    ${fluentDark}
  `,
  indigo: css`
    ${indigoDark}
  `,
};

export const all: Themes = { light, dark };

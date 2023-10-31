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
import { styles as shared } from './shared/badge.common.css.js';
import { Themes } from '../../../theming/types.js';

const light = {
  bootstrap: css`
    ${shared} ${bootstrap} ${bootstrapLight}
  `,
  material: css`
    ${shared} ${materialLight}
  `,
  fluent: css`
    ${shared} ${fluentLight}
  `,
  indigo: css`
    ${shared} ${indigoLight}
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
    ${shared} ${fluentDark}
  `,
  indigo: css`
    ${shared} ${indigoDark}
  `,
};

export const all: Themes = { light, dark };

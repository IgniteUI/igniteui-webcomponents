import { css } from 'lit';
import { Themes } from '../../../theming/types.js';

// Shared Styles
import { styles as material } from './shared/badge.material.css.js';
import { styles as bootstrap } from './shared/badge.bootstrap.css.js';
import { styles as fluent } from './shared/badge.fluent.css.js';
import { styles as indigo } from './shared/badge.indigo.css.js';

// Light Overrides
import { styles as materialLight } from './light/badge.material.css.js';
import { styles as bootstrapLight } from './light/badge.bootstrap.css.js';
import { styles as fluentLight } from './light/badge.fluent.css.js';
import { styles as indigoLight } from './light/badge.indigo.css.js';

// Dark Overrides
import { styles as materialDark } from './dark/badge.material.css.js';
import { styles as bootstrapDark } from './dark/badge.bootstrap.css.js';
import { styles as fluentDark } from './dark/badge.fluent.css.js';
import { styles as indigoDark } from './dark/badge.indigo.css.js';

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

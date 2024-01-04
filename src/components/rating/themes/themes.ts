import { css } from 'lit';

// Dark Overrides
import { styles as bootstrapDark } from './dark/rating.bootstrap.css.js';
import { styles as fluentDark } from './dark/rating.fluent.css.js';
import { styles as indigoDark } from './dark/rating.indigo.css.js';
import { styles as materialDark } from './dark/rating.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/rating.bootstrap.css.js';
import { styles as fluentLight } from './light/rating.fluent.css.js';
import { styles as indigoLight } from './light/rating.indigo.css.js';
import { styles as materialLight } from './light/rating.material.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/rating.bootstrap.css.js';
import { styles as fluent } from './shared/rating.fluent.css.js';
import { styles as indigo } from './shared/rating.indigo.css.js';
import { Themes } from '../../../theming/types.js';

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

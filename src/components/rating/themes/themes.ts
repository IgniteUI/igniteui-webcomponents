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
import { styles as shared } from './shared/rating.common.css.js';
import { styles as fluent } from './shared/rating.fluent.css.js';
import { styles as indigo } from './shared/rating.indigo.css.js';
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

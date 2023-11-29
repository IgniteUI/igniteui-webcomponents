import { css } from 'lit';

// Dark Overrides
import { styles as bootstrapDark } from './dark/button.bootstrap.css.js';
import { styles as fluentDark } from './dark/button.fluent.css.js';
import { styles as indigoDark } from './dark/button.indigo.css.js';
import { styles as materialDark } from './dark/button.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/button.bootstrap.css.js';
import { styles as fluentLight } from './light/button.fluent.css.js';
import { styles as indigoLight } from './light/button.indigo.css.js';
import { styles as materialLight } from './light/button.material.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/button.bootstrap.css.js';
import { styles as shared } from './shared/button.common.css.js';
import { styles as fluent } from './shared/button.fluent.css.js';
import { styles as indigo } from './shared/button.indigo.css.js';
import { styles as material } from './shared/button.material.css.js';
import { Themes } from '../../../../theming/types.js';

const light = {
  bootstrap: css`
    ${shared} ${bootstrap} ${bootstrapLight}
  `,
  material: css`
    ${shared} ${material} ${materialLight}
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
    ${shared} ${material} ${materialDark}
  `,
  fluent: css`
    ${shared} ${fluent} ${fluentDark}
  `,
  indigo: css`
    ${shared} ${indigo} ${indigoDark}
  `,
};

export const all: Themes = { light, dark };

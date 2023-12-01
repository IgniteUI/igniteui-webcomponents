import { css } from 'lit';

// Dark Overrides
import { styles as bootstrapDark } from './dark/navbar.bootstrap.css.js';
import { styles as fluentDark } from './dark/navbar.fluent.css.js';
import { styles as indigoDark } from './dark/navbar.indigo.css.js';
import { styles as materialDark } from './dark/navbar.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/navbar.bootstrap.css.js';
import { styles as fluentLight } from './light/navbar.fluent.css.js';
import { styles as indigoLight } from './light/navbar.indigo.css.js';
import { styles as materialLight } from './light/navbar.material.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/navbar.bootstrap.css.js';
import { styles as shared } from './shared/navbar.common.css.js';
import { styles as fluent } from './shared/navbar.fluent.css.js';
import { styles as indigo } from './shared/navbar.indigo.css.js';
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

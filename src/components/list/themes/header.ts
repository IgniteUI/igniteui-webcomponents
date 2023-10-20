import { css } from 'lit';

// Dark Overrides
import { styles as bootstrapDark } from './dark/header/list-header.bootstrap.css.js';
import { styles as fluentDark } from './dark/header/list-header.fluent.css.js';
import { styles as indigoDark } from './dark/header/list-header.indigo.css.js';
import { styles as materialDark } from './dark/header/list-header.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/header/list-header.bootstrap.css.js';
import { styles as fluentLight } from './light/header/list-header.fluent.css.js';
import { styles as indigoLight } from './light/header/list-header.indigo.css.js';
import { styles as materialLight } from './light/header/list-header.material.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/header/list-header.bootstrap.css.js';
import { styles as fluent } from './shared/header/list-header.fluent.css.js';
import { styles as indigo } from './shared/header/list-header.indigo.css.js';
import { styles as material } from './shared/header/list-header.material.css.js';
import { Themes } from '../../../theming/types.js';

const light = {
  material: css`
    ${material} ${materialLight}
  `,
  bootstrap: css`
    ${bootstrap} ${bootstrapLight}
  `,
  fluent: css`
    ${fluent} ${fluentLight}
  `,
  indigo: css`
    ${indigo} ${indigoLight}
  `,
};

const dark = {
  material: css`
    ${material} ${materialDark}
  `,
  bootstrap: css`
    ${bootstrap} ${bootstrapDark}
  `,
  fluent: css`
    ${fluent} ${fluentDark}
  `,
  indigo: css`
    ${indigo} ${indigoDark}
  `,
};

export const all: Themes = { light, dark };

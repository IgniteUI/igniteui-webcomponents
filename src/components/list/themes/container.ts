import { css } from 'lit';

// Dark Overrides
import { styles as bootstrapDark } from './dark/container/list.bootstrap.css.js';
import { styles as fluentDark } from './dark/container/list.fluent.css.js';
import { styles as indigoDark } from './dark/container/list.indigo.css.js';
import { styles as materialDark } from './dark/container/list.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/container/list.bootstrap.css.js';
import { styles as fluentLight } from './light/container/list.fluent.css.js';
import { styles as indigoLight } from './light/container/list.indigo.css.js';
import { styles as materialLight } from './light/container/list.material.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/container/list.bootstrap.css.js';
import { styles as fluent } from './shared/container/list.fluent.css.js';
import { styles as indigo } from './shared/container/list.indigo.css.js';
import { styles as material } from './shared/container/list.material.css.js';
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

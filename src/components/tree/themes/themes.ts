import { css } from 'lit';
import { Themes } from '../../../theming/types.js';

// Shared Styles
import { styles as material } from './shared/tree-item.material.css.js';
import { styles as bootstrap } from './shared/tree-item.bootstrap.css.js';
import { styles as fluent } from './shared/tree-item.fluent.css.js';
import { styles as indigo } from './shared/tree-item.indigo.css.js';

// Light Overrides
import { styles as materialLight } from './light/tree-item.material.css.js';
import { styles as bootstrapLight } from './light/tree-item.bootstrap.css.js';
import { styles as fluentLight } from './light/tree-item.fluent.css.js';
import { styles as indigoLight } from './light/tree-item.indigo.css.js';

// Dark Overrides
import { styles as materialDark } from './dark/tree-item.material.css.js';
import { styles as bootstrapDark } from './dark/tree-item.bootstrap.css.js';
import { styles as fluentDark } from './dark/tree-item.fluent.css.js';
import { styles as indigoDark } from './dark/tree-item.indigo.css.js';

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

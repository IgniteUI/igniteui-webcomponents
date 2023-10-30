import { css } from 'lit';

// Dark Overrides
import { styles as bootstrapDark } from './dark/expansion-panel.bootstrap.css.js';
import { styles as fluentDark } from './dark/expansion-panel.fluent.css.js';
import { styles as indigoDark } from './dark/expansion-panel.indigo.css.js';
import { styles as materialDark } from './dark/expansion-panel.material.css.js';
// Light Overrides
import { styles as base } from './expansion-panel.base.css.js';
import { styles as bootstrapLight } from './light/expansion-panel.bootstrap.css.js';
import { styles as fluentLight } from './light/expansion-panel.fluent.css.js';
import { styles as indigoLight } from './light/expansion-panel.indigo.css.js';
import { styles as materialLight } from './light/expansion-panel.material.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/expansion-panel.bootstrap.css.js';
import { styles as fluent } from './shared/expansion-panel.fluent.css.js';
import { styles as indigo } from './shared/expansion-panel.indigo.css.js';
import { Themes } from '../../../theming/types.js';

const light = {
  bootstrap: css`
    ${bootstrap} ${bootstrapLight}
  `,
  material: css`
    ${base} ${materialLight}
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
    ${base} ${materialDark}
  `,
  fluent: css`
    ${fluent} ${fluentDark}
  `,
  indigo: css`
    ${indigo} ${indigoDark}
  `,
};

export const all: Themes = { light, dark };

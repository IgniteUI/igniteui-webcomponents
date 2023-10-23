import { css } from 'lit';

// Dark Overrides
import { styles as bootstrapDark } from './dark/chip.bootstrap.css.js';
import { styles as fluentDark } from './dark/chip.fluent.css.js';
import { styles as indigoDark } from './dark/chip.indigo.css.js';
import { styles as materialDark } from './dark/chip.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/chip.bootstrap.css.js';
import { styles as fluentLight } from './light/chip.fluent.css.js';
import { styles as indigoLight } from './light/chip.indigo.css.js';
import { styles as materialLight } from './light/chip.material.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/chip.bootstrap.css.js';
import { styles as fluent } from './shared/chip.fluent.css.js';
import { styles as indigo } from './shared/chip.indigo.css.js';
import { styles as material } from './shared/chip.material.css.js';
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

import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/date-picker.bootstrap.css.js';
import { styles as fluentDark } from './dark/date-picker.fluent.css.js';
import { styles as indigoDark } from './dark/date-picker.indigo.css.js';
import { styles as materialDark } from './dark/date-picker.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/date-picker.bootstrap.css.js';
import { styles as fluentLight } from './light/date-picker.fluent.css.js';
import { styles as indigoLight } from './light/date-picker.indigo.css.js';
import { styles as materialLight } from './light/date-picker.material.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/date-picker.bootstrap.css.js';
import { styles as fluent } from './shared/date-picker.fluent.css.js';
import { styles as indigo } from './shared/date-picker.indigo.css.js';
import { styles as material } from './shared/date-picker.material.css.js';

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

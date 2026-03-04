import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/date-range-picker.bootstrap.css.js';
import { styles as fluentDark } from './dark/date-range-picker.fluent.css.js';
import { styles as indigoDark } from './dark/date-range-picker.indigo.css.js';
import { styles as materialDark } from './dark/date-range-picker.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/date-range-picker.bootstrap.css.js';
import { styles as fluentLight } from './light/date-range-picker.fluent.css.js';
import { styles as indigoLight } from './light/date-range-picker.indigo.css.js';
import { styles as materialLight } from './light/date-range-picker.material.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/date-range-picker.bootstrap.css.js';
import { styles as fluent } from './shared/date-range-picker.fluent.css.js';
import { styles as indigo } from './shared/date-range-picker.indigo.css.js';
import { styles as material } from './shared/date-range-picker.material.css.js';

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

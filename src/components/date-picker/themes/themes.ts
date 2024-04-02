import { css } from 'lit';

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
import { styles as shared } from './light/date-picker.shared.css.js';
import { Themes } from '../../../theming/types.js';

const light = {
  shared: css`
    ${shared}
  `,
  bootstrap: css`
    ${bootstrapLight}
  `,
  material: css`
    ${materialLight}
  `,
  fluent: css`
    ${fluentLight}
  `,
  indigo: css`
    ${indigoLight}
  `,
};

const dark = {
  shared: css`
    ${shared}
  `,
  bootstrap: css`
    ${bootstrapDark}
  `,
  material: css`
    ${materialDark}
  `,
  fluent: css`
    ${fluentDark}
  `,
  indigo: css`
    ${indigoDark}
  `,
};

export const all: Themes = { light, dark };

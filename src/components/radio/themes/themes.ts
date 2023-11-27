import { css } from 'lit';

// Dark Overrides
import { styles as bootstrapDark } from './dark/radio.bootstrap.css.js';
import { styles as fluentDark } from './dark/radio.fluent.css.js';
import { styles as indigoDark } from './dark/radio.indigo.css.js';
import { styles as materialDark } from './dark/radio.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/radio.bootstrap.css.js';
import { styles as fluentLight } from './light/radio.fluent.css.js';
import { styles as indigoLight } from './light/radio.indigo.css.js';
import { styles as materialLight } from './light/radio.material.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/radio.bootstrap.css.js';
import { styles as fluent } from './shared/radio.fluent.css.js';
import { styles as indigo } from './shared/radio.indigo.css.js';
import { styles as material } from './shared/radio.material.css.js';
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

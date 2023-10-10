import { css } from 'lit';
import { Themes } from '../../../theming/types.js';

// Shared Styles
import { styles as material } from './shared/switch/switch.material.css.js';
import { styles as bootstrap } from './shared/switch/switch.bootstrap.css.js';
import { styles as fluent } from './shared/switch/switch.fluent.css.js';
import { styles as indigo } from './shared/switch/switch.indigo.css.js';

// Light Overrides
import { styles as materialLight } from './light/switch/switch.material.css.js';
import { styles as bootstrapLight } from './light/switch/switch.bootstrap.css.js';
import { styles as fluentLight } from './light/switch/switch.fluent.css.js';
import { styles as indigoLight } from './light/switch/switch.indigo.css.js';

// Dark Overrides
import { styles as materialDark } from './dark/switch/switch.material.css.js';
import { styles as bootstrapDark } from './dark/switch/switch.bootstrap.css.js';
import { styles as fluentDark } from './dark/switch/switch.fluent.css.js';
import { styles as indigoDark } from './dark/switch/switch.indigo.css.js';

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

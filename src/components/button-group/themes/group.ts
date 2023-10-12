import { css } from 'lit';
import { Themes } from '../../../theming/types';

// Shared Styles
import { styles as material } from './shared/group/group.material.css.js';
import { styles as bootstrap } from './shared/group/group.bootstrap.css.js';
import { styles as fluent } from './shared/group/group.fluent.css.js';
import { styles as indigo } from './shared/group/group.indigo.css.js';

// Light Overrides
import { styles as materialLight } from './light/button-group.material.css.js';
import { styles as bootstrapLight } from './light/button-group.bootstrap.css.js';
import { styles as fluentLight } from './light/button-group.fluent.css.js';
import { styles as indigoLight } from './light/button-group.indigo.css.js';

// Dark Overrides
import { styles as materialDark } from './dark/button-group.material.css.js';
import { styles as bootstrapDark } from './dark/button-group.bootstrap.css.js';
import { styles as fluentDark } from './dark/button-group.fluent.css.js';
import { styles as indigoDark } from './dark/button-group.indigo.css.js';

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

import { css } from 'lit';

// Dark Overrides
import { styles as bootstrapDark } from './dark/button-group.bootstrap.css.js';
import { styles as fluentDark } from './dark/button-group.fluent.css.js';
import { styles as indigoDark } from './dark/button-group.indigo.css.js';
import { styles as materialDark } from './dark/button-group.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/button-group.bootstrap.css.js';
import { styles as fluentLight } from './light/button-group.fluent.css.js';
import { styles as indigoLight } from './light/button-group.indigo.css.js';
import { styles as materialLight } from './light/button-group.material.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/group/group.bootstrap.css.js';
import { styles as shared } from './shared/group/group.common.css.js';
import { styles as fluent } from './shared/group/group.fluent.css.js';
import { styles as indigo } from './shared/group/group.indigo.css.js';
import type { Themes } from '../../../theming/types';

const light = {
  bootstrap: css`
    ${shared} ${bootstrap} ${bootstrapLight}
  `,
  material: css`
    ${shared} ${materialLight}
  `,
  fluent: css`
    ${shared} ${fluent} ${fluentLight}
  `,
  indigo: css`
    ${shared} ${indigo} ${indigoLight}
  `,
};

const dark = {
  bootstrap: css`
    ${shared} ${bootstrap} ${bootstrapDark}
  `,
  material: css`
    ${shared} ${materialDark}
  `,
  fluent: css`
    ${shared} ${fluent} ${fluentDark}
  `,
  indigo: css`
    ${shared} ${indigo} ${indigoDark}
  `,
};

export const all: Themes = { light, dark };

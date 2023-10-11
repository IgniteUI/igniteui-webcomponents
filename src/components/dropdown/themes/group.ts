import { css } from 'lit';
import { Themes } from '../../../theming/types.js';

// Shared Styles
import { styles as material } from './shared/group/dropdown-group.material.css.js';
import { styles as bootstrap } from './shared/group/dropdown-group.bootstrap.css.js';
import { styles as fluent } from './shared/group/dropdown-group.fluent.css.js';
import { styles as indigo } from './shared/group/dropdown-group.indigo.css.js';

// Light Overrides
import { styles as materialLight } from './light/group/dropdown-group.material.css.js';
import { styles as bootstrapLight } from './light/group/dropdown-group.bootstrap.css.js';
import { styles as fluentLight } from './light/group/dropdown-group.fluent.css.js';
import { styles as indigoLight } from './light/group/dropdown-group.indigo.css.js';

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

export const all: Themes = { light, dark };

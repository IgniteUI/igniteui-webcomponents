import { css } from 'lit';

// Light Overrides
import { styles as bootstrapLight } from './light/item/dropdown-item.bootstrap.css.js';
import { styles as fluentLight } from './light/item/dropdown-item.fluent.css.js';
import { styles as indigoLight } from './light/item/dropdown-item.indigo.css.js';
import { styles as materialLight } from './light/item/dropdown-item.material.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/item/dropdown-item.bootstrap.css.js';
import { styles as fluent } from './shared/item/dropdown-item.fluent.css.js';
import { styles as indigo } from './shared/item/dropdown-item.indigo.css.js';
import { styles as material } from './shared/item/dropdown-item.material.css.js';
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

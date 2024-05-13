import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/item/list-item.bootstrap.css.js';
import { styles as fluentDark } from './dark/item/list-item.fluent.css.js';
import { styles as indigoDark } from './dark/item/list-item.indigo.css.js';
import { styles as materialDark } from './dark/item/list-item.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/item/list-item.bootstrap.css.js';
import { styles as fluentLight } from './light/item/list-item.fluent.css.js';
import { styles as indigoLight } from './light/item/list-item.indigo.css.js';
import { styles as materialLight } from './light/item/list-item.material.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/item/list-item.bootstrap.css.js';
import { styles as fluent } from './shared/item/list-item.fluent.css.js';
import { styles as indigo } from './shared/item/list-item.indigo.css.js';

const light = {
  bootstrap: css`
    ${bootstrap} ${bootstrapLight}
  `,
  material: css`
    ${materialLight}
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
    ${materialDark}
  `,
  fluent: css`
    ${fluent} ${fluentDark}
  `,
  indigo: css`
    ${indigo} ${indigoDark}
  `,
};

export const all: Themes = { light, dark };

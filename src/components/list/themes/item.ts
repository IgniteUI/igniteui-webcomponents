import { css } from 'lit';

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
import { styles as shared } from './shared/item/list-item.common.css.js';
import { styles as fluent } from './shared/item/list-item.fluent.css.js';
import { styles as indigo } from './shared/item/list-item.indigo.css.js';
import { Themes } from '../../../theming/types.js';

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

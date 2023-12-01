import { css } from 'lit';

// Dark Overrides
import { styles as bootstrapDark } from './dark/header/list-header.bootstrap.css.js';
import { styles as fluentDark } from './dark/header/list-header.fluent.css.js';
import { styles as indigoDark } from './dark/header/list-header.indigo.css.js';
import { styles as materialDark } from './dark/header/list-header.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/header/list-header.bootstrap.css.js';
import { styles as fluentLight } from './light/header/list-header.fluent.css.js';
import { styles as indigoLight } from './light/header/list-header.indigo.css.js';
import { styles as materialLight } from './light/header/list-header.material.css.js';
// Shared Styles
import { styles as shared } from './shared/header/list-header.common.css.js';
import { Themes } from '../../../theming/types.js';

const light = {
  material: css`
    ${shared} ${materialLight}
  `,
  bootstrap: css`
    ${shared} ${bootstrapLight}
  `,
  fluent: css`
    ${shared} ${fluentLight}
  `,
  indigo: css`
    ${shared} ${indigoLight}
  `,
};

const dark = {
  material: css`
    ${shared} ${materialDark}
  `,
  bootstrap: css`
    ${shared} ${bootstrapDark}
  `,
  fluent: css`
    ${shared} ${fluentDark}
  `,
  indigo: css`
    ${shared} ${indigoDark}
  `,
};

export const all: Themes = { light, dark };

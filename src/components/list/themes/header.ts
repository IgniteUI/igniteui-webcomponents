import { css } from 'lit';

// Dark Overrides
import { styles as bootstrapDark } from './dark/header/list-header.bootstrap.css.js';
import { styles as indigoDark } from './dark/header/list-header.indigo.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/header/list-header.bootstrap.css.js';
import { styles as indigoLight } from './light/header/list-header.indigo.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/header/list-header.bootstrap.css.js';
import { styles as indigo } from './shared/header/list-header.indigo.css.js';
import { Themes } from '../../../theming/types.js';

const light = {
  bootstrap: css`
    ${bootstrap} ${bootstrapLight}
  `,
  indigo: css`
    ${indigo} ${indigoLight}
  `,
};

const dark = {
  bootstrap: css`
    ${bootstrap} ${bootstrapDark}
  `,
  indigo: css`
    ${indigo} ${indigoDark}
  `,
};

export const all: Themes = { light, dark };

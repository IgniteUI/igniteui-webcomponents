import { css } from 'lit';

// Dark Overrides
import { styles as bootstrapDark } from './dark/icon.bootstrap.css.js';
import { styles as fluentDark } from './dark/icon.fluent.css.js';
import { styles as indigoDark } from './dark/icon.indigo.css.js';
import { styles as materialDark } from './dark/icon.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/icon.bootstrap.css.js';
import { styles as fluentLight } from './light/icon.fluent.css.js';
import { styles as indigoLight } from './light/icon.indigo.css.js';
import { styles as materialLight } from './light/icon.material.css.js';
// Shared Styles
import { styles as shared } from './shared/icon.common.css.js';
import { Themes } from '../../../theming/types.js';

const light = {
  bootstrap: css`
    ${shared} ${bootstrapLight}
  `,
  material: css`
    ${shared} ${materialLight}
  `,
  fluent: css`
    ${shared} ${fluentLight}
  `,
  indigo: css`
    ${shared} ${indigoLight}
  `,
};

const dark = {
  bootstrap: css`
    ${shared} ${bootstrapDark}
  `,
  material: css`
    ${shared} ${materialDark}
  `,
  fluent: css`
    ${shared} ${fluentDark}
  `,
  indigo: css`
    ${shared} ${indigoDark}
  `,
};

export const all: Themes = { light, dark };

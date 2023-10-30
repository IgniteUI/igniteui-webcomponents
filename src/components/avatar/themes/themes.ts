import { css } from 'lit';

// Shared Styles
import { styles as base } from './avatar.base.css.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/avatar.bootstrap.css.js';
import { styles as fluentDark } from './dark/avatar.fluent.css.js';
import { styles as indigoDark } from './dark/avatar.indigo.css.js';
import { styles as materialDark } from './dark/avatar.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/avatar.bootstrap.css.js';
import { styles as fluentLight } from './light/avatar.fluent.css.js';
import { styles as indigoLight } from './light/avatar.indigo.css.js';
import { styles as materialLight } from './light/avatar.material.css.js';
import type { Themes } from '../../../theming/types.js';

const light = {
  bootstrap: css`
    ${base} ${bootstrapLight}
  `,
  material: css`
    ${base} ${materialLight}
  `,
  fluent: css`
    ${base} ${fluentLight}
  `,
  indigo: css`
    ${base} ${indigoLight}
  `,
};

const dark = {
  bootstrap: css`
    ${base} ${bootstrapDark}
  `,
  material: css`
    ${base} ${materialDark}
  `,
  fluent: css`
    ${base} ${fluentDark}
  `,
  indigo: css`
    ${base} ${indigoDark}
  `,
};

export const all: Themes = { light, dark };

import { css } from 'lit';

// Dark Overrides
import { styles as bootstrapDark } from './dark/toast.bootstrap.css.js';
import { styles as fluentDark } from './dark/toast.fluent.css.js';
import { styles as indigoDark } from './dark/toast.indigo.css.js';
import { styles as materialDark } from './dark/toast.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/toast.bootstrap.css.js';
import { styles as fluentLight } from './light/toast.fluent.css.js';
import { styles as indigoLight } from './light/toast.indigo.css.js';
import { styles as materialLight } from './light/toast.material.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/toast.bootstrap.css.js';
import { styles as shared } from './shared/toast.common.css.js';
import { styles as fluent } from './shared/toast.fluent.css.js';
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
    ${shared} ${indigoLight}
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
    ${shared} ${indigoDark}
  `,
};

export const all: Themes = { light, dark };

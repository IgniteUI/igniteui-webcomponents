import { css } from 'lit';

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
// Shared Styles
import { styles as bootstrap } from './shared/avatar.bootstrap.css.js';
import { styles as shared } from './shared/avatar.common.css.js';
import { styles as fluent } from './shared/avatar.fluent.css.js';
import { styles as indigo } from './shared/avatar.indigo.css.js';
import type { Themes } from '../../../theming/types.js';

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

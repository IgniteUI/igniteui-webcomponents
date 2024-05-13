import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
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
import { styles as shared } from './light/avatar.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/avatar.bootstrap.css.js';
import { styles as fluent } from './shared/avatar.fluent.css.js';
import { styles as indigo } from './shared/avatar.indigo.css.js';

const light = {
  shared: css`
    ${shared}
  `,
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
  shared: css`
    ${shared}
  `,
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

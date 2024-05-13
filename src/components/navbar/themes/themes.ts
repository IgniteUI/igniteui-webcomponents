import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/navbar.bootstrap.css.js';
import { styles as fluentDark } from './dark/navbar.fluent.css.js';
import { styles as indigoDark } from './dark/navbar.indigo.css.js';
import { styles as materialDark } from './dark/navbar.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/navbar.bootstrap.css.js';
import { styles as fluentLight } from './light/navbar.fluent.css.js';
import { styles as indigoLight } from './light/navbar.indigo.css.js';
import { styles as materialLight } from './light/navbar.material.css.js';
import { styles as shared } from './light/navbar.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/navbar.bootstrap.css.js';
import { styles as fluent } from './shared/navbar.fluent.css.js';
import { styles as indigo } from './shared/navbar.indigo.css.js';

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

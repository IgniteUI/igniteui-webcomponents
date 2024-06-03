import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/container/nav-drawer.bootstrap.css.js';
import { styles as fluentDark } from './dark/container/nav-drawer.fluent.css.js';
import { styles as indigoDark } from './dark/container/nav-drawer.indigo.css.js';
import { styles as materialDark } from './dark/container/nav-drawer.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/container/nav-drawer.bootstrap.css.js';
import { styles as fluentLight } from './light/container/nav-drawer.fluent.css.js';
import { styles as indigoLight } from './light/container/nav-drawer.indigo.css.js';
import { styles as materialLight } from './light/container/nav-drawer.material.css.js';
import { styles as shared } from './light/container/nav-drawer.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/container/nav-drawer.bootstrap.css.js';
import { styles as fluent } from './shared/container/nav-drawer.fluent.css.js';
import { styles as indigo } from './shared/container/nav-drawer.indigo.css.js';
import { styles as material } from './shared/container/nav-drawer.material.css.js';

const light = {
  shared: css`
    ${shared}
  `,
  bootstrap: css`
    ${bootstrap} ${bootstrapLight}
  `,
  material: css`
    ${material} ${materialLight}
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
    ${material} ${materialDark}
  `,
  fluent: css`
    ${fluent} ${fluentDark}
  `,
  indigo: css`
    ${indigo} ${indigoDark}
  `,
};

export const all: Themes = { light, dark };

import { css } from 'lit';

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
// Shared Styles
import { styles as bootstrap } from './shared/container/nav-drawer.bootstrap.css.js';
import { styles as shared } from './shared/container/nav-drawer.common.css.js';
import { styles as fluent } from './shared/container/nav-drawer.fluent.css.js';
import { styles as indigo } from './shared/container/nav-drawer.indigo.css.js';
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

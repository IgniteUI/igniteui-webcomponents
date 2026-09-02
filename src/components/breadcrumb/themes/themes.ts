import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/breadcrumb.bootstrap.css.js';
import { styles as fluentDark } from './dark/breadcrumb.fluent.css.js';
import { styles as indigoDark } from './dark/breadcrumb.indigo.css.js';
import { styles as materialDark } from './dark/breadcrumb.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/breadcrumb.bootstrap.css.js';
import { styles as fluentLight } from './light/breadcrumb.fluent.css.js';
import { styles as indigoLight } from './light/breadcrumb.indigo.css.js';
import { styles as materialLight } from './light/breadcrumb.material.css.js';
import { styles as shared } from './light/breadcrumb.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/breadcrumb.bootstrap.css.js';
import { styles as fluent } from './shared/breadcrumb.fluent.css.js';
import { styles as indigo } from './shared/breadcrumb.indigo.css.js';
import { styles as material } from './shared/breadcrumb.material.css.js';

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

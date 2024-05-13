import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/checkbox/checkbox.bootstrap.css.js';
import { styles as fluentDark } from './dark/checkbox/checkbox.fluent.css.js';
import { styles as indigoDark } from './dark/checkbox/checkbox.indigo.css.js';
import { styles as materialDark } from './dark/checkbox/checkbox.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/checkbox/checkbox.bootstrap.css.js';
import { styles as fluentLight } from './light/checkbox/checkbox.fluent.css.js';
import { styles as indigoLight } from './light/checkbox/checkbox.indigo.css.js';
import { styles as materialLight } from './light/checkbox/checkbox.material.css.js';
import { styles as shared } from './light/checkbox/checkbox.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/checkbox/checkbox.bootstrap.css.js';
import { styles as fluent } from './shared/checkbox/checkbox.fluent.css.js';
import { styles as indigo } from './shared/checkbox/checkbox.indigo.css.js';
import { styles as material } from './shared/checkbox/checkbox.material.css.js';

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

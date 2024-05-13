import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/input.bootstrap.css.js';
import { styles as fluentDark } from './dark/input.fluent.css.js';
import { styles as indigoDark } from './dark/input.indigo.css.js';
import { styles as materialDark } from './dark/input.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/input.bootstrap.css.js';
import { styles as fluentLight } from './light/input.fluent.css.js';
import { styles as indigoLight } from './light/input.indigo.css.js';
import { styles as materialLight } from './light/input.material.css.js';
import { styles as shared } from './light/input.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/input.bootstrap.css.js';
import { styles as fluent } from './shared/input.fluent.css.js';
import { styles as indigo } from './shared/input.indigo.css.js';
import { styles as material } from './shared/input.material.css.js';

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

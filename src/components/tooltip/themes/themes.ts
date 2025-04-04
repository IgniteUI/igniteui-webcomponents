import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
import { styles as bootstrapDark } from './dark/tooltip.bootstrap.css.js';
// Dark Overrides
import { styles as fluentDark } from './dark/tooltip.fluent.css.js';
import { styles as indigoDark } from './dark/tooltip.indigo.css.js';
import { styles as materialDark } from './dark/tooltip.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/tooltip.bootstrap.css.js';
import { styles as fluentLight } from './light/tooltip.fluent.css.js';
import { styles as indigoLight } from './light/tooltip.indigo.css.js';
import { styles as materialLight } from './light/tooltip.material.css.js';
import { styles as shared } from './light/tooltip.shared.css.js';

const light = {
  shared: css`
    ${shared}
  `,
  bootstrap: css`
    ${bootstrapLight}
  `,
  material: css`
    ${materialLight}
  `,
  fluent: css`
    ${fluentLight}
  `,
  indigo: css`
    ${indigoLight}
  `,
};

const dark = {
  shared: css`
    ${shared}
  `,
  bootstrap: css`
    ${bootstrapDark}
  `,
  material: css`
    ${materialDark}
  `,
  fluent: css`
    ${fluentDark}
  `,
  indigo: css`
    ${indigoDark}
  `,
};

export const all: Themes = { light, dark };

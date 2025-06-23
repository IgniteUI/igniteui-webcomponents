import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/validator.bootstrap.css.js';
import { styles as fluentDark } from './dark/validator.fluent.css.js';
import { styles as indigoDark } from './dark/validator.indigo.css.js';
import { styles as materialDark } from './dark/validator.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/validator.bootstrap.css.js';
import { styles as fluentLight } from './light/validator.fluent.css.js';
import { styles as indigoLight } from './light/validator.indigo.css.js';
import { styles as materialLight } from './light/validator.material.css.js';
import { styles as shared } from './light/validator.shared.css.js';

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

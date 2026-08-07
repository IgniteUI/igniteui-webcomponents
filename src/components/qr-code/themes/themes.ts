import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/qr-code.bootstrap.css.js';
import { styles as fluentDark } from './dark/qr-code.fluent.css.js';
import { styles as indigoDark } from './dark/qr-code.indigo.css.js';
import { styles as materialDark } from './dark/qr-code.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/qr-code.bootstrap.css.js';
import { styles as fluentLight } from './light/qr-code.fluent.css.js';
import { styles as indigoLight } from './light/qr-code.indigo.css.js';
import { styles as materialLight } from './light/qr-code.material.css.js';
import { styles as shared } from './light/qr-code.shared.css.js';

const light = {
  shared: css`
    ${shared}
  `,
  material: css`
    ${materialLight}
  `,
  bootstrap: css`
    ${bootstrapLight}
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
  material: css`
    ${materialDark}
  `,
  bootstrap: css`
    ${bootstrapDark}
  `,
  fluent: css`
    ${fluentDark}
  `,
  indigo: css`
    ${indigoDark}
  `,
};

export const all: Themes = { light, dark };

import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/tile-manager.bootstrap.css.js';
import { styles as fluentDark } from './dark/tile-manager.fluent.css.js';
import { styles as indigoDark } from './dark/tile-manager.indigo.css.js';
import { styles as materialDark } from './dark/tile-manager.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/tile-manager.bootstrap.css.js';
import { styles as fluentLight } from './light/tile-manager.fluent.css.js';
import { styles as indigoLight } from './light/tile-manager.indigo.css.js';
import { styles as materialLight } from './light/tile-manager.material.css.js';
import { styles as shared } from './light/tile-manager.shared.css.js';
// Shared Styles

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

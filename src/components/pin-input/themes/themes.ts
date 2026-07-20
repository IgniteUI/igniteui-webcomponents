import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/pin-input.bootstrap.css.js';
import { styles as fluentDark } from './dark/pin-input.fluent.css.js';
import { styles as indigoDark } from './dark/pin-input.indigo.css.js';
import { styles as materialDark } from './dark/pin-input.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/pin-input.bootstrap.css.js';
import { styles as fluentLight } from './light/pin-input.fluent.css.js';
import { styles as indigoLight } from './light/pin-input.indigo.css.js';
import { styles as materialLight } from './light/pin-input.material.css.js';
import { styles as shared } from './light/pin-input.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/pin-input.bootstrap.css.js';
import { styles as fluent } from './shared/pin-input.fluent.css.js';
import { styles as indigo } from './shared/pin-input.indigo.css.js';
import { styles as material } from './shared/pin-input.material.css.js';

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

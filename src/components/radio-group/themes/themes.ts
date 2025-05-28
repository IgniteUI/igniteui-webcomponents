import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/radio-group.bootstrap.css.js';
import { styles as fluentDark } from './dark/radio-group.fluent.css.js';
import { styles as indigoDark } from './dark/radio-group.indigo.css.js';
import { styles as materialDark } from './dark/radio-group.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/radio-group.bootstrap.css.js';
import { styles as fluentLight } from './light/radio-group.fluent.css.js';
import { styles as indigoLight } from './light/radio-group.indigo.css.js';
import { styles as materialLight } from './light/radio-group.material.css.js';
import { styles as shared } from './light/radio-group.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/radio-group.bootstrap.css.js';
import { styles as fluent } from './shared/radio-group.fluent.css.js';
import { styles as indigo } from './shared/radio-group.indigo.css.js';
import { styles as material } from './shared/radio-group.material.css.js';

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

import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/textarea.bootstrap.css.js';
import { styles as fluentDark } from './dark/textarea.fluent.css.js';
import { styles as indigoDark } from './dark/textarea.indigo.css.js';
import { styles as materialDark } from './dark/textarea.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/textarea.bootstrap.css.js';
import { styles as fluentLight } from './light/textarea.fluent.css.js';
import { styles as indigoLight } from './light/textarea.indigo.css.js';
import { styles as materialLight } from './light/textarea.material.css.js';
import { styles as shared } from './light/textarea.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/textarea.bootstrap.css.js';
import { styles as fluent } from './shared/textarea.fluent.css.js';
import { styles as indigo } from './shared/textarea.indigo.css.js';
import { styles as material } from './shared/textarea.material.css.js';

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

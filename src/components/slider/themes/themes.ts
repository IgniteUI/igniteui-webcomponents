import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/slider.bootstrap.css.js';
import { styles as fluentDark } from './dark/slider.fluent.css.js';
import { styles as indigoDark } from './dark/slider.indigo.css.js';
import { styles as materialDark } from './dark/slider.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/slider.bootstrap.css.js';
import { styles as fluentLight } from './light/slider.fluent.css.js';
import { styles as indigoLight } from './light/slider.indigo.css.js';
import { styles as materialLight } from './light/slider.material.css.js';
import { styles as shared } from './light/slider.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/slider.bootstrap.css.js';
import { styles as fluent } from './shared/slider.fluent.css.js';
import { styles as indigo } from './shared/slider.indigo.css.js';
import { styles as material } from './shared/slider.material.css.js';

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

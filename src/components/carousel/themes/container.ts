import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/carousel.bootstrap.css.js';
import { styles as fluentDark } from './dark/carousel.fluent.css.js';
import { styles as indigoDark } from './dark/carousel.indigo.css.js';
import { styles as materialDark } from './dark/carousel.material.css.js';
import { styles as sharedDark } from './dark/carousel.shared.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/carousel.bootstrap.css.js';
import { styles as fluentLight } from './light/carousel.fluent.css.js';
import { styles as indigoLight } from './light/carousel.indigo.css.js';
import { styles as materialLight } from './light/carousel.material.css.js';
import { styles as sharedLight } from './light/carousel.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/carousel.bootstrap.css.js';
import { styles as fluent } from './shared/carousel.fluent.css.js';

const light = {
  shared: css`
    ${sharedLight}
  `,
  bootstrap: css`
    ${bootstrap} ${bootstrapLight}
  `,
  material: css`
    ${materialLight}
  `,
  fluent: css`
    ${fluent} ${fluentLight}
  `,
  indigo: css`
    ${indigoLight}
  `,
};

const dark = {
  shared: css`
    ${sharedDark}
  `,
  bootstrap: css`
    ${bootstrap} ${bootstrapDark}
  `,
  material: css`
    ${materialDark}
  `,
  fluent: css`
    ${fluent} ${fluentDark}
  `,
  indigo: css`
    ${indigoDark}
  `,
};

export const all: Themes = { light, dark };

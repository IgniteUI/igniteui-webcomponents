import { css } from 'lit';

// Light Overrides
import { styles as bootstrapLight } from './light/header/card.header.bootstrap.css.js';
import { styles as fluentLight } from './light/header/card.header.fluent.css.js';
import { styles as indigoLight } from './light/header/card.header.indigo.css.js';
import { styles as materialLight } from './light/header/card.header.material.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/header/card.header.bootstrap.css.js';
import { styles as shared } from './shared/header/card.header.common.css.js';
import { styles as fluent } from './shared/header/card.header.fluent.css.js';
import { Themes } from '../../../theming/types.js';

const light = {
  bootstrap: css`
    ${shared} ${bootstrap} ${bootstrapLight}
  `,
  material: css`
    ${shared} ${materialLight}
  `,
  fluent: css`
    ${shared} ${fluent} ${fluentLight}
  `,
  indigo: css`
    ${shared} ${indigoLight}
  `,
};

const dark = {
  bootstrap: css`
    ${shared} ${bootstrap} ${bootstrapLight}
  `,
  material: css`
    ${shared} ${materialLight}
  `,
  fluent: css`
    ${shared} ${fluent} ${fluentLight}
  `,
  indigo: css`
    ${shared} ${indigoLight}
  `,
};

export const all: Themes = { light, dark };

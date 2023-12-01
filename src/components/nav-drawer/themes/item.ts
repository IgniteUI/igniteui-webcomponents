import { css } from 'lit';

// Shared Styles
import { styles as shared } from './shared/item/item.common.css.js';
import { styles as fluent } from './shared/item/item.fluent.css.js';
import { styles as indigo } from './shared/item/item.indigo.css.js';
import { Themes } from '../../../theming/types.js';

const light = {
  bootstrap: css`
    ${shared}
  `,
  material: css`
    ${shared}
  `,
  fluent: css`
    ${shared} ${fluent}
  `,
  indigo: css`
    ${shared} ${indigo}
  `,
};

const dark = {
  bootstrap: css`
    ${shared}
  `,
  material: css`
    ${shared}
  `,
  fluent: css`
    ${shared} ${fluent}
  `,
  indigo: css`
    ${shared} ${indigo}
  `,
};

export const all: Themes = { light, dark };

import { css } from 'lit';

// Shared Styles
import { styles as bootstrap } from './shared/group/dropdown-group.bootstrap.css.js';
import { styles as fluent } from './shared/group/dropdown-group.fluent.css.js';
import { styles as indigo } from './shared/group/dropdown-group.indigo.css.js';
import { styles as material } from './shared/group/dropdown-group.material.css.js';
import { Themes } from '../../../theming/types.js';

const light = {
  bootstrap: css`
    ${bootstrap}
  `,
  material: css`
    ${material}
  `,
  fluent: css`
    ${fluent}
  `,
  indigo: css`
    ${indigo}
  `,
};

const dark = {
  bootstrap: css`
    ${bootstrap}
  `,
  material: css`
    ${material}
  `,
  fluent: css`
    ${fluent}
  `,
  indigo: css`
    ${indigo}
  `,
};

export const all: Themes = { light, dark };

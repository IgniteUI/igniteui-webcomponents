/// <reference types="vite/client" />

import { type CSSResult, html } from 'lit';
import { configureTheme } from '../src/theming/config';
import type { Decorator, Preview } from '@storybook/web-components-vite';
import { withActions } from 'storybook/actions/decorator';

type ThemeImport = { styles: CSSResult };

const themes = import.meta.glob<ThemeImport>(
  '../src/styles/themes/**/*.css.ts',
  {
    eager: true,
    import: 'styles',
  }
);

const getTheme = ({ theme, variant }) => {
  const matcher = `../src/styles/themes/${variant}/${theme}.css.ts`;

  for (const [path, styles] of Object.entries(themes)) {
    if (path === matcher) {
      return styles;
    }
  }
};

const getSize = (size: 'small' | 'medium' | 'large' | 'default') => {
  if (size === 'default') {
    return;
  }

  return `:root {
    --ig-size: var(--ig-size-${size});
  }`;
};

const themeProvider: Decorator = (story, context) => {
  const { theme, variant, direction, size } = context.globals;
  configureTheme(theme, variant);

  const styles = html`
    <style>
      .docs-story,
      .sb-main-padded {
        background: ${variant === 'light' ? '#fff' : '#000'};
        color: ${variant === 'light' ? '#000' : '#fff'};
      }

      #igc-story[dir='rtl'] {
        --ig-dir: -1;
      }

      ${context.loaded.theme}
      ${getSize(size)}
    </style>
  `;

  return html`
    ${styles}
    <div id="igc-story" dir=${direction ?? 'auto'}>${story()}</div>
  `;
};

export default {
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      toolbar: {
        icon: 'cog',
        items: [
          { value: 'bootstrap', title: 'Bootstrap' },
          { value: 'fluent', title: 'Fluent' },
          { value: 'indigo', title: 'Indigo' },
          { value: 'material', title: 'Material' },
        ],
      },
    },
    variant: {
      name: 'Variant',
      description: 'Theme variant',
      toolbar: {
        icon: 'mirror',
        items: [
          {
            value: 'light',
            title: 'Light theme',
          },
          { value: 'dark', title: 'Dark theme' },
        ],
      },
    },
    direction: {
      name: 'Direction',
      description: 'Component direction',
      toolbar: {
        icon: 'accessibility',
        items: [
          { value: 'ltr', title: 'Left-to-right' },
          { value: 'rtl', title: 'Right-to-left' },
        ],
      },
    },
    size: {
      name: 'Size',
      description: 'Component size',
      toolbar: {
        icon: 'grow',
        items: [
          { value: 'default', title: 'Default' },
          { value: 'small', title: 'Small' },
          { value: 'medium', title: 'Medium' },
          { value: 'large', title: 'Large' },
        ],
      },
    },
  },
  initialGlobals: {
    theme: 'bootstrap',
    variant: 'light',
    direction: 'ltr',
    size: 'default',
  },
  parameters: {
    backgrounds: {
      disable: true,
    },
  },
  decorators: [themeProvider, withActions],
  loaders: [
    async (context) => {
      const { theme, variant } = context.globals;
      return { theme: getTheme({ theme, variant }) };
    },
  ],
} satisfies Preview;

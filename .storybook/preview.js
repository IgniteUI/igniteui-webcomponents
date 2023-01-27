import { html } from 'lit-html';
import { configureTheme } from '../dist/src/theming';

const Themes = {
  material_light: await import('../src/styles/themes/light/material.scss'),
  bootstrap_light: await import('../src/styles/themes/light/bootstrap.scss'),
  fluent_light: await import('../src/styles/themes/light/fluent.scss'),
  indigo_light: await import('../src/styles/themes/light/indigo.scss'),
  material_dark: await import('../src/styles/themes/dark/material.scss'),
  bootstrap_dark: await import('../src/styles/themes/dark/bootstrap.scss'),
  fluent_dark: await import('../src/styles/themes/dark/fluent.scss'),
  indigo_dark: await import('../src/styles/themes/dark/indigo.scss'),
};

export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Global theme for components',
    defaultValue: 'bootstrap',
    toolbar: {
      icon: 'cog',
      items: ['bootstrap', 'material', 'fluent', 'indigo'],
      showName: 'True',
    },
  },
  variant: {
    name: 'Variant',
    description: 'Theme variant',
    defaultValue: 'light',
    toolbar: {
      icon: 'mirror',
      items: ['light', 'dark'],
      showName: 'True',
    },
  },
  direction: {
    name: 'Direction',
    description: 'Component direction',
    defaultValue: 'ltr',
    toolbar: {
      icon: 'accessibility',
      items: ['ltr', 'rtl'],
      showName: 'True',
    },
  },
  size: {
    name: 'Size',
    description: 'Component size',
    defaultValue: 'attribute',
    toolbar: {
      icon: 'grow',
      items: ['attribute', 'small', 'medium', 'large'],
      showName: 'True',
    },
  },
};

export const parameters = {
  backgrounds: {
    disable: true,
  },
};

const getTheme = (themeName, variant) => {
  return Themes[`${themeName}_${variant}`];
};

const getSize = (size) => {
  if (size === 'attribute') {
    return;
  }

  return `:root {
    --ig-size: var(--ig-size-${size});
  }`;
};

const themeProvider = (Story, context) => {
  const theme = getTheme(context.globals.theme, context.globals.variant);

  configureTheme(context.globals.theme);

  // Workaround for https://github.com/cfware/babel-plugin-template-html-minifier/issues/56
  const htmlNoMin = html;
  const styles = htmlNoMin`
    <style>
      .sb-main-padded {
          background: ${context.globals.variant === 'light' ? '#fff' : '#000'};
      }

      ${theme.default}
      ${getSize(context.globals.size)}
    </style>`;

  return html` ${styles} ${Story()} `;
};

export const decorators = [themeProvider];

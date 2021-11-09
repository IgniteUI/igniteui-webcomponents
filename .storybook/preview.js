import { html } from 'lit-html';

const Themes = {
  material: await import('../src/styles/themes/material.scss'),
  bootstrap: await import('../src/styles/themes/bootstrap.scss'),
  fluent: await import('../src/styles/themes/fluent.scss'),
  indigo: await import('../src/styles/themes/indigo.scss')
}

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
  direction: {
    name: 'Direction',
    description: 'Component direction',
    defaultValue: 'ltr',
    toolbar: {
      icon: 'accessibility',
      items: ['ltr', 'rtl'],
      showName: 'True',
    }
  }
};

const getTheme = (themeName) => {
  return Themes[themeName];
};

const themeProvider = (Story, context) => {
  const theme = getTheme(context.globals.theme);
  return html`
    <style>
      ${theme.default}
    </style>
    ${Story()}
  `;
};

export const decorators = [themeProvider];

import fs from 'node:fs';
import path from 'node:path';

import { format } from 'prettier';
import { rimraf } from 'rimraf';

const reactDir = new URL('../src/react', import.meta.url);
const metadata = JSON.parse(
  fs.readFileSync(new URL('../custom-elements.json', import.meta.url), 'utf8')
);

const components = getAllComponents(metadata);

await rimraf(reactDir.pathname);
// process.exit();
fs.mkdirSync(reactDir, { recursive: true });

for (const component of components) {
  const fileName = component.tagName.replace(/^igc-/, '');
  const componentDir = path.join(reactDir.pathname, fileName);
  const importPath = component.path.replace(/\.ts$/, '.js');
  const componentFile = path.join(componentDir, path.basename(component.path));

  const { hasEvents, imports, exports, events } = parseEvents(component);

  fs.mkdirSync(componentDir, { recursive: true });

  const litReactImport = hasEvents
    ? `import { type EventName, createComponent  } from '@lit/react'`
    : `import { createComponent } from '@lit/react'`;

  const source = await format(
    `
    ${litReactImport}
    import * as React from 'react';

    import Component from '../../../${importPath}';
    ${imports}
    ${exports}

    const tagName = '${component.tagName}'
    Component.register()

    ${makeDescription(component)}
    const reactWrapper = createComponent({
      tagName,
      elementClass: Component,
      react: React,
      events: {
        ${events}
      },
      displayName: '${component.name}'
    })

    export default reactWrapper
    `,
    { parser: 'babel-ts', singleQuote: true }
  );

  fs.writeFileSync(componentFile, source, 'utf8');
}

function getAllComponents(metadata) {
  const allComponents = [];

  metadata.modules.map((module) => {
    module.declarations?.map((declaration) => {
      if (
        declaration.customElement &&
        declaration.tagName &&
        !declaration.deprecated
      ) {
        const component = declaration;
        const path = module.path;

        if (component) {
          allComponents.push(Object.assign(component, { path }));
        }
      }
    });
  });

  return allComponents;
}

function getEvents(component) {
  return (component.events || []).filter((event) => event.name);
}

function makeDescription(component) {
  return component.description
    ? [
        '/**',
        ...component.description.split('\n').map((part) => `* ${part}`),
        '*/',
      ].join('\n')
    : '';
}

function parseEvents(component) {
  const _events = getEvents(component);
  const hasEvents = _events.length > 0;
  const eventTypeImport = `${component.name}EventMap`;
  const importPath = `../../../${component.path.replace(/\.ts$/, '.js')}`;

  return {
    hasEvents,
    imports: hasEvents
      ? `import type {${eventTypeImport}} from '${importPath}'`
      : '',
    exports: hasEvents
      ? `export type {${eventTypeImport}} from '${importPath}'`
      : '',
    events: hasEvents
      ? _events
          .map(
            (ev) =>
              `on${ev.name}: '${ev.name}' as EventName<${eventTypeImport}['${ev.name}']>`
          )
          .join(',\n')
      : '',
  };
}

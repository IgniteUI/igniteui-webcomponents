import assert from 'node:assert/strict';
import { test } from 'node:test';
import ts from 'typescript';
import badgeImportAlias from '../../migrations/7.5.0-poc.1/badge-import-alias.js';
import badgeNamespaceImport from '../../migrations/7.5.0-poc.2/badge-namespace-import.js';

/** Runs the migrations in order on the files, returning the written paths */
function run(files, ...migrations) {
  const writes = [];
  const host = {
    root: '.',
    typescript: ts,
    files: () => Object.keys(files),
    read: (path) => files[path],
    write: (path, content) => {
      writes.push(path);
      files[path] = content;
    },
  };
  for (const migration of migrations) {
    migration(host);
  }
  return writes;
}

/** Asserts the migrations turn `before` into `after`, then change nothing more */
function migrates(migrations, before, after, file = 'src/main.ts') {
  const files = { [file]: before };
  run(files, ...migrations);
  assert.equal(files[file], after);
  assert.deepEqual(run(files, ...migrations), []);
}

test('namespace: imports IgcBadgeComponent by name, keeping the namespace import while used', () => {
  migrates(
    [badgeNamespaceImport],
    `import * as UI from 'igniteui-webcomponents';

UI.defineComponents(UI.IgcBadgeComponent);
`,
    `import * as UI from 'igniteui-webcomponents';
import { IgcBadgeComponent } from 'igniteui-webcomponents';

UI.defineComponents(IgcBadgeComponent);
`
  );

  migrates(
    [badgeNamespaceImport],
    `import * as UI from 'igniteui-webcomponents';

UI.IgcBadgeComponent.register();
`,
    `import { IgcBadgeComponent } from 'igniteui-webcomponents';

IgcBadgeComponent.register();
`,
    'src/main.js'
  );

  const main = (badge, imports) => `${imports}
import * as Other from './other';

UI.defineComponents(${badge}, UI.IgcAvatarComponent);
const badge = document.querySelector<${badge}>(${badge}.tagName);
Other.IgcBadgeComponent.register();
export const shadowed = (UI: typeof Other) => UI.IgcBadgeComponent;
`;
  migrates(
    [badgeNamespaceImport],
    main(
      'UI.IgcBadgeComponent',
      "import * as UI from 'igniteui-webcomponents';"
    ),
    main(
      'IgcBadgeComponent',
      "import * as UI from 'igniteui-webcomponents';\nimport { IgcBadgeComponent } from 'igniteui-webcomponents';"
    )
  );
});

test('namespace: reuses an import of IgcBadgeComponent by name', () => {
  migrates(
    [badgeNamespaceImport],
    `import * as UI from 'igniteui-webcomponents';
import { IgcBadgeComponent, defineComponents } from 'igniteui-webcomponents';
defineComponents(UI.IgcBadgeComponent, IgcBadgeComponent);
`,
    `import { IgcBadgeComponent, defineComponents } from 'igniteui-webcomponents';
defineComponents(IgcBadgeComponent, IgcBadgeComponent);
`
  );
});

test('namespace: skips a script where IgcBadgeComponent names something else', () => {
  for (const conflict of [
    'const IgcBadgeComponent = 1;',
    'const f = (IgcBadgeComponent) => IgcBadgeComponent;',
    "import { IgcBadgeComponent } from './badge';",
  ]) {
    const text = `import * as UI from 'igniteui-webcomponents';\n${conflict}\nUI.IgcBadgeComponent.register();\n`;
    migrates([badgeNamespaceImport], text, text);
  }
});

test('integration: the migrations run on their own or one after the other, in either order', () => {
  const before = `import { IgcBadgeComponent as Badge } from 'igniteui-webcomponents';
import * as UI from 'igniteui-webcomponents';

UI.defineComponents(Badge, UI.IgcBadgeComponent);
`;
  migrates(
    [badgeImportAlias],
    before,
    `import { IgcBadgeComponent } from 'igniteui-webcomponents';
import * as UI from 'igniteui-webcomponents';

UI.defineComponents(IgcBadgeComponent, UI.IgcBadgeComponent);
`
  );
  migrates(
    [badgeNamespaceImport],
    before,
    `import { IgcBadgeComponent as Badge } from 'igniteui-webcomponents';
import * as UI from 'igniteui-webcomponents';
import { IgcBadgeComponent } from 'igniteui-webcomponents';

UI.defineComponents(Badge, IgcBadgeComponent);
`
  );
  migrates(
    [badgeImportAlias, badgeNamespaceImport],
    before,
    `import { IgcBadgeComponent } from 'igniteui-webcomponents';
import * as UI from 'igniteui-webcomponents';

UI.defineComponents(IgcBadgeComponent, IgcBadgeComponent);
`
  );
  migrates(
    [badgeNamespaceImport, badgeImportAlias],
    before,
    `import * as UI from 'igniteui-webcomponents';
import { IgcBadgeComponent } from 'igniteui-webcomponents';

UI.defineComponents(IgcBadgeComponent, IgcBadgeComponent);
`
  );
});

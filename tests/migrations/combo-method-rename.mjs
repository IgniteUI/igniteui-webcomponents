import assert from 'node:assert/strict';
import { test } from 'node:test';
import ts from 'typescript';
import comboMethodRename from '../../migrations/7.5.0-poc.4/combo-method-rename.js';

/** Asserts the migration turns `before` into `after`, then changes nothing more */
function migrates(before, after, file = 'src/main.ts') {
  const files = { [file]: before };
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
  comboMethodRename(host);
  assert.equal(files[file], after);
  comboMethodRename(host);
  assert.deepEqual(writes, before === after ? [] : [file]);
}

test('renames show() to toggle() on known combos', () => {
  migrates(
    `const combo = document.querySelector('igc-combo');
combo.show();
`,
    `const combo = document.querySelector('igc-combo');
combo.toggle();
`,
    'src/main.js'
  );

  const main = (method) => `import { LitElement } from 'lit';
import { query } from 'lit/decorators.js';
import { IgcComboComponent as Combo, IgcDialogComponent } from 'igniteui-webcomponents';
import type * as UI from 'igniteui-webcomponents';

class View extends LitElement {
  @query('igc-combo') private combo!: Combo;
  @query('igc-dialog') private dialog!: IgcDialogComponent;
  @query('igc-select') private select!: UI.IgcSelectComponent;

  open(other: { show(): void }) {
    this.combo.${method}();
    this.combo?.${method}().then(() => this.dialog.show());
    this.select.show();
    this.combo.hide();
    other.show();
  }
}

const combo = document.querySelector<UI.IgcComboComponent>('#combo');
combo?.${method}();
(document.querySelector('igc-combo') as Combo).${method}();
document.createElement('igc-combo').${method}();
document.querySelector('igc-combo > igc-input')?.show();
let later = document.querySelector('igc-combo');
later.show();
const shadowed = (combo: IgcDialogComponent) => combo.show();
const show = () => combo?.${method}();
`;
  migrates(main('show'), main('toggle'));
});

test('skips IgcComboComponent from another module', () => {
  const text = `import { IgcComboComponent } from './combo';

const combo = document.getElementById('combo') as IgcComboComponent;
combo.show();
`;
  migrates(text, text);
});

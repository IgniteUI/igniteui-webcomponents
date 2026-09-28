import { elementUpdated, expect, fixture, html } from '@open-wc/testing';

import { defineComponents } from '#internals/definitions/defineComponents.js';
import {
  fc,
  SLOW_PROPERTY_RUNS,
  withFixture,
} from '#internals/testing/fast-check-setup.spec.js';
import type { SerializedTile } from './serializer.js';
import IgcTileManagerComponent from './tile-manager.js';
import IgcTileComponent from './tile.js';

const IDS = ['tile-1', 'tile-2', 'tile-3'];
const CONTENT = 'Tile content';

/** Keys a hostile or corrupted layout could carry. */
const HOSTILE_KEYS = [
  '__proto__',
  'constructor',
  'innerHTML',
  'outerHTML',
  'textContent',
  'className',
  'style',
  'onclick',
  'slot',
];

const tileEntry = fc.record(
  {
    id: fc.oneof(fc.constantFrom(...IDS), fc.string(), fc.constant(null)),
    colSpan: fc.integer({ min: 1, max: 10 }),
    rowSpan: fc.integer({ min: 1, max: 10 }),
    colStart: fc.option(fc.integer({ min: 1, max: 10 })),
    rowStart: fc.option(fc.integer({ min: 1, max: 10 })),
    position: fc.integer({ min: 0, max: 5 }),
    disableFullscreen: fc.boolean(),
    disableMaximize: fc.boolean(),
    disableResize: fc.boolean(),
    maximized: fc.boolean(),
  },
  { requiredKeys: ['id'] }
);

const hostileEntry = fc
  .tuple(
    fc.constantFrom(...IDS),
    fc.dictionary(fc.constantFrom(...HOSTILE_KEYS), fc.jsonValue(), {
      minKeys: 1,
    })
  )
  .map(([id, extra]) => ({ ...extra, id }));

/** A layout as JSON text. `__proto__` stays an own key, so `JSON.parse` gets it. */
const layout = fc
  .array(fc.oneof(tileEntry, hostileEntry, fc.jsonValue()), { maxLength: 6 })
  .map((entries) => JSON.stringify(entries));

const template = html`
  <igc-tile-manager>
    ${IDS.map((id) => html`<igc-tile id=${id}>${CONTENT}</igc-tile>`)}
  </igc-tile-manager>
`;

const withTileManager = (run: (el: IgcTileManagerComponent) => Promise<void>) =>
  withFixture(template, run);

describe('Tile manager serialization properties', () => {
  before(() => {
    defineComponents(IgcTileManagerComponent);
  });

  it('restores the layout it saved', async () => {
    await fc.assert(
      fc.asyncProperty(fc.array(tileEntry, { maxLength: 6 }), (tiles) =>
        withTileManager(async (tileManager) => {
          tileManager.loadLayout(JSON.stringify(tiles));
          await elementUpdated(tileManager);

          const saved = tileManager.saveLayout();
          tileManager.loadLayout(saved);
          await elementUpdated(tileManager);

          expect(tileManager.saveLayout()).to.equal(saved);
        })
      ),
      { numRuns: SLOW_PROPERTY_RUNS }
    );
  });

  it('applies only the serialized properties of any layout', async () => {
    await fc.assert(
      fc.asyncProperty(layout, (json) =>
        withTileManager(async (tileManager) => {
          tileManager.loadLayout(json);
          await elementUpdated(tileManager);

          for (const tile of tileManager.tiles) {
            expect(Object.getPrototypeOf(tile)).to.equal(
              IgcTileComponent.prototype
            );
            expect(tile.textContent).to.equal(CONTENT);
            expect(tile.onclick).to.be.null;
            expect(tile.slot).to.equal('');
            expect(IDS).to.include(tile.id);
          }

          const saved: SerializedTile[] = JSON.parse(tileManager.saveLayout());
          expect(saved.map((tile) => tile.id)).to.have.members(IDS);
        })
      ),
      { numRuns: SLOW_PROPERTY_RUNS }
    );
  });

  it('ignores any JSON value that is not a layout', async () => {
    const value = fc.jsonValue().filter((v) => !Array.isArray(v));
    const tileManager = await fixture<IgcTileManagerComponent>(template);
    const before = tileManager.saveLayout();

    await fc.assert(
      fc.asyncProperty(value, async (v) => {
        expect(() => tileManager.loadLayout(JSON.stringify(v))).not.to.throw();
        await elementUpdated(tileManager);
        expect(tileManager.saveLayout()).to.equal(before);
      }),
      { numRuns: SLOW_PROPERTY_RUNS }
    );
  });
});

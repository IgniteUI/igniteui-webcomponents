import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { range } from 'lit/directives/range.js';
import { restore, spy, stub } from 'sinon';
import { getActiveViewTransition } from '#animations/view-transition.js';
import { escapeKey } from '#internals/controllers/key-bindings.js';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import {
  expectCloseTo,
  viewTransitionComplete,
  withDocumentSheets,
} from '#internals/testing/helpers.spec.js';
import {
  simulateClick,
  simulateKeyboard,
  simulateLostPointerCapture,
  simulatePointerDown,
  simulatePointerMove,
} from '#internals/testing/simulate.spec.js';
import { getCenterPoint } from '#internals/utils/dom.js';
import { styles as bootstrap } from '../../styles/themes/light/bootstrap.css.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import IgcDialogComponent from '../dialog/dialog.js';
import type { TileManagerDragMode } from '../types.js';
import IgcTileManagerComponent from './tile-manager.js';
import IgcTileComponent from './tile.js';

describe('Tile drag and drop', () => {
  before(() => {
    defineComponents(IgcTileManagerComponent, IgcDialogComponent);
  });

  let tileManager: IgcTileManagerComponent;

  /** Wait tile dragging view transition(s) to complete. */
  function getTile(index: number): IgcTileComponent {
    return tileManager.tiles[index];
  }

  function getTileContentContainer(element: IgcTileComponent) {
    return element.renderRoot.querySelector<HTMLDivElement>(
      '[part="content-container"]'
    )!;
  }

  function getActionButtons(tile: IgcTileComponent) {
    return Array.from(
      tile.renderRoot
        .querySelector('[part="header"]')
        ?.querySelectorAll(IgcIconButtonComponent.tagName) ?? []
    );
  }

  type DragOverOptions = {
    x: number;
    y: number;
    dx: number;
    dy: number;
  };

  /**
   * Simulates drag over behavior for the given tile by firing two pointermove events
   * inside the tile's bounding box.
   */
  function simulateTileDragOver(
    tile: IgcTileComponent,
    options?: Partial<DragOverOptions>
  ) {
    const opts = Object.assign({ x: 0, y: 0, dx: 1, dy: 1 }, options);

    simulatePointerMove(
      tile,
      { clientX: opts.x, clientY: opts.y },
      { x: opts.dx, y: opts.dy },
      3
    );
  }

  async function dragAndDrop(tile: IgcTileComponent, target: IgcTileComponent) {
    const { x, y } = getCenterPoint(target);

    simulatePointerDown(tile);
    simulateTileDragOver(tile, { x, y });

    await viewTransitionComplete();

    simulateLostPointerCapture(tile);
    await elementUpdated(tileManager);
  }

  function createTileManager(mode: TileManagerDragMode = 'none') {
    const result = Array.from(range(5)).map(
      (i) => html`
        <igc-tile id="tile${i}">
          <h3 slot="title">Tile ${i + 1}</h3>

          <div>
            <p>Content in tile ${i + 1}</p>
          </div>
        </igc-tile>
      `
    );
    return html`
      <igc-tile-manager .dragMode=${mode}>${result}</igc-tile-manager>
    `;
  }

  describe('Default', () => {
    beforeEach(async () => {
      tileManager = await fixture<IgcTileManagerComponent>(createTileManager());
    });

    it('should not allow dragging tiles', async () => {
      const draggedTile = getTile(0);
      const dropTarget = getTile(1);

      const eventSpy = spy(draggedTile, 'emitEvent');

      await dragAndDrop(draggedTile, dropTarget);

      expect(eventSpy).not.called;
      expect(draggedTile.position).to.equal(0);
      expect(dropTarget.position).to.equal(1);
    });

    it('should add draggable part to the tile', async () => {
      const tile = Array.from(
        tileManager.querySelectorAll(IgcTileComponent.tagName)
      )[0];
      const getTileSlot = () =>
        tile.shadowRoot!.querySelector('div[part~="draggable"]');

      tileManager.dragMode = 'tile';
      await elementUpdated(tileManager);

      expect(getTileSlot()).not.to.be.null;

      tileManager.dragMode = 'none';
      await elementUpdated(tileManager);

      expect(getTileSlot()).to.be.null;

      tileManager.dragMode = 'tile-header';
      await elementUpdated(tileManager);

      expect(getTileSlot()).not.to.be.null;
    });
  });

  describe('Tile drag', () => {
    beforeEach(async () => {
      tileManager = await fixture<IgcTileManagerComponent>(
        createTileManager('tile')
      );
    });

    it('should correctly fire `igcTileDragStart` event', async () => {
      const tile = getTile(0);
      const eventSpy = spy(tile, 'emitEvent');

      simulatePointerDown(tile);
      await elementUpdated(tile);

      expect(eventSpy).calledOnceWithExactly('igcTileDragStart', {
        detail: tile,
        cancelable: true,
      });
    });

    it('should stop drag operation when `igcTileDragStart` is prevented', async () => {
      const [tile, target] = [getTile(0), getTile(4)];
      const eventSpy = spy(tile, 'emitEvent');

      tile.addEventListener('igcTileDragStart', (event) => {
        event.preventDefault();
      });

      await dragAndDrop(tile, target);

      expect(eventSpy).calledOnceWith('igcTileDragStart');
      expect(eventSpy).not.calledWith('igcTileDragEnd');
      expect(eventSpy.callCount).to.equal(1);
    });

    it('should correctly fire `igcTileDragEnd` event', async () => {
      const [tile, target] = [getTile(0), getTile(4)];
      const eventSpy = spy(tile, 'emitEvent');

      await dragAndDrop(tile, target);

      expect(eventSpy).calledTwice;
      expect(eventSpy).calledWith('igcTileDragEnd', {
        detail: tile,
      });
    });

    it('swaps with a tile that the pointer reaches straight from another tile', async () => {
      const [dragged, passed, target] = [getTile(0), getTile(2), getTile(3)];
      const { x, y } = getCenterPoint(passed);

      simulatePointerDown(dragged);
      // One move enters a tile, and the next moves over it swap.
      simulatePointerMove(dragged, { clientX: x, clientY: y });
      simulateTileDragOver(dragged, getCenterPoint(target));
      await viewTransitionComplete();
      simulateLostPointerCapture(dragged);
      await getActiveViewTransition()?.finished;

      expect([dragged.position, passed.position, target.position]).to.eql([
        3, 2, 0,
      ]);
    });

    it('should cancel dragging with Escape', async () => {
      const draggedTile = getTile(0);
      const dropTarget = getTile(4);
      const eventSpy = spy(draggedTile, 'emitEvent');
      const { x, y } = getCenterPoint(dropTarget);

      expect(draggedTile.position).to.equal(0);
      expect(dropTarget.position).to.equal(4);

      simulatePointerDown(draggedTile);
      simulateTileDragOver(draggedTile, { x, y });

      await viewTransitionComplete();
      expect(draggedTile.position).to.equal(4);
      expect(dropTarget.position).to.equal(0);

      simulateKeyboard(tileManager, escapeKey);
      await viewTransitionComplete();

      expect(eventSpy).calledWith('igcTileDragCancel');

      expect(draggedTile.position).to.equal(0);
      expect(dropTarget.position).to.equal(4);
    });

    it('restores the start positions after a drag that swaps back and forth', async () => {
      const [dragged, target] = [getTile(0), getTile(1)];
      const { x, y } = getCenterPoint(target);

      simulatePointerDown(dragged);
      simulateTileDragOver(dragged, { x, y });
      await viewTransitionComplete();
      // The transition overlay takes the hit tests until it finishes.
      await getActiveViewTransition()?.finished;
      expect([dragged.position, target.position]).to.eql([1, 0]);

      // Back over the target, now first: its center swaps nothing, its left
      // quarter swaps once. A swap applies in a view transition, so a third
      // move would swap again.
      const { left, width } = target.getBoundingClientRect();
      simulatePointerMove(dragged, { clientX: left + width / 2, clientY: y });
      simulatePointerMove(dragged, { clientX: left + width * 0.1, clientY: y });
      await viewTransitionComplete();
      expect([dragged.position, target.position]).to.eql([0, 1]);

      simulateKeyboard(tileManager, escapeKey);
      await viewTransitionComplete();

      expect(tileManager.tiles.map(({ position }) => position)).to.eql([
        0, 1, 2, 3, 4,
      ]);
      expect([dragged.position, target.position]).to.eql([0, 1]);
    });

    it('keeps the positions whole when the dragged tile leaves after a swap', async () => {
      const [dragged, target] = [getTile(0), getTile(1)];
      const { x, y } = getCenterPoint(target);

      simulatePointerDown(dragged);
      simulateTileDragOver(dragged, { x, y });
      await viewTransitionComplete();
      expect([dragged.position, target.position]).to.eql([1, 0]);

      dragged.remove();
      await getActiveViewTransition()?.finished;

      expect(tileManager.tiles.map(({ position }) => position)).to.eql([
        0, 1, 2, 3,
      ]);
    });

    it('keeps the positions whole when another tile leaves during a drag', async () => {
      const [dragged, target] = [getTile(0), getTile(3)];
      const { x, y } = getCenterPoint(target);

      simulatePointerDown(dragged);
      simulateTileDragOver(dragged, { x, y });
      await viewTransitionComplete();
      await getActiveViewTransition()?.finished;
      expect([dragged.position, target.position]).to.eql([3, 0]);

      getTile(1).remove();
      await elementUpdated(tileManager);
      simulateKeyboard(tileManager, escapeKey);
      await getActiveViewTransition()?.finished;

      expect(
        tileManager.tiles.map(({ id, position }) => [id, position])
      ).to.eql([
        ['tile0', 0],
        ['tile2', 1],
        ['tile3', 2],
        ['tile4', 3],
      ]);
    });

    it('keeps the positions whole when the dragged tile moves to another manager', async () => {
      const [dragged, target] = [getTile(0), getTile(1)];
      const other = await fixture<IgcTileManagerComponent>(html`
        <igc-tile-manager>
          <igc-tile id="other0"></igc-tile>
          <igc-tile id="other1"></igc-tile>
        </igc-tile-manager>
      `);
      const { x, y } = getCenterPoint(target);

      simulatePointerDown(dragged);
      simulateTileDragOver(dragged, { x, y });
      await viewTransitionComplete();
      expect([dragged.position, target.position]).to.eql([1, 0]);

      other.append(dragged);
      await viewTransitionComplete();
      await getActiveViewTransition()?.finished;

      expect(other.tiles.map(({ id, position }) => [id, position])).to.eql([
        ['other0', 0],
        ['tile0', 1],
        ['other1', 2],
      ]);
      expect(tileManager.tiles.map(({ position }) => position)).to.eql([
        0, 1, 2, 3,
      ]);
    });

    it('fires `igcTileDragCancel` after the start positions are back', async () => {
      const [dragged, target] = [getTile(0), getTile(4)];
      const { x, y } = getCenterPoint(target);
      const positions = new Promise<number[]>((resolve) => {
        dragged.addEventListener('igcTileDragCancel', () =>
          resolve([dragged.position, target.position])
        );
      });

      simulatePointerDown(dragged);
      simulateTileDragOver(dragged, { x, y });
      await viewTransitionComplete();
      expect([dragged.position, target.position]).to.eql([4, 0]);

      simulateKeyboard(tileManager, escapeKey);

      expect(await positions).to.eql([0, 4]);
      await getActiveViewTransition()?.finished;
    });

    it('fires `igcTileDragEnd` after the last swap applies', async () => {
      const [dragged, target] = [getTile(0), getTile(4)];
      const { x, y } = getCenterPoint(target);
      const positions = new Promise<number[]>((resolve) => {
        dragged.addEventListener('igcTileDragEnd', () =>
          resolve([dragged.position, target.position])
        );
      });

      // The drop comes before the view transition of the swap applies it.
      simulatePointerDown(dragged);
      simulateTileDragOver(dragged, { x, y });
      simulateLostPointerCapture(dragged);

      expect(await positions).to.eql([4, 0]);
      await getActiveViewTransition()?.finished;
    });

    it('restores a drag that starts before the restore of the last cancel applies', async () => {
      const [dragged, target] = [getTile(0), getTile(1)];

      simulatePointerDown(dragged);
      simulateTileDragOver(dragged, getCenterPoint(target));
      await viewTransitionComplete();
      await getActiveViewTransition()?.finished;
      expect([dragged.position, target.position]).to.eql([1, 0]);

      // The second drag swaps and cancels before the first restore applies.
      simulateKeyboard(tileManager, escapeKey);
      simulatePointerDown(dragged);
      simulateTileDragOver(dragged, getCenterPoint(target));
      simulateKeyboard(tileManager, escapeKey);
      await viewTransitionComplete();
      await getActiveViewTransition()?.finished;

      expect(tileManager.tiles.map(({ position }) => position)).to.eql([
        0, 1, 2, 3, 4,
      ]);
      expect([dragged.position, target.position]).to.eql([0, 1]);
    });

    it('sends the outcome of a drag before the start of the next drag', async () => {
      const [first, second] = [getTile(0), getTile(1)];
      const events: string[] = [];

      for (const tile of [first, second]) {
        for (const name of [
          'igcTileDragStart',
          'igcTileDragEnd',
          'igcTileDragCancel',
        ] as const) {
          tile.addEventListener(name, () => events.push(`${name} ${tile.id}`));
        }
      }

      // The second drag starts before the view transition of the cancel.
      simulatePointerDown(first);
      simulateKeyboard(tileManager, escapeKey);
      simulatePointerDown(second);
      simulateLostPointerCapture(second);
      await viewTransitionComplete();
      await getActiveViewTransition()?.finished;

      expect(events).to.eql([
        'igcTileDragStart tile0',
        'igcTileDragCancel tile0',
        'igcTileDragStart tile1',
        'igcTileDragEnd tile1',
      ]);
    });

    it('keeps the start column that a smaller column count removes during a drag', async () => {
      const [dragged, target] = [getTile(0), getTile(1)];

      tileManager.columnCount = 4;
      dragged.colStart = 3;
      await elementUpdated(tileManager);

      simulatePointerDown(dragged);
      simulateTileDragOver(dragged, getCenterPoint(target));
      await viewTransitionComplete();
      await getActiveViewTransition()?.finished;
      expect([dragged.position, target.colStart]).to.eql([1, 3]);

      tileManager.columnCount = 2;
      await elementUpdated(tileManager);
      simulateKeyboard(tileManager, escapeKey);
      await viewTransitionComplete();
      await getActiveViewTransition()?.finished;

      expect([dragged.position, target.position]).to.eql([0, 1]);
      expect([dragged.colStart, target.colStart]).to.eql([null, null]);
      expect(dragged.getBoundingClientRect().width).to.be.greaterThan(0);
    });

    it('keeps a layout that `loadLayout` gives during a drag', async () => {
      const [dragged, target] = [getTile(0), getTile(1)];
      const reversed = JSON.parse(tileManager.saveLayout()).map(
        (tile: { position: number }) => ({
          ...tile,
          position: 4 - tile.position,
        })
      );

      simulatePointerDown(dragged);
      simulateTileDragOver(dragged, getCenterPoint(target));
      await viewTransitionComplete();
      await getActiveViewTransition()?.finished;
      expect([dragged.position, target.position]).to.eql([1, 0]);

      tileManager.loadLayout(JSON.stringify(reversed));
      simulateKeyboard(tileManager, escapeKey);
      await viewTransitionComplete();
      await getActiveViewTransition()?.finished;

      expect(
        tileManager.tiles.map(({ id, position }) => [id, position])
      ).to.eql([
        ['tile4', 0],
        ['tile3', 1],
        ['tile2', 2],
        ['tile1', 3],
        ['tile0', 4],
      ]);
    });

    it('keeps the drag ghost on the pointer in a swap with a theme style sheet', async () => {
      const [dragged, target] = [getTile(0), getTile(1)];

      // The theme style sheets style the view transitions of the tiles.
      await withDocumentSheets([bootstrap.styleSheet!], async () => {
        simulatePointerDown(dragged);
        simulateTileDragOver(dragged, getCenterPoint(target));

        const transition = getActiveViewTransition()!;
        await transition.ready;

        const ghostAnimations = document
          .getAnimations()
          .filter((animation) =>
            (animation.effect as KeyframeEffect).pseudoElement?.includes(
              '(dragged-tile-ghost)'
            )
          );

        simulateLostPointerCapture(dragged);
        await transition.finished;

        expect(ghostAnimations).to.be.empty;
      });
    });

    it('cancels the drag when an `igcTileDragStart` listener moves the tile', async () => {
      const tile = getTile(0);
      const other = await fixture<IgcTileManagerComponent>(
        html`<igc-tile-manager></igc-tile-manager>`
      );
      const eventSpy = spy(tile, 'emitEvent');

      tile.addEventListener('igcTileDragStart', () => other.append(tile));

      simulatePointerDown(tile);
      await viewTransitionComplete();

      expect(eventSpy).calledWith('igcTileDragCancel');
      expect(tile.part.contains('dragging')).to.be.false;
      expect(tile.style.pointerEvents).to.equal('');
      expect(document.querySelector('[data-drag-ghost]')).to.be.null;
    });

    it('cancels the drag when the tile leaves the page during it', async () => {
      const tile = getTile(0);
      const eventSpy = spy(tile, 'emitEvent');

      simulatePointerDown(tile);
      await elementUpdated(tile);

      tileManager.append(tile);
      await viewTransitionComplete();

      expect(eventSpy).calledWith('igcTileDragCancel');
      expect(tile.part.contains('dragging')).to.be.false;
      expect(tile.style.pointerEvents).to.equal('');
    });

    it('drags only the innermost tile of nested tile managers', async () => {
      const outer = await fixture<IgcTileManagerComponent>(html`
        <igc-tile-manager drag-mode="tile">
          <igc-tile id="outer">
            <igc-tile-manager drag-mode="tile">
              <igc-tile id="inner"><p>Inner</p></igc-tile>
            </igc-tile-manager>
          </igc-tile>
        </igc-tile-manager>
      `);
      const outerTile = outer.querySelector<IgcTileComponent>('#outer')!;
      const innerTile = outer.querySelector<IgcTileComponent>('#inner')!;
      await elementUpdated(innerTile);

      const outerSpy = spy(outerTile, 'emitEvent');
      const innerSpy = spy(innerTile, 'emitEvent');

      simulatePointerDown(innerTile);
      await elementUpdated(innerTile);
      simulateLostPointerCapture(innerTile);
      await elementUpdated(innerTile);

      expect(innerSpy).calledWith('igcTileDragStart');
      expect(outerSpy).not.called;
    });

    it('puts the drag ghost over the tile in the page body', async () => {
      const tile = getTile(1);
      const tileRect = tile.getBoundingClientRect();

      simulatePointerDown(tile);
      await elementUpdated(tile);

      const ghost = document.querySelector('[data-drag-ghost]')!;
      const layer = ghost.parentElement;
      const ghostRect = ghost.getBoundingClientRect();

      simulateLostPointerCapture(tile);

      expect(layer).to.equal(document.body);
      expectCloseTo([ghostRect.x, ghostRect.y], [tileRect.x, tileRect.y], 1);
    });

    it('puts the drag ghost over the tile in an open modal dialog', async () => {
      // The border and the scroll of the dialog do not move the ghost.
      const dialog = await fixture<HTMLDialogElement>(html`
        <dialog style="border: 10px solid; max-height: 300px">
          <div style="height: 150px"></div>
          ${createTileManager('tile')}
        </dialog>
      `);
      dialog.showModal();
      dialog.scrollTop = 100;
      tileManager = dialog.querySelector('igc-tile-manager')!;
      await elementUpdated(tileManager);

      const tile = getTile(0);
      const tileRect = tile.getBoundingClientRect();
      simulatePointerDown(tile);
      await elementUpdated(tile);

      const ghost = document.querySelector('[data-drag-ghost]')!;
      const layer = ghost.parentElement;
      const ghostRect = ghost.getBoundingClientRect();

      simulateLostPointerCapture(tile);
      dialog.close();

      expect(layer).to.equal(dialog);
      expectCloseTo([ghostRect.x, ghostRect.y], [tileRect.x, tileRect.y], 1);
    });

    it('puts the drag ghost into the dialog of an open igc-dialog', async () => {
      const dialog = await fixture<IgcDialogComponent>(
        html`<igc-dialog>${createTileManager('tile')}</igc-dialog>`
      );
      await dialog.show();
      tileManager = dialog.querySelector('igc-tile-manager')!;

      const tile = getTile(0);
      simulatePointerDown(tile);
      await elementUpdated(tile);

      const layer =
        dialog.renderRoot.querySelector('[data-drag-ghost]')?.parentElement;

      simulateLostPointerCapture(tile);
      await dialog.hide();

      expect(layer).to.equal(dialog.renderRoot.querySelector('dialog'));
    });

    it('keeps the drag ghost of an inner tile out of an outer manager in the top layer', async () => {
      const outer = await fixture<IgcTileManagerComponent>(html`
        <igc-tile-manager drag-mode="tile" popover="manual">
          <igc-tile>
            <igc-tile-manager drag-mode="tile">
              <igc-tile id="inner"><p>Inner</p></igc-tile>
            </igc-tile-manager>
          </igc-tile>
        </igc-tile-manager>
      `);
      outer.showPopover();
      const inner = outer.querySelector<IgcTileComponent>('#inner')!;
      await elementUpdated(inner);

      simulatePointerDown(inner);
      await elementUpdated(outer);

      const ghost = outer.renderRoot.querySelector('[data-drag-ghost]');
      expect(outer.tiles.length).to.equal(1);
      expect(ghost?.checkVisibility()).to.be.true;

      simulateLostPointerCapture(inner);
    });

    // The fixture cleanup removes the manager, which closes the popover.
    describe('In a top-layer manager', () => {
      beforeEach(() => {
        tileManager.popover = 'manual';
        tileManager.showPopover();
      });

      it('keeps the drag ghost out of the tiles', async () => {
        const tile = getTile(0);
        simulatePointerDown(tile);
        await elementUpdated(tileManager);

        const ghost = tileManager.renderRoot.querySelector('[data-drag-ghost]');
        expect(tileManager.tiles.length).to.equal(5);
        expect(ghost?.checkVisibility()).to.be.true;

        simulateLostPointerCapture(tile);
      });

      it('puts the drag ghost over a tile with grid starts', async () => {
        const tile = getTile(1);
        Object.assign(tile, { colStart: 2, rowStart: 2 });
        await elementUpdated(tile);

        const tileRect = tile.getBoundingClientRect();
        simulatePointerDown(tile);
        await elementUpdated(tile);

        const ghost =
          tileManager.renderRoot.querySelector('[data-drag-ghost]')!;
        const ghostRect = ghost.getBoundingClientRect();
        expectCloseTo([ghostRect.x, ghostRect.y], [tileRect.x, tileRect.y], 1);

        simulateLostPointerCapture(tile);
      });

      it('keeps the size of the dragged tile with a theme style sheet', async () => {
        const tile = getTile(0);
        const grid = tileManager.renderRoot.querySelector('[part~="base"]')!;
        const sizes = () => [
          grid.scrollWidth,
          grid.scrollHeight,
          tile.offsetWidth,
          tile.offsetHeight,
        ];

        // The theme palette gives the placeholder outline its color.
        await withDocumentSheets([bootstrap.styleSheet!], async () => {
          const before = sizes();

          simulatePointerDown(tile);
          await elementUpdated(tile);

          const during = sizes();
          simulateLostPointerCapture(tile);

          expect(during).to.eql(before);
        });
      });

      it('does not scroll the grid with the drag ghost', async () => {
        const tile = getTile(0);
        const grid = tileManager.renderRoot.querySelector('[part~="base"]')!;
        const before = [grid.scrollWidth, grid.scrollHeight];

        simulatePointerDown(tile);
        simulatePointerMove(tile, {
          clientX: window.innerWidth - 5,
          clientY: window.innerHeight - 5,
        });
        await elementUpdated(tile);

        expect([grid.scrollWidth, grid.scrollHeight]).to.eql(before);

        simulateLostPointerCapture(tile);
      });
    });

    it('does not swap an inner tile with the outer tile that holds it', async () => {
      const outer = await fixture<IgcTileManagerComponent>(html`
        <igc-tile-manager drag-mode="tile">
          <igc-tile>
            <igc-tile-manager drag-mode="tile">
              <igc-tile><p>First</p></igc-tile>
              <igc-tile id="inner"><p>Inner</p></igc-tile>
            </igc-tile-manager>
          </igc-tile>
          <igc-tile></igc-tile>
        </igc-tile-manager>
      `);
      const innerManager = outer.querySelector('igc-tile-manager')!;
      const inner = innerManager.querySelector<IgcTileComponent>('#inner')!;
      await elementUpdated(inner);

      const positions = () =>
        [...outer.tiles, ...innerManager.tiles].map(({ position }) => position);
      const before = positions();

      // The padding of the inner grid is over the outer tile only.
      const { left, top } = innerManager.getBoundingClientRect();
      simulatePointerDown(inner);
      simulatePointerMove(
        inner,
        { clientX: left + 5, clientY: top + 5 },
        { x: 1, y: 1 },
        3
      );
      await viewTransitionComplete();
      simulateLostPointerCapture(inner);

      expect(positions()).to.eql(before);
    });

    it('should adjust reflected tiles positions', async () => {
      const draggedTile = getTile(0);
      const dropTarget = getTile(1);

      tileManager.tiles.forEach((tile, index) => {
        expect(tile.id).to.equal(`tile${index}`);
      });
      expect(draggedTile.position).to.equal(0);
      expect(dropTarget.position).to.equal(1);

      await dragAndDrop(draggedTile, dropTarget);

      const expectedIdsAfterDrag = [
        'tile1',
        'tile0',
        'tile2',
        'tile3',
        'tile4',
      ];
      tileManager.tiles.forEach((tile, index) => {
        expect(tile.id).to.equal(expectedIdsAfterDrag[index]);
      });
      expect(draggedTile.position).to.equal(1);
      expect(dropTarget.position).to.equal(0);
    });

    it('should not change order when dragging a tile onto itself', async () => {
      const initialTiles = tileManager.tiles;
      const tile = getTile(0);

      expect(tileManager.tiles[0].id).to.equal('tile0');
      expect(tileManager.tiles[1].id).to.equal('tile1');

      await dragAndDrop(tile, tile);

      expect(tileManager.tiles).eql(initialTiles);
      expect(tileManager.tiles[0].id).to.equal('tile0');
      expect(tileManager.tiles[1].id).to.equal('tile1');
    });

    it('should swap positions only once while dragging smaller tile over bigger tile', async () => {
      tileManager.columnCount = 5;
      const draggedTile = getTile(0);
      const dropTarget = getTile(1);

      draggedTile.rowSpan = 1;
      draggedTile.colSpan = 1;

      dropTarget.rowSpan = 3;
      dropTarget.colSpan = 3;
      await elementUpdated(tileManager);

      const { x, y } = getCenterPoint(dropTarget);

      simulatePointerDown(draggedTile);
      simulateTileDragOver(draggedTile, { x, y });
      await viewTransitionComplete();

      // Simulate second dragover event (inside dropTarget bounds)
      simulateTileDragOver(draggedTile, { x: x + 5, y: y + 5 });

      await viewTransitionComplete();

      expect(draggedTile.position).to.equal(1);
      expect(dropTarget.position).to.equal(0);

      simulateLostPointerCapture(draggedTile);
      await elementUpdated(draggedTile);
    });

    it('should swap positions properly in RTL mode', async () => {
      tileManager.dir = 'rtl';
      const draggedTile = getTile(0);
      const dropTarget = getTile(1);

      await elementUpdated(tileManager);

      expect(draggedTile.position).to.equal(0);
      expect(dropTarget.position).to.equal(1);

      await dragAndDrop(draggedTile, dropTarget);

      expect(draggedTile.position).to.equal(1);
      expect(dropTarget.position).to.equal(0);
    });

    it('should swap positions properly when row, column and span are specified', async () => {
      const draggedTile = getTile(0);
      const dropTarget = getTile(1);

      draggedTile.colSpan = 2;
      draggedTile.rowSpan = 2;
      draggedTile.colStart = 3;
      draggedTile.rowStart = 3;

      await elementUpdated(tileManager);

      tileManager.tiles.forEach((tile, index) => {
        expect(tile.id).to.equal(`tile${index}`);
      });
      expect(draggedTile.position).to.equal(0);
      expect(dropTarget.position).to.equal(1);

      await dragAndDrop(draggedTile, dropTarget);

      const expectedIdsAfterDrag = [
        'tile1',
        'tile0',
        'tile2',
        'tile3',
        'tile4',
      ];
      tileManager.tiles.forEach((tile, index) => {
        expect(tile.id).to.equal(expectedIdsAfterDrag[index]);
      });
      expect(draggedTile.position).to.equal(1);
      expect(draggedTile.colSpan).to.equal(2);
      expect(draggedTile.rowSpan).to.equal(2);
      expect(draggedTile.colStart).to.be.null;
      expect(draggedTile.rowStart).to.be.null;
      expect(dropTarget.position).to.equal(0);
      expect(dropTarget.colSpan).to.equal(1);
      expect(dropTarget.rowSpan).to.equal(1);
    });

    it('should adjust positions properly when both tiles have columns and rows specified', async () => {
      const draggedTile = getTile(0);
      const dropTarget = getTile(1);

      draggedTile.colStart = 2;
      draggedTile.rowStart = 2;

      dropTarget.colStart = 3;
      dropTarget.rowStart = 3;

      await elementUpdated(tileManager);

      expect(draggedTile.position).to.equal(0);
      expect(dropTarget.position).to.equal(1);

      await dragAndDrop(draggedTile, dropTarget);

      expect(draggedTile.position).to.equal(1);
      expect(draggedTile.colStart).to.equal(3);
      expect(draggedTile.rowStart).to.equal(3);

      expect(dropTarget.position).to.equal(0);
      expect(dropTarget.colStart).to.equal(2);
      expect(dropTarget.rowStart).to.equal(2);
    });
  });

  describe('Tile header drag', () => {
    beforeEach(async () => {
      tileManager = await fixture<IgcTileManagerComponent>(
        createTileManager('tile-header')
      );
    });

    async function dragAndDropFromHeader(
      tile: IgcTileComponent,
      target: IgcTileComponent
    ) {
      const header = tile.renderRoot.querySelector('[part="header"]')!;
      const { x, y } = getCenterPoint(target);

      simulatePointerDown(header);
      simulateTileDragOver(tile, { x, y });

      await viewTransitionComplete();

      simulateLostPointerCapture(tile);
      await elementUpdated(tileManager);
    }

    it('should rearrange tiles when the tile is dropped', async () => {
      const draggedTile = getTile(3);
      const dropTarget = getTile(1);
      const eventSpy = spy(draggedTile, 'emitEvent');

      await dragAndDropFromHeader(draggedTile, dropTarget);

      const expectedIdsAfterDrag = [
        'tile0',
        'tile3',
        'tile2',
        'tile1',
        'tile4',
      ];

      expect(eventSpy).calledTwice;
      tileManager.tiles.forEach((tile, index) => {
        expect(tile.id).to.equal(expectedIdsAfterDrag[index]);
      });
      expect(draggedTile.position).to.equal(1);
      expect(dropTarget.position).to.equal(3);
    });

    it('cancels a touch only on the header, so the content scrolls by touch', async () => {
      const tile = getTile(0);
      const touchStart = (element: Element) => {
        const event = new Event('touchstart', {
          bubbles: true,
          cancelable: true,
        });
        element.dispatchEvent(event);
        return event.defaultPrevented;
      };

      expect(touchStart(tile.querySelector('[slot="title"]')!)).to.be.true;
      expect(touchStart(tile.querySelector('p')!)).to.be.false;
    });

    it('should not start dragging if pointer is not over the header', async () => {
      const draggedTile = getTile(0);
      const dropTarget = getTile(1);
      const eventSpy = spy(draggedTile, 'emitEvent');

      const contentContainer = getTileContentContainer(draggedTile);
      const { x, y } = getCenterPoint(dropTarget);

      simulatePointerDown(contentContainer);

      simulateTileDragOver(draggedTile, { x, y });
      await viewTransitionComplete();

      simulateLostPointerCapture(draggedTile);
      await elementUpdated(tileManager);

      expect(eventSpy).not.called;
      expect(draggedTile.position).to.equal(0);
      expect(dropTarget.position).to.equal(1);
    });
  });

  describe('Special scenarios', () => {
    beforeEach(async () => {
      tileManager = await fixture<IgcTileManagerComponent>(
        createTileManager('tile')
      );
    });

    function createSlottedActionTile() {
      const tile = document.createElement(IgcTileComponent.tagName);
      const button = document.createElement('button');

      button.slot = 'actions';
      button.textContent = 'Custom action';
      tile.append(button);

      return { tile, button };
    }

    it('should disable drag and drop when tile is maximized', async () => {
      const draggedTile = getTile(0);
      const dropTarget = getTile(1);
      const eventSpy = spy(draggedTile, 'emitEvent');

      draggedTile.maximized = true;
      await elementUpdated(tileManager);

      await dragAndDrop(draggedTile, dropTarget);

      expect(eventSpy).not.called;
      expect(draggedTile.position).to.equal(0);
      expect(dropTarget.position).to.equal(1);
    });

    it('lets a maximized tile scroll by touch', async () => {
      const tile = getTile(0);
      const touchStart = () => {
        const event = new Event('touchstart', {
          bubbles: true,
          cancelable: true,
        });
        tile.dispatchEvent(event);
        return event.defaultPrevented;
      };

      expect(touchStart()).to.be.true;

      tile.maximized = true;
      await elementUpdated(tile);

      expect(touchStart()).to.be.false;
    });

    it('should disable drag and drop when tile is in fullscreen mode', async () => {
      const draggedTile = getTile(0);
      const dropTarget = getTile(1);
      const eventSpy = spy(draggedTile, 'emitEvent');

      const buttonFullscreen = draggedTile.renderRoot.querySelector(
        '[name="fullscreen"]'
      )!;

      draggedTile.requestFullscreen = stub().callsFake(() => {
        Object.defineProperty(document, 'fullscreenElement', {
          value: draggedTile,
          configurable: true,
        });
        return Promise.resolve();
      });

      simulateClick(buttonFullscreen);
      await elementUpdated(tileManager);

      expect(draggedTile.fullscreen).to.be.true;

      await dragAndDrop(draggedTile, dropTarget);

      expect(eventSpy).not.calledWith('igcTileDragStart');
      expect(eventSpy).not.calledWith('igcTileDragEnd');

      const expectedIdsAfterDrag = [
        'tile0',
        'tile1',
        'tile2',
        'tile3',
        'tile4',
      ];
      tileManager.tiles.forEach((tile, index) => {
        expect(tile.id).to.equal(expectedIdsAfterDrag[index]);
      });
      expect(draggedTile.position).to.equal(0);
      expect(dropTarget.position).to.equal(1);

      Object.defineProperty(document, 'fullscreenElement', {
        value: null,
        configurable: true,
      });

      restore();
    });

    it('should not start a drag operation when interacting with the default tile actions in `tile-header` drag mode', async () => {
      tileManager.dragMode = 'tile-header';
      const tile = getTile(0);
      const [maximize, _] = getActionButtons(tile);
      const eventSpy = spy(tile, 'emitEvent');

      // Wait for maximized transition trigger from UI
      maximize.click();
      await viewTransitionComplete();

      expect(tile.maximized).to.be.true;
      expect(eventSpy).not.calledWith('igcTileDragStart');

      // Wait for maximized transition trigger from UI
      maximize.click();
      await viewTransitionComplete();

      expect(tile.maximized).to.be.false;
    });

    it('should not start a drag operation when interacting with the default tile actions in `tile` drag mode', async () => {
      tileManager.dragMode = 'tile';
      const tile = getTile(0);
      const [maximize, _] = getActionButtons(tile);
      const eventSpy = spy(tile, 'emitEvent');

      // Wait for maximized transition trigger from UI
      maximize.click();
      await viewTransitionComplete();

      expect(tile.maximized).to.be.true;
      expect(eventSpy).not.calledWith('igcTileDragStart');

      // Wait for maximized transition trigger from UI
      maximize.click();
      await viewTransitionComplete();

      expect(tile.maximized).to.be.false;
    });

    it('should not start a drag operation when interacting with the slotted tile actions in `tile-header` drag mode', async () => {
      const { tile, button } = createSlottedActionTile();
      const eventSpy = spy(tile, 'emitEvent');

      tileManager.dragMode = 'tile-header';
      tileManager.append(tile);
      await elementUpdated(tileManager);

      button.click();
      await elementUpdated(tile);

      expect(eventSpy).not.calledWith('igcTileDragStart');
    });

    it('should not start a drag operation when interacting with the slotted tile actions in `tile` drag mode', async () => {
      const { tile, button } = createSlottedActionTile();
      const eventSpy = spy(tile, 'emitEvent');

      tileManager.dragMode = 'tile';
      tileManager.append(tile);
      await elementUpdated(tileManager);

      button.click();
      await elementUpdated(tile);

      expect(eventSpy).not.calledWith('igcTileDragStart');
    });
  });
});

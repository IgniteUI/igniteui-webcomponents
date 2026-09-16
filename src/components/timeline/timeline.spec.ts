import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';
import { internalsOf } from '#internals/controllers/internals.js';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import { finishAnimationsFor } from '#internals/testing/helpers.spec.js';
import IgcTimelineItemComponent from './item.js';
import IgcTimelineComponent from './timeline.js';

describe('Timeline', () => {
  before(() => {
    defineComponents(IgcTimelineComponent);
  });

  let timeline: IgcTimelineComponent;

  /** Resolves once the items have consumed the timeline context and re-rendered. */
  async function settled(): Promise<void> {
    await nextFrame();
    await Promise.all(timeline.items.map((item) => elementUpdated(item)));
  }

  function states(name: string): boolean[] {
    return timeline.items.map((item) => item.matches(`:state(${name})`));
  }

  function part(item: IgcTimelineItemComponent, name: string): HTMLElement {
    return item.shadowRoot!.querySelector(`[part~='${name}']`)!;
  }

  async function createTimeline(
    template = html`
      <igc-timeline>
        <igc-timeline-item>
          <span slot="opposite">08:00</span>
          <span slot="indicator">1</span>
          First
        </igc-timeline-item>
        <igc-timeline-item>Second</igc-timeline-item>
        <igc-timeline-item>Third</igc-timeline-item>
        <igc-timeline-item>Fourth</igc-timeline-item>
      </igc-timeline>
    `
  ): Promise<void> {
    timeline = await fixture<IgcTimelineComponent>(template);
    await settled();
  }

  beforeEach(async () => {
    await createTimeline();
  });

  describe('Accessibility', () => {
    it('passes the a11y audit', async () => {
      finishAnimationsFor(timeline, { subtree: true });

      await expect(timeline).to.be.accessible();
      await expect(timeline).shadowDom.to.be.accessible();
    });

    it('passes the a11y audit in horizontal orientation', async () => {
      timeline.orientation = 'horizontal';
      await settled();
      finishAnimationsFor(timeline, { subtree: true });

      await expect(timeline).to.be.accessible();
    });

    it('exposes list semantics through internals', () => {
      expect(internalsOf(timeline)!.getARIA('role')).to.equal('list');

      for (const item of timeline.items) {
        expect(internalsOf(item)!.getARIA('role')).to.equal('listitem');
        expect(internalsOf(item)!.getARIA('ariaCurrent')).to.be.null;
      }
    });

    it('marks the active item as aria-current', async () => {
      const [first, second] = timeline.items;

      second.active = true;
      await elementUpdated(second);

      expect(internalsOf(first)!.getARIA('ariaCurrent')).to.be.null;
      expect(internalsOf(second)!.getARIA('ariaCurrent')).to.equal('true');

      second.active = false;
      await elementUpdated(second);

      expect(internalsOf(second)!.getARIA('ariaCurrent')).to.be.null;
    });
  });

  describe('Initial rendering', () => {
    it('reflects default values', () => {
      expect(timeline).dom.to.equal(
        '<igc-timeline orientation="vertical" position="alternate"></igc-timeline>',
        { ignoreChildren: ['igc-timeline'] }
      );

      expect(timeline.items[1]).dom.to.equal(
        '<igc-timeline-item>Second</igc-timeline-item>'
      );
    });

    it('returns only timeline items from `items`', async () => {
      await createTimeline(html`
        <igc-timeline>
          <igc-timeline-item>First</igc-timeline-item>
          <div>Stray</div>
          <igc-timeline-item>Second</igc-timeline-item>
        </igc-timeline>
      `);

      expect(timeline.items.map((item) => item.textContent)).to.eql([
        'First',
        'Second',
      ]);
    });

    it('renders the item parts', () => {
      const [first, second] = timeline.items;

      expect(first).shadowDom.to.equal(`
        <div part="opposite">
          <slot name="opposite"></slot>
        </div>
        <div part="connector">
          <div part="indicator">
            <slot name="indicator"></slot>
          </div>
        </div>
        <div part="content">
          <slot></slot>
        </div>
      `);

      expect(part(second, 'opposite').part.contains('empty')).to.be.true;
      expect(part(second, 'indicator').part.contains('empty')).to.be.true;
    });

    it('drops the empty part when slot content arrives', async () => {
      const item = timeline.items[1];
      const indicator = document.createElement('span');
      indicator.slot = 'indicator';
      item.append(indicator);
      await elementUpdated(item);

      expect(part(item, 'indicator').part.contains('empty')).to.be.false;
      expect(part(item, 'opposite').part.contains('empty')).to.be.true;
    });
  });

  describe('Layout resolution', () => {
    it('alternates sides by default', () => {
      expect(states('ig-start')).to.eql([false, true, false, true]);
    });

    it('follows the timeline `position`', async () => {
      timeline.position = 'start';
      await settled();
      expect(states('ig-start')).to.eql([true, true, true, true]);

      timeline.position = 'end';
      await settled();
      expect(states('ig-start')).to.eql([false, false, false, false]);

      timeline.position = 'alternate';
      await settled();
      expect(states('ig-start')).to.eql([false, true, false, true]);
    });

    it('lets an item override the timeline `position`', async () => {
      timeline.position = 'end';
      const item = timeline.items[2];
      item.position = 'start';
      await settled();

      expect(states('ig-start')).to.eql([false, false, true, false]);

      item.position = undefined;
      await settled();

      expect(states('ig-start')).to.eql([false, false, false, false]);
    });

    it('propagates the orientation', async () => {
      expect(states('ig-horizontal')).to.eql([false, false, false, false]);

      timeline.orientation = 'horizontal';
      await settled();
      expect(states('ig-horizontal')).to.eql([true, true, true, true]);

      timeline.orientation = 'vertical';
      await settled();
      expect(states('ig-horizontal')).to.eql([false, false, false, false]);
    });

    it('re-resolves when items are added or removed', async () => {
      const item = document.createElement(IgcTimelineItemComponent.tagName);
      item.textContent = 'Inserted';
      timeline.prepend(item);
      await settled();

      expect(timeline.items).lengthOf(5);
      expect(states('ig-start')).to.eql([false, true, false, true, false]);

      item.remove();
      await settled();

      expect(timeline.items).lengthOf(4);
      expect(states('ig-start')).to.eql([false, true, false, true]);
    });

    it('resolves a standalone item as vertical end side', async () => {
      const item = await fixture<IgcTimelineItemComponent>(
        html`<igc-timeline-item>Alone</igc-timeline-item>`
      );
      await nextFrame();

      expect(item.matches(':state(ig-start)')).to.be.false;
      expect(item.matches(':state(ig-horizontal)')).to.be.false;
    });
  });

  describe('Complete state', () => {
    it('marks the item after a complete one', async () => {
      const [first, second] = timeline.items;

      first.complete = true;
      await settled();

      expect(first.hasAttribute('complete')).to.be.true;
      expect(states('ig-previous-complete')).to.eql([
        false,
        true,
        false,
        false,
      ]);

      second.complete = true;
      await settled();
      expect(states('ig-previous-complete')).to.eql([false, true, true, false]);

      first.complete = false;
      await settled();
      expect(states('ig-previous-complete')).to.eql([
        false,
        false,
        true,
        false,
      ]);
    });

    it('is resolved from the initial markup', async () => {
      await createTimeline(html`
        <igc-timeline>
          <igc-timeline-item complete>First</igc-timeline-item>
          <igc-timeline-item complete>Second</igc-timeline-item>
          <igc-timeline-item active>Third</igc-timeline-item>
          <igc-timeline-item>Fourth</igc-timeline-item>
        </igc-timeline>
      `);

      expect(states('ig-previous-complete')).to.eql([false, true, true, false]);
      expect(internalsOf(timeline.items[2])!.getARIA('ariaCurrent')).to.equal(
        'true'
      );
    });

    it('follows the item order after a reorder', async () => {
      const [first, , third] = timeline.items;

      third.complete = true;
      await settled();
      expect(states('ig-previous-complete')).to.eql([
        false,
        false,
        false,
        true,
      ]);

      timeline.prepend(third);
      await settled();

      expect(timeline.items[0]).to.equal(third);
      expect(timeline.items[1]).to.equal(first);
      expect(states('ig-previous-complete')).to.eql([
        false,
        true,
        false,
        false,
      ]);
    });
  });
});

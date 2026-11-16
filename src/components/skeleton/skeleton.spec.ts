import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';
import { emulateMedia } from '@web/test-runner-commands';
import { restore, type SinonSpy, spy } from 'sinon';
import { internalsOf } from '#internals/controllers/internals.js';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import {
  allowMotion,
  expectCloseTo,
  isFocused,
  withDocumentSheets,
} from '#internals/testing/helpers.spec.js';
import { firstOf } from '#internals/utils/arrays.js';
import { setStyles } from '#internals/utils/dom.js';
import IgcSkeletonComponent from './skeleton.js';

class FormField extends HTMLElement {
  public static readonly formAssociated = true;
}

describe('Skeleton', () => {
  before(() => {
    defineComponents(IgcSkeletonComponent);
    customElements.define('skeleton-test-field', FormField);
  });
  afterEach(() => restore());

  //#region Helpers

  function getShapes(el: IgcSkeletonComponent): HTMLElement[] {
    return Array.from(
      el.renderRoot.querySelectorAll<HTMLElement>('[part~="shape"]')
    );
  }

  function createIdleSkeleton(
    parentNode?: Element
  ): Promise<IgcSkeletonComponent> {
    return fixture<IgcSkeletonComponent>(
      html`<igc-skeleton><span>Content</span></igc-skeleton>`,
      { parentNode }
    );
  }

  async function createLoadingSkeleton(
    animation: IgcSkeletonComponent['animation'] = 'breathe'
  ): Promise<IgcSkeletonComponent> {
    const el = await fixture<IgcSkeletonComponent>(html`
      <igc-skeleton loading animation=${animation}>
        <div
          style="display: flex; flex-direction: column; gap: 4px; width: 200px;"
        >
          <span style="display: block; height: 16px; width: 100%;">Name</span>
          <span style="display: block; height: 14px; width: 80%;">Role</span>
        </div>
      </igc-skeleton>
    `);
    await settle(el);
    return el;
  }

  /** Waits for a measurement and for the one that the new resize targets start. */
  async function settle(el: IgcSkeletonComponent): Promise<void> {
    await nextFrame();
    await nextFrame();
    await nextFrame();
    await elementUpdated(el);
  }

  /** Builds the content without a template, which oxfmt would reformat. */
  function createSkeletonWith(
    ...content: Node[]
  ): Promise<IgcSkeletonComponent> {
    return createSizedSkeleton({}, ...content);
  }

  async function createSizedSkeleton(
    styles: Partial<CSSStyleDeclaration>,
    ...content: Node[]
  ): Promise<IgcSkeletonComponent> {
    return createSkeletonIn(undefined, styles, ...content);
  }

  async function createSkeletonIn(
    parentNode: Element | undefined,
    styles: Partial<CSSStyleDeclaration>,
    ...content: Node[]
  ): Promise<IgcSkeletonComponent> {
    const el = await fixture<IgcSkeletonComponent>(
      html`<igc-skeleton loading></igc-skeleton>`,
      { parentNode }
    );
    setStyles(el, styles);
    el.append(...content);
    await settle(el);
    return el;
  }

  function createZoomedSkeleton(
    styles: Partial<CSSStyleDeclaration>,
    ...content: Node[]
  ): Promise<IgcSkeletonComponent> {
    const parentNode = document.createElement('div');
    parentNode.style.zoom = '2';
    return createSkeletonIn(parentNode, styles, ...content);
  }

  function block(width: number, height: number): HTMLElement {
    const element = document.createElement('span');
    setStyles(element, {
      display: 'block',
      width: `${width}px`,
      height: `${height}px`,
    });
    return element;
  }

  function blocks(count: number, width: number, height: number): HTMLElement[] {
    return Array.from({ length: count }, () => block(width, height));
  }

  function shadowBlock(markup: string): HTMLElement {
    const element = document.createElement('div');
    element.attachShadow({ mode: 'open' }).innerHTML = markup;
    return element;
  }

  function spyScheduleMeasure(el: IgcSkeletonComponent): SinonSpy {
    return spy(
      el as unknown as { _scheduleMeasure(): void },
      '_scheduleMeasure'
    );
  }

  function withDocumentStyle(
    css: string,
    run: () => Promise<void>
  ): Promise<void> {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
    return withDocumentSheets([sheet], run);
  }

  function expectAligned(shape: Element, source: Element | DOMRect): void {
    const a = shape.getBoundingClientRect();
    const b =
      source instanceof Element ? source.getBoundingClientRect() : source;

    expectCloseTo(
      [a.left, a.top, a.width, a.height],
      [b.left, b.top, b.width, b.height],
      0.5
    );
  }

  function textRect(node: Node): DOMRect {
    const range = document.createRange();
    range.selectNodeContents(node);
    return range.getBoundingClientRect();
  }

  /** The height of a text shape has its own test. */
  function expectTextLine(shape: Element, line: DOMRect): void {
    const a = shape.getBoundingClientRect();

    expectCloseTo(
      [a.left, a.width, a.top + a.height / 2],
      [line.left, line.width, line.top + line.height / 2],
      0.5
    );
  }

  //#endregion

  //#region Accessibility

  describe('Accessibility', () => {
    it('passes the a11y audit in idle state', async () => {
      const el = await createIdleSkeleton();

      await expect(el).dom.to.be.accessible();
      await expect(el).shadowDom.to.be.accessible();
    });

    it('passes the a11y audit in loading state', async () => {
      const el = await createLoadingSkeleton();

      await expect(el).dom.to.be.accessible();
      await expect(el).shadowDom.to.be.accessible();
    });

    it('makes the content inert while loading', async () => {
      const el = await fixture<IgcSkeletonComponent>(html`
        <igc-skeleton loading><button>Action</button></igc-skeleton>
      `);
      const button = el.querySelector('button')!;

      button.focus();
      expect(isFocused(button)).to.be.false;

      el.loading = false;
      await elementUpdated(el);

      button.focus();
      expect(isFocused(button)).to.be.true;
    });
  });

  //#endregion

  //#region Default values

  describe('Defaults', () => {
    it('initializes with correct default property values', async () => {
      const el = await createIdleSkeleton();

      expect(el.loading).to.be.false;
      expect(el.animation).to.equal('breathe');
    });

    it('fills the width of its container like a block', async () => {
      const el = await createIdleSkeleton(block(300, 100));

      expect(el.getBoundingClientRect().width).to.equal(300);
    });

    it('renders no shape placeholders when not loading', async () => {
      const el = await createIdleSkeleton();

      expect(getShapes(el)).to.be.empty;
    });
  });

  //#endregion

  //#region `loading` property

  describe('`loading` property', () => {
    it('reflects to attribute', async () => {
      const el = await createIdleSkeleton();

      el.loading = true;
      await elementUpdated(el);
      expect(el).dom.to.have.attribute('loading');

      el.loading = false;
      await elementUpdated(el);
      expect(el).dom.not.to.have.attribute('loading');
    });

    it('removes all shape placeholders when set to false', async () => {
      const el = await createLoadingSkeleton();
      expect(getShapes(el)).not.to.be.empty;

      el.loading = false;
      await elementUpdated(el);

      expect(getShapes(el)).to.be.empty;
    });

    it('does not set `revealing` custom state when loading was never true', async () => {
      const el = await createIdleSkeleton();

      el.loading = false;
      await elementUpdated(el);

      expect(el.matches(':state(revealing)')).to.be.false;
    });

    it('sets `ariaBusy` from `loading`', async () => {
      const el = await createLoadingSkeleton();
      expect(internalsOf(el)?.getARIA('ariaBusy')).to.equal('true');

      el.loading = false;
      await elementUpdated(el);

      expect(internalsOf(el)?.getARIA('ariaBusy')).to.equal('false');
    });
  });

  //#endregion

  //#region `animation` property

  describe('`animation` property', () => {
    const animations = ['breathe', 'wave'] as const;

    for (const animation of animations) {
      it(`applies \`${animation}\` part to all shapes`, async () => {
        const el = await createLoadingSkeleton(animation);
        const shapes = getShapes(el);

        expect(shapes).not.to.be.empty;
        expect(shapes.every((shape) => shape.part.contains(animation))).to.be
          .true;
      });
    }

    it('adds no animation part with `none`', async () => {
      const el = await createLoadingSkeleton('none');
      const shapes = getShapes(el);

      expect(shapes).not.to.be.empty;
      expect(shapes.every((shape) => shape.part.value === 'shape')).to.be.true;
    });

    it('falls back to `breathe` without the attribute and for another value', async () => {
      const el = await createIdleSkeleton();

      el.setAttribute('animation', 'wave');
      expect(el.animation).to.equal('wave');

      el.removeAttribute('animation');
      expect(el.animation).to.equal('breathe');

      el.animation = 'shimmer' as IgcSkeletonComponent['animation'];
      expect(el.animation).to.equal('breathe');
    });

    it('updates shape parts when `animation` changes', async () => {
      const el = await createLoadingSkeleton('breathe');
      expect(firstOf(getShapes(el)).part.contains('breathe')).to.be.true;

      el.animation = 'wave';
      await elementUpdated(el);

      expect(firstOf(getShapes(el)).part.contains('wave')).to.be.true;
      expect(firstOf(getShapes(el)).part.contains('breathe')).to.be.false;
    });

    it('sets a `--_wave-delay` in exact 0.1s steps that restart after 10 shapes', async () => {
      const el = await createSkeletonWith(...blocks(11, 10, 10));
      const delays = () =>
        getShapes(el).map((shape) =>
          shape.style.getPropertyValue('--_wave-delay')
        );

      for (const animation of ['breathe', 'wave', 'none'] as const) {
        el.animation = animation;
        await elementUpdated(el);

        expect(delays()).to.deep.equal(
          animation === 'wave'
            ? Array.from({ length: 11 }, (_, i) => `${(i % 10) / 10}s`)
            : Array(11).fill('')
        );
      }
    });
  });

  //#endregion

  //#region Motion

  describe('Motion', () => {
    allowMotion();

    function getReveal(el: IgcSkeletonComponent): CSSAnimation {
      const content = el.renderRoot.querySelector('[part="content"]')!;
      return content.getAnimations()[0] as CSSAnimation;
    }

    function isRevealing(el: IgcSkeletonComponent): boolean {
      return el.matches(':state(revealing)');
    }

    async function endLoading(el: IgcSkeletonComponent): Promise<void> {
      el.loading = false;
      await elementUpdated(el);
    }

    it('runs the animation of each shape', async () => {
      const el = await createLoadingSkeleton('breathe');

      for (const shape of getShapes(el)) {
        const [animation] = shape.getAnimations() as CSSAnimation[];
        const timing = animation.effect!.getComputedTiming();

        expect(animation.animationName).to.equal('breathe');
        expect(timing.duration).to.equal(1500);
        expect(timing.iterations).to.equal(Number.POSITIVE_INFINITY);
      }

      el.animation = 'wave';
      await elementUpdated(el);

      getShapes(el).forEach((shape, i) => {
        const [animation] = shape.getAnimations() as CSSAnimation[];
        const timing = animation.effect!.getComputedTiming();

        expect(animation.animationName).to.equal('wave');
        expect(timing.duration).to.equal(1000);
        expect(timing.iterations).to.equal(Number.POSITIVE_INFINITY);
        expect(timing.delay).to.be.closeTo(i * 100, 0.001);
      });

      el.animation = 'none';
      await elementUpdated(el);

      expect(getShapes(el)).not.to.be.empty;
      expect(el.shadowRoot!.getAnimations()).to.be.empty;
    });

    it('adds no scrollable overflow and keeps the room for the motion', async () => {
      const scroller = document.createElement('div');
      setStyles(scroller, {
        width: '200px',
        height: '100px',
        overflow: 'auto',
      });
      const el = await createSkeletonIn(scroller, {}, block(200, 100));
      const shape = () => firstOf(getShapes(el));

      // The peak of `breathe` scales the shape past the scroller.
      firstOf(shape().getAnimations()).currentTime = 750;
      expect(scroller.scrollHeight).to.equal(scroller.clientHeight);
      expect(scroller.scrollWidth).to.equal(scroller.clientWidth);

      el.animation = 'wave';
      await elementUpdated(el);
      firstOf(shape().getAnimations()).currentTime = 500;

      expect(shape().getBoundingClientRect().top).to.be.at.least(
        shape().parentElement!.getBoundingClientRect().top
      );
    });

    it('runs the reveal on the content, also with `none`, and sets `revealing` until it ends', async () => {
      const el = await createLoadingSkeleton('none');

      await endLoading(el);
      const reveal = getReveal(el);

      expect(reveal.animationName).to.equal('reveal-content');
      expect(reveal.effect!.getComputedTiming().duration).to.equal(600);
      expect(isRevealing(el)).to.be.true;

      reveal.finish();
      await nextFrame();

      expect(isRevealing(el)).to.be.false;
    });

    it('keeps `revealing` for a longer reveal in the styles', async () => {
      await withDocumentStyle(
        'igc-skeleton::part(content) { animation-duration: 1.2s; }',
        async () => {
          const el = await createLoadingSkeleton();

          await endLoading(el);
          const reveal = getReveal(el);
          reveal.currentTime = 700;
          await nextFrame();

          expect(isRevealing(el)).to.be.true;

          reveal.finish();
          await nextFrame();

          expect(isRevealing(el)).to.be.false;
        }
      );
    });

    it('ends `revealing` when loading starts again, and an old reveal does not end a new one', async () => {
      const el = await createLoadingSkeleton();

      await endLoading(el);
      const canceled = getReveal(el).finished.catch(() => undefined);

      el.loading = true;
      await elementUpdated(el);
      expect(isRevealing(el)).to.be.false;
      expect(getReveal(el)).to.be.undefined;

      await endLoading(el);
      await canceled;
      await nextFrame();

      expect(isRevealing(el)).to.be.true;
    });

    it('ends the reveal on disconnect', async () => {
      const el = await createLoadingSkeleton();
      const parent = el.parentElement!;

      await endLoading(el);
      expect(isRevealing(el)).to.be.true;

      el.remove();
      parent.append(el);

      expect(isRevealing(el)).to.be.false;
    });

    it('runs no animation under reduced motion, and the reveal ends at once', async () => {
      await emulateMedia({ reducedMotion: 'reduce' });
      const el = await createLoadingSkeleton('wave');

      expect(getShapes(el)).not.to.be.empty;
      expect(el.shadowRoot!.getAnimations()).to.be.empty;

      await endLoading(el);
      await nextFrame();

      expect(isRevealing(el)).to.be.false;
      expect(el.shadowRoot!.getAnimations()).to.be.empty;
    });
  });

  //#endregion

  //#region Content projection

  describe('Content projection', () => {
    it('measures the correct number of leaf nodes as shapes', async () => {
      const el = await createLoadingSkeleton();

      expect(getShapes(el)).to.have.lengthOf(2);
    });
  });

  //#endregion

  //#region Measurement

  describe('Measurement', () => {
    it('aligns shapes with their sources when the host has a border', async () => {
      const source = block(50, 20);
      const el = await createSkeletonWith(source);
      el.style.border = '10px solid';
      await settle(el);

      expectAligned(firstOf(getShapes(el)), source);
    });

    it('renders a shape for each text run next to sibling elements', async () => {
      const paragraph = document.createElement('p');
      const bold = document.createElement('b');
      bold.textContent = 'world';
      paragraph.append(
        document.createTextNode('Hello '),
        bold,
        document.createTextNode(' ')
      );
      const el = await createSkeletonWith(paragraph);

      expect(getShapes(el)).to.have.lengthOf(2);
    });

    it('renders a shape for text projected directly into the host', async () => {
      const el = await createSkeletonWith(document.createTextNode('Loading'));
      expect(getShapes(el)).to.have.lengthOf(1);
    });

    it('skips hidden and zero-size elements', async () => {
      const hidden = block(50, 20);
      hidden.style.display = 'none';
      const el = await createSkeletonWith(block(50, 20), block(0, 20), hidden);

      expect(getShapes(el)).to.have.lengthOf(1);
    });

    it('keeps the border radius of a source and falls back when it has none', async () => {
      const rounded = block(50, 20);
      rounded.style.borderRadius = '4px';
      const el = await createSkeletonWith(rounded, block(50, 20));
      const [first, second] = getShapes(el);

      expect(first.style.borderRadius).to.equal('4px');
      expect(second.style.borderRadius).to.be.empty;
      expect(getComputedStyle(second).borderRadius).not.to.equal('0px');
    });

    it('draws text shapes as tall as the font size in the middle of each line', async () => {
      const paragraph = document.createElement('p');
      setStyles(paragraph, {
        font: '12px/16px sans-serif',
        width: '60px',
        margin: '0',
      });
      paragraph.textContent = 'Hello there friend';
      const el = await createSkeletonWith(paragraph);

      const { top, height } = paragraph.getBoundingClientRect();
      const lines = Math.round(height / 16);
      const shapes = getShapes(el).map((shape) =>
        shape.getBoundingClientRect()
      );

      expect(lines).to.be.greaterThan(1);
      expect(shapes).to.have.lengthOf(lines);
      shapes.forEach((shape, i) => {
        expect(shape.height).to.be.closeTo(12, 0.5);
        expect(shape.top - top).to.be.closeTo(i * 16 + 2, 1);
      });
    });

    it('scales the text shapes with the zoom of an ancestor', async () => {
      const bold = document.createElement('b');
      bold.textContent = 'Zoomed';
      const label = document.createElement('span');
      label.style.display = 'contents';
      label.textContent = 'Contents';
      const el = await createZoomedSkeleton(
        { display: 'flex', fontSize: '10px' },
        bold,
        label
      );

      const shapes = getShapes(el);

      expect(shapes).to.have.lengthOf(2);
      for (const shape of shapes) {
        expect(shape.getBoundingClientRect().height).to.be.closeTo(20, 0.5);
      }
    });

    it('keeps the box of a custom element, a control and embedded content with text', async () => {
      const chip = document.createElement('skeleton-test-chip');
      setStyles(chip, { display: 'inline-block', padding: '8px' });
      chip.textContent = 'Chip';
      const field = document.createElement('skeleton-test-field');
      setStyles(field, { display: 'inline-block', padding: '8px' });
      field.append(document.createElement('b'), 'Field');
      const button = document.createElement('button');
      const icon = document.createElement('b');
      icon.textContent = '+';
      button.append(icon, 'Save');
      const textarea = document.createElement('textarea');
      textarea.textContent = 'Notes';
      const canvas = document.createElement('canvas');
      canvas.width = 40;
      canvas.height = 20;
      canvas.textContent = 'Chart';
      const sources = [chip, field, button, textarea, canvas];
      const el = await createSkeletonWith(...sources);

      const shapes = getShapes(el);

      expect(shapes).to.have.lengthOf(sources.length);
      sources.forEach((source, i) => expectAligned(shapes[i], source));
    });

    it('takes the font size and the visibility of slotted text from its slot', async () => {
      const small = shadowBlock(
        '<div style="font-size: 10px"><slot></slot></div>'
      );
      small.append('Small');
      const hidden = shadowBlock(
        '<div style="visibility: hidden"><slot></slot></div>'
      );
      hidden.append('Hidden');
      const el = await createSizedSkeleton({ fontSize: '20px' }, small, hidden);

      expect(getShapes(el)).to.have.lengthOf(1);
      expect(
        firstOf(getShapes(el)).getBoundingClientRect().height
      ).to.be.closeTo(10, 0.5);
    });

    it('draws text shapes across the lines of vertical text', async () => {
      const paragraph = document.createElement('p');
      setStyles(paragraph, {
        writingMode: 'vertical-rl',
        font: '12px/16px sans-serif',
        height: '60px',
        margin: '0',
      });
      paragraph.textContent = 'Hello there friend';
      const el = await createSkeletonWith(paragraph);

      const { right, width } = paragraph.getBoundingClientRect();
      const lines = Math.round(width / 16);
      const shapes = getShapes(el).map((shape) =>
        shape.getBoundingClientRect()
      );

      expect(lines).to.be.greaterThan(1);
      expect(shapes).to.have.lengthOf(lines);
      shapes.forEach((shape, i) => {
        expect(shape.width).to.be.closeTo(12, 0.5);
        expect(shape.height).to.be.greaterThan(12);
        expect(right - shape.right).to.be.closeTo(i * 16 + 2, 1);
      });
    });

    it('keeps the shapes in place when a scale transform on an ancestor ends', async () => {
      const parentNode = document.createElement('div');
      parentNode.style.transform = 'scale(0.5)';
      const source = block(50, 20);
      const label = document.createElement('b');
      label.textContent = 'Text';
      const el = await createSkeletonIn(
        parentNode,
        { fontSize: '10px' },
        source,
        label
      );

      expectAligned(firstOf(getShapes(el)), source);
      expect(getShapes(el)[1].getBoundingClientRect().height).to.be.closeTo(
        5,
        0.5
      );

      // No observer reports the end of a transform.
      parentNode.style.transform = 'none';
      await nextFrame();

      expectAligned(firstOf(getShapes(el)), source);
      expect(getShapes(el)[1].getBoundingClientRect().height).to.be.closeTo(
        10,
        0.5
      );
    });

    it('clips the text of a text element to its overflow', async () => {
      const label = block(50, 20);
      setStyles(label, { overflow: 'hidden', whiteSpace: 'nowrap' });
      label.textContent = 'A label that is wider than its box';
      const el = await createSkeletonWith(label);

      const shape = firstOf(getShapes(el)).getBoundingClientRect();

      expect(shape.left).to.be.closeTo(label.getBoundingClientRect().left, 0.5);
      expect(shape.width).to.be.closeTo(50, 0.5);
    });

    it('gives a text shape the radius in the styles', async () => {
      const tag = document.createElement('span');
      tag.style.borderRadius = '999px';
      tag.textContent = 'Paid';
      const el = await createSkeletonWith(tag);

      expect(firstOf(getShapes(el)).style.borderRadius).to.be.empty;
    });

    it('updates the shapes when content is added', async () => {
      // The fixed size keeps the host resize out of it.
      const el = await createSizedSkeleton(
        { width: '200px', height: '100px' },
        block(50, 20)
      );

      el.append(block(50, 20));
      await settle(el);

      expect(getShapes(el)).to.have.lengthOf(2);
    });

    it('updates the shapes when an attribute changes a source', async () => {
      const source = block(50, 20);
      const el = await createSizedSkeleton({ width: '200px' }, source);

      source.style.marginLeft = '30px';
      await settle(el);

      expectAligned(firstOf(getShapes(el)), source);
    });

    it('updates the shapes when a source resizes inside a fixed-size host', async () => {
      const source = block(50, 20);
      source.classList.add('skeleton-probe');
      const el = await createSizedSkeleton({ width: '200px' }, source);

      // The mutation observer does not see a document style.
      await withDocumentStyle(
        '.skeleton-probe { width: 120px !important; }',
        async () => {
          await settle(el);
          expectAligned(firstOf(getShapes(el)), source);
        }
      );
    });

    it('updates the shapes of text in the host when the host resizes', async () => {
      const el = await createSkeletonWith(
        document.createTextNode('Loading the latest posts')
      );
      el.parentElement!.style.width = '40px';
      await settle(el);

      expect(getShapes(el).length).to.be.greaterThan(1);
    });

    it('renders a shape when a zero-size source grows inside a fixed-size host', async () => {
      const source = block(0, 0);
      source.classList.add('skeleton-grow');
      const el = await createSizedSkeleton(
        { width: '200px', height: '100px' },
        block(50, 20),
        source
      );
      expect(getShapes(el)).to.have.lengthOf(1);

      await withDocumentStyle(
        '.skeleton-grow { width: 40px !important; height: 20px !important; }',
        async () => {
          await settle(el);
          expect(getShapes(el)).to.have.lengthOf(2);
          expectAligned(getShapes(el)[1], source);
        }
      );
    });

    it('renders the box of an element whose children have no box', async () => {
      const select = document.createElement('select');
      select.append(new Option('United States'));
      const el = await createSkeletonWith(select);

      expect(getShapes(el)).to.have.lengthOf(1);
      expectAligned(firstOf(getShapes(el)), select);
    });

    it('renders one shape for an inline SVG', async () => {
      const ns = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('width', '24');
      svg.setAttribute('height', '24');

      for (const x of [0, 8, 16]) {
        const rect = document.createElementNS(ns, 'rect');
        rect.setAttribute('x', `${x}`);
        rect.setAttribute('width', '6');
        rect.setAttribute('height', '24');
        svg.append(rect);
      }

      const el = await createSkeletonWith(svg);

      expect(getShapes(el)).to.have.lengthOf(1);
      expectAligned(firstOf(getShapes(el)), svg);
    });

    it('renders a shape for each line of a wrapped inline element', async () => {
      const paragraph = document.createElement('p');
      paragraph.style.width = '80px';
      const link = document.createElement('a');
      link.textContent = 'a link that wraps over lines';
      paragraph.append(document.createTextNode('Text '), link);
      const el = await createSkeletonWith(paragraph);

      const lines = Array.from(link.getClientRects());
      const shapes = getShapes(el).slice(1);

      expect(lines.length).to.be.greaterThan(1);
      expect(shapes).to.have.lengthOf(lines.length);
      shapes.forEach((shape, i) => expectTextLine(shape, lines[i]));
    });

    /** Splits text as a template renders `#${id}`. */
    function splitText(...parts: string[]): Node[] {
      return parts.flatMap((part, i) => [
        ...(i ? [document.createComment('')] : []),
        document.createTextNode(part),
      ]);
    }

    function uniqueMiddles(rects: Iterable<DOMRect>): number[] {
      return [
        ...new Set(Array.from(rects, (rect) => rect.top + rect.height / 2)),
      ];
    }

    it('renders one shape for a leaf whose text is split into several nodes', async () => {
      const link = document.createElement('a');
      link.append(...splitText('#', '10480'));
      const el = await createSkeletonWith(link);

      expect(link.getClientRects()).to.have.lengthOf(2);
      expect(getShapes(el)).to.have.lengthOf(1);
      expectTextLine(firstOf(getShapes(el)), link.getBoundingClientRect());
    });

    it('renders one shape for each line of a wrapped leaf with split text', async () => {
      const paragraph = document.createElement('p');
      paragraph.style.width = '80px';
      const link = document.createElement('a');
      link.append(...splitText('a link ', 'that wraps ', 'over lines'));
      paragraph.append(link);
      const el = await createSkeletonWith(paragraph);

      const lines = uniqueMiddles(link.getClientRects());
      const shapes = getShapes(el).map((shape) =>
        shape.getBoundingClientRect()
      );

      expect(lines.length).to.be.greaterThan(1);
      expect(shapes).to.have.lengthOf(lines.length);
      expectCloseTo(uniqueMiddles(shapes), lines, 0.5);
    });

    it('renders one shape for a text run that is split into several nodes', async () => {
      const paragraph = document.createElement('p');
      const bold = document.createElement('b');
      bold.textContent = 'Revenue';
      const run = splitText('Last', ' ', '30', ' days');
      paragraph.append(bold, ...run, document.createTextNode(' '));
      const el = await createSkeletonWith(paragraph);

      const range = document.createRange();
      range.setStartBefore(firstOf(run));
      range.setEndAfter(run.at(-1)!);

      // <b> and the run touch, but they are separate sources.
      expect(getShapes(el)).to.have.lengthOf(2);
      expectTextLine(getShapes(el)[0], bold.getBoundingClientRect());
      expectTextLine(getShapes(el)[1], range.getBoundingClientRect());
    });

    it('renders one shape for split text in a right-to-left layout', async () => {
      const paragraph = document.createElement('p');
      paragraph.dir = 'rtl';
      const link = document.createElement('a');
      link.append(...splitText('שלום ', '30', ' עולם'));
      paragraph.append(link);
      const el = await createSkeletonWith(paragraph);

      expect(getShapes(el)).to.have.lengthOf(1);
      expectTextLine(firstOf(getShapes(el)), link.getBoundingClientRect());
    });

    it('clips the shapes to a scroll container and follows its scroll', async () => {
      const scroller = document.createElement('div');
      setStyles(scroller, { height: '50px', overflow: 'auto' });
      const [first, second, third] = blocks(3, 40, 40);
      scroller.append(first, second, third);
      const footer = block(40, 20);
      const el = await createSkeletonWith(scroller, footer);

      // `second` shows its top 10px, and `third` is out of view.
      let shapes = getShapes(el);
      expect(shapes).to.have.lengthOf(3);
      expectAligned(shapes[0], first);
      expect(shapes[1].getBoundingClientRect().height).to.be.closeTo(10, 0.5);
      expectAligned(shapes[2], footer);

      scroller.scrollTop = 20;
      await settle(el);

      // `first` shows its bottom 20px, `second` its top 30px.
      shapes = getShapes(el);
      expect(shapes).to.have.lengthOf(3);
      expect(shapes[0].getBoundingClientRect().height).to.be.closeTo(20, 0.5);
      expect(shapes[1].getBoundingClientRect().top).to.be.closeTo(
        second.getBoundingClientRect().top,
        0.5
      );
      expect(shapes[1].getBoundingClientRect().height).to.be.closeTo(30, 0.5);
      expectAligned(shapes[2], footer);
    });

    it('skips elements and text with `visibility: hidden`', async () => {
      const hidden = block(50, 20);
      hidden.style.visibility = 'hidden';
      const container = document.createElement('p');
      container.style.visibility = 'hidden';
      const shown = block(30, 10);
      shown.style.visibility = 'visible';
      container.append(document.createTextNode('Hidden'), shown);
      const el = await createSkeletonWith(hidden, container);

      expect(getShapes(el)).to.have.lengthOf(1);
      expectAligned(firstOf(getShapes(el)), shown);
    });

    it('renders a shape for the text of an element with `display: contents`', async () => {
      const label = document.createElement('span');
      label.style.display = 'contents';
      label.textContent = 'Name';
      const el = await createSkeletonWith(label);

      expect(getShapes(el)).to.have.lengthOf(1);
      expectTextLine(firstOf(getShapes(el)), textRect(label));
    });

    it('updates the shapes when text changes', async () => {
      const text = document.createTextNode('Hi');
      const bold = document.createElement('b');
      bold.textContent = 'B';
      const paragraph = document.createElement('p');
      paragraph.append(text, bold);
      const el = await createSizedSkeleton(
        { width: '300px', height: '100px' },
        paragraph
      );

      text.data = 'Hello there';
      await settle(el);

      expectTextLine(getShapes(el)[1], bold.getBoundingClientRect());
    });

    it('updates the shapes when a web font loads', async () => {
      const bold = document.createElement('b');
      bold.textContent = 'Bold';
      bold.classList.add('skeleton-font');
      const paragraph = document.createElement('p');
      paragraph.append(document.createTextNode('Text '), bold);
      const el = await createSkeletonWith(paragraph);

      await withDocumentStyle(
        '.skeleton-font { letter-spacing: 12px; }',
        async () => {
          document.fonts.dispatchEvent(new Event('loadingdone'));
          await settle(el);
          expectTextLine(getShapes(el)[1], bold.getBoundingClientRect());
        }
      );
    });

    it('takes the radius of a shadow element that covers a leaf', async () => {
      const avatar = shadowBlock(
        '<div style="height: 40px; border-radius: 50%"></div>'
      );
      avatar.style.width = '40px';
      const el = await createSkeletonWith(avatar);

      expect(firstOf(getShapes(el)).style.borderRadius).to.equal('50%');
    });

    it('takes the radius of a rounded clip that a shape fills', async () => {
      const frame = block(40, 40);
      setStyles(frame, { borderRadius: '50%', overflow: 'hidden' });
      frame.append(block(60, 60));
      const el = await createSkeletonWith(frame);

      expect(getShapes(el)).to.have.lengthOf(1);
      expectAligned(firstOf(getShapes(el)), frame);
      expect(firstOf(getShapes(el)).style.borderRadius).to.equal('50%');
    });

    it('takes the radius of a rounded clip that crops a rounded source', async () => {
      const frame = block(40, 40);
      setStyles(frame, { borderRadius: '50%', overflow: 'hidden' });
      const image = block(60, 60);
      image.style.borderRadius = '4px';
      frame.append(image);
      const el = await createSkeletonWith(frame);

      expect(firstOf(getShapes(el)).style.borderRadius).to.equal('50%');
    });

    it('clips the shapes to a scroll container in a shadow tree and follows its scroll', async () => {
      const host = shadowBlock(
        '<div style="height: 30px; overflow: auto"><slot></slot></div>'
      );
      host.append(...blocks(3, 40, 40));
      const el = await createSkeletonWith(host);

      let shapes = getShapes(el);
      expect(shapes).to.have.lengthOf(1);
      expect(shapes[0].getBoundingClientRect().height).to.be.closeTo(30, 0.5);

      const addListener = spy(host.shadowRoot!, 'addEventListener');
      host.shadowRoot!.firstElementChild!.scrollTop = 20;
      await settle(el);

      // The root keeps its listener across measurements.
      expect(addListener.called).to.be.false;

      // The first block shows its bottom 20px, the second its top 10px.
      shapes = getShapes(el);
      expect(shapes).to.have.lengthOf(2);
      expect(shapes[0].getBoundingClientRect().height).to.be.closeTo(20, 0.5);
      expect(shapes[1].getBoundingClientRect().height).to.be.closeTo(10, 0.5);
    });

    it('clips the shapes to an element with paint containment', async () => {
      const box = block(40, 30);
      box.style.contain = 'paint';
      box.append(block(40, 40), block(40, 40));
      const el = await createSkeletonWith(box);

      expect(getShapes(el)).to.have.lengthOf(1);
      expectAligned(firstOf(getShapes(el)), box);
    });

    it('clips the shapes to the padding box of a bordered scroll container', async () => {
      const scroller = block(50, 30);
      setStyles(scroller, { border: '10px solid', overflow: 'hidden' });
      scroller.append(block(100, 100));
      const el = await createSkeletonWith(scroller);

      const { left, top } = scroller.getBoundingClientRect();

      expectAligned(
        firstOf(getShapes(el)),
        new DOMRect(
          left + 10,
          top + 10,
          scroller.clientWidth,
          scroller.clientHeight
        )
      );
    });

    it('does not clip the content of an inline element with hidden overflow', async () => {
      const span = document.createElement('span');
      span.style.overflow = 'hidden';
      const bold = document.createElement('b');
      bold.textContent = 'B';
      span.append(document.createTextNode('Text '), bold);
      const el = await createSkeletonWith(span);

      expect(getShapes(el)).to.have.lengthOf(2);
    });

    it('renders the box of an element whose children have no area', async () => {
      const box = block(50, 20);
      box.append(block(0, 20));
      const el = await createSkeletonWith(box);

      expect(getShapes(el)).to.have.lengthOf(1);
      expectAligned(firstOf(getShapes(el)), box);
    });

    it('skips all but the summary of a closed details element', async () => {
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = 'Summary';
      const label = document.createElement('span');
      label.style.display = 'contents';
      label.textContent = 'Hidden text';
      details.append(
        summary,
        document.createTextNode('Hidden text'),
        block(50, 20),
        label
      );
      const el = await createSkeletonWith(details);

      expect(getShapes(el)).to.have.lengthOf(1);
      expectTextLine(firstOf(getShapes(el)), textRect(summary));
    });

    it('skips text slotted into a shadow element with `content-visibility: hidden`', async () => {
      const host = shadowBlock(
        '<div style="content-visibility: hidden; height: 40px"><slot></slot></div>'
      );
      host.style.width = '50px';
      host.append(document.createTextNode('Hidden text'));
      const el = await createSkeletonWith(host);

      expect(getShapes(el)).to.have.lengthOf(1);
      expectAligned(firstOf(getShapes(el)), host);
    });

    it('renders the box of an element with `content-visibility: hidden`', async () => {
      const box = block(50, 20);
      box.style.contentVisibility = 'hidden';
      box.append(document.createTextNode('Skipped '), block(10, 10));
      const label = block(50, 20);
      label.style.contentVisibility = 'hidden';
      label.textContent = 'Skipped';
      const el = await createSkeletonWith(box, label);

      expect(getShapes(el)).to.have.lengthOf(2);
      expectAligned(getShapes(el)[0], box);
      expectAligned(getShapes(el)[1], label);
    });

    it('aligns the shapes when an ancestor is zoomed', async () => {
      const source = block(50, 20);
      const el = await createZoomedSkeleton({ border: '5px solid' }, source);

      expectAligned(firstOf(getShapes(el)), source);
    });

    it('aligns the shapes when the host scrolls', async () => {
      const sources = blocks(3, 40, 40);
      const el = await createSizedSkeleton(
        { height: '50px', overflow: 'auto' },
        ...sources
      );

      el.scrollTop = 20;
      await settle(el);

      getShapes(el).forEach((shape, i) => expectAligned(shape, sources[i]));
    });
  });

  //#endregion

  //#region Lifecycle

  describe('Lifecycle', () => {
    it('does not observe content changes after a reconnect while not loading', async () => {
      const el = await fixture<IgcSkeletonComponent>(
        html`<igc-skeleton></igc-skeleton>`
      );
      const scheduleMeasure = spyScheduleMeasure(el);
      const container = document.createElement('div');
      el.append(container);
      const parent = el.parentElement!;
      el.remove();
      parent.append(el);
      await elementUpdated(el);

      scheduleMeasure.resetHistory();
      container.append(block(10, 10));
      await settle(el);

      expect(scheduleMeasure.called).to.be.false;
    });

    it('does not reveal when loading ends while disconnected', async () => {
      const el = await createLoadingSkeleton();
      const parent = el.parentElement!;

      el.remove();
      el.loading = false;
      await elementUpdated(el);
      parent.append(el);

      expect(el.matches(':state(revealing)')).to.be.false;
    });

    it('measures after a move in the frame that loading starts', async () => {
      const el = await createIdleSkeleton();
      const parent = el.parentElement!;

      el.loading = true;
      await elementUpdated(el);
      el.remove();
      parent.append(el);
      await settle(el);

      expect(getShapes(el)).to.have.lengthOf(1);
    });

    it('does not measure or listen to font loads while disconnected', async () => {
      const el = await createIdleSkeleton();
      const parent = el.parentElement!;
      const measure = spy(el as unknown as { _measure(): void }, '_measure');

      // Removed before the frame of the measurement.
      el.loading = true;
      await elementUpdated(el);
      el.remove();
      await nextFrame();
      await nextFrame();
      expect(measure.called).to.be.false;

      // Loading starts while removed.
      el.loading = false;
      await elementUpdated(el);
      el.loading = true;
      await elementUpdated(el);
      await nextFrame();
      await nextFrame();
      expect(measure.called).to.be.false;

      parent.append(el);
      await settle(el);
      expect(measure.called).to.be.true;

      el.remove();
      const scheduleMeasure = spyScheduleMeasure(el);
      document.fonts.dispatchEvent(new Event('loadingdone'));
      expect(scheduleMeasure.called).to.be.false;
    });

    it('stops observing resizes and font loads when loading ends', async () => {
      const source = block(50, 20);
      source.classList.add('skeleton-idle');
      const el = await createSkeletonWith(source);
      const scheduleMeasure = spyScheduleMeasure(el);

      el.loading = false;
      await elementUpdated(el);
      scheduleMeasure.resetHistory();

      await withDocumentStyle(
        '.skeleton-idle { width: 120px !important; }',
        async () => {
          document.fonts.dispatchEvent(new Event('loadingdone'));
          await settle(el);
          expect(scheduleMeasure.called).to.be.false;
        }
      );
    });
  });

  //#endregion
});

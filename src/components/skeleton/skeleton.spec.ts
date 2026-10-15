import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';
import {
  restore,
  type SinonFakeTimers,
  type SinonSpy,
  spy,
  useFakeTimers,
} from 'sinon';
import { internalsOf } from '#internals/controllers/internals.js';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import {
  isFocused,
  withDocumentSheets,
} from '#internals/testing/helpers.spec.js';
import { firstOf } from '#internals/utils/arrays.js';
import { setStyles } from '#internals/utils/dom.js';
import IgcSkeletonComponent from './skeleton.js';

describe('Skeleton', () => {
  before(() => defineComponents(IgcSkeletonComponent));
  afterEach(() => restore());

  //#region Helpers

  function getShapes(el: IgcSkeletonComponent): HTMLElement[] {
    return Array.from(
      el.renderRoot.querySelectorAll<HTMLElement>('[part~="shape"]')
    );
  }

  function getOverlay(el: IgcSkeletonComponent): Element | null {
    return el.renderRoot.querySelector('[part="overlay"]');
  }

  function createIdleSkeleton(
    parentNode?: Element
  ): Promise<IgcSkeletonComponent> {
    return fixture<IgcSkeletonComponent>(
      html`<igc-skeleton><span>Content</span></igc-skeleton>`,
      { parentNode }
    );
  }

  /** A loading skeleton with two sized leaves. */
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
    await nextFrame();
    await elementUpdated(el);
    return el;
  }

  /**
   * Waits for a measurement and for the one that new resize targets trigger.
   * The resize observer reports after the first frame, and its measurement
   * runs after the callbacks of the second frame.
   */
  async function settle(el: IgcSkeletonComponent): Promise<void> {
    await nextFrame();
    await nextFrame();
    await nextFrame();
    await elementUpdated(el);
  }

  /** Creates a loading skeleton over `content`, built without a template. */
  function createSkeletonWith(
    ...content: Node[]
  ): Promise<IgcSkeletonComponent> {
    return createSizedSkeleton({}, ...content);
  }

  async function createSizedSkeleton(
    styles: Partial<CSSStyleDeclaration>,
    ...content: Node[]
  ): Promise<IgcSkeletonComponent> {
    const el = await fixture<IgcSkeletonComponent>(
      html`<igc-skeleton loading></igc-skeleton>`
    );
    setStyles(el, styles);
    el.append(...content);
    await settle(el);
    return el;
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

  /** A real `clearTimeout` cannot clear a fake timer. */
  function fakeTimers(): SinonFakeTimers {
    return useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  }

  /** The observers keep the method from the construction, so spy before it. */
  function spyScheduleMeasure(): SinonSpy {
    return spy(
      IgcSkeletonComponent.prototype as unknown as {
        _scheduleMeasure(): void;
      },
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

    expect(a.left).to.be.closeTo(b.left, 0.5);
    expect(a.top).to.be.closeTo(b.top, 0.5);
    expect(a.width).to.be.closeTo(b.width, 0.5);
    expect(a.height).to.be.closeTo(b.height, 0.5);
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

    it('does not reflect `loading` attribute when false', async () => {
      const el = await createIdleSkeleton();

      expect(el).dom.not.to.have.attribute('loading');
    });

    it('overlay is always present in the shadow DOM', async () => {
      const el = await createIdleSkeleton();

      expect(getOverlay(el)).to.exist;
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

    it('renders shape placeholders when set to true', async () => {
      const el = await createLoadingSkeleton();
      expect(getShapes(el)).not.to.be.empty;
    });

    it('removes all shape placeholders when set to false', async () => {
      const el = await createLoadingSkeleton();
      expect(getShapes(el)).not.to.be.empty;

      el.loading = false;
      await elementUpdated(el);

      expect(getShapes(el)).to.be.empty;
    });

    it('sets `revealing` custom state on loading → false transition', async () => {
      const el = await createLoadingSkeleton();

      el.loading = false;
      await elementUpdated(el);

      expect(el.matches(':state(revealing)')).to.be.true;
    });

    it('removes `revealing` custom state after 600ms', async () => {
      const clock = fakeTimers();
      const el = await createLoadingSkeleton();

      el.loading = false;
      await elementUpdated(el);
      expect(el.matches(':state(revealing)')).to.be.true;

      clock.tick(600);
      expect(el.matches(':state(revealing)')).to.be.false;
    });

    it('does not set `revealing` custom state when loading was never true', async () => {
      const el = await createIdleSkeleton();

      el.loading = false;
      await elementUpdated(el);

      expect(el.matches(':state(revealing)')).to.be.false;
    });

    it('cancels pending `revealing` custom state when loading is set back to true', async () => {
      const clock = fakeTimers();
      const el = await createLoadingSkeleton();

      el.loading = false;
      await elementUpdated(el);
      expect(el.matches(':state(revealing)')).to.be.true;

      el.loading = true;
      await elementUpdated(el);

      expect(el.matches(':state(revealing)')).to.be.false;
      expect(clock.countTimers()).to.equal(0);
    });

    it('sets `ariaBusy` from `loading`', async () => {
      const el = await createLoadingSkeleton();
      expect(internalsOf(el)?.getARIA('ariaBusy')).to.equal('true');

      el.loading = false;
      await elementUpdated(el);

      expect(internalsOf(el)?.getARIA('ariaBusy')).to.equal('false');
    });

    it('lets a `::part(overlay)` rule set the overlay opacity', async () => {
      await withDocumentStyle(
        'igc-skeleton::part(overlay) { opacity: 0.8; transition: none; }',
        async () => {
          const el = await createLoadingSkeleton();
          expect(getComputedStyle(getOverlay(el)!).opacity).to.equal('0.8');
        }
      );
    });

    it('ends the `revealing` state at once when loading starts again', async () => {
      const el = await createLoadingSkeleton();

      el.loading = false;
      await elementUpdated(el);
      el.loading = true;
      await elementUpdated(el);

      expect(el.matches(':state(revealing)')).to.be.false;
    });
  });

  //#endregion

  //#region `animation` property

  describe('`animation` property', () => {
    const animations = ['pulse', 'breathe', 'shimmer', 'wave', 'glow'] as const;

    for (const animation of animations) {
      it(`applies \`${animation}\` part to all shapes`, async () => {
        const el = await createLoadingSkeleton(animation);
        const shapes = getShapes(el);

        expect(shapes).not.to.be.empty;
        expect(shapes.every((shape) => shape.part.contains(animation))).to.be
          .true;
      });
    }

    it('updates shape parts when `animation` changes', async () => {
      const el = await createLoadingSkeleton('breathe');
      expect(firstOf(getShapes(el)).part.contains('breathe')).to.be.true;

      el.animation = 'shimmer';
      await elementUpdated(el);

      expect(firstOf(getShapes(el)).part.contains('shimmer')).to.be.true;
      expect(firstOf(getShapes(el)).part.contains('breathe')).to.be.false;
    });

    it('sets `--_wave-delay` on each shape for `wave` animation', async () => {
      const el = await createLoadingSkeleton('wave');
      const shapes = getShapes(el);
      const [firstShape, secondShape] = shapes;

      expect(shapes.length).to.be.at.least(2);

      expect(firstShape.style.getPropertyValue('--_wave-delay')).to.equal('0s');
      expect(secondShape.style.getPropertyValue('--_wave-delay')).to.equal(
        '0.1s'
      );
    });

    it('does not set `--_wave-delay` for non-wave animations', async () => {
      const el = await createLoadingSkeleton('shimmer');
      const shapes = getShapes(el);
      expect(
        shapes.every(
          (shape) => shape.style.getPropertyValue('--_wave-delay') === ''
        )
      ).to.be.true;
    });

    it('staggers the `wave` delay in exact steps', async () => {
      const el = await createSkeletonWith(...blocks(4, 10, 10));
      el.animation = 'wave';
      await elementUpdated(el);

      const shape = getShapes(el)[3];
      expect(shape.style.getPropertyValue('--_wave-delay')).to.equal('0.3s');
    });

    it('restarts the `wave` delay after 10 shapes', async () => {
      const el = await createSkeletonWith(...blocks(11, 10, 10));
      el.animation = 'wave';
      await elementUpdated(el);

      const shapes = getShapes(el);
      expect(shapes[9].style.getPropertyValue('--_wave-delay')).to.equal(
        '0.9s'
      );
      expect(shapes[10].style.getPropertyValue('--_wave-delay')).to.equal('0s');
    });
  });

  //#endregion

  //#region Content projection

  describe('Content projection', () => {
    it('renders slotted content', async () => {
      const el = await fixture<IgcSkeletonComponent>(html`
        <igc-skeleton>
          <span id="projected">Hello</span>
        </igc-skeleton>
      `);

      expect(el.querySelector('#projected')).to.exist;
    });

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

      // "Hello " and <b>. The trailing whitespace gets no shape.
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

      const fallback = getComputedStyle(getOverlay(el)!).borderRadius;

      expect(first.style.borderRadius).to.equal('4px');
      expect(second.style.borderRadius).to.be.empty;
      expect(fallback).not.to.equal('0px');
      expect(getComputedStyle(second).borderRadius).to.equal(fallback);
    });

    it('updates the shapes when content is added', async () => {
      // A fixed size keeps the host resize out of it.
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

      // A document style changes nothing that the mutation observer sees.
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
      // The parent is outside the content, so only the host resize reports it.
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
      shapes.forEach((shape, i) => expectAligned(shape, lines[i]));
    });

    /** Text split into several nodes, as a template renders `#${id}`. */
    function splitText(...parts: string[]): Node[] {
      return parts.flatMap((part, i) => [
        ...(i ? [document.createComment('')] : []),
        document.createTextNode(part),
      ]);
    }

    function uniqueTops(rects: Iterable<DOMRect>): number[] {
      return [...new Set(Array.from(rects, (rect) => Math.round(rect.top)))];
    }

    it('renders one shape for a leaf whose text is split into several nodes', async () => {
      const link = document.createElement('a');
      link.append(...splitText('#', '10480'));
      const el = await createSkeletonWith(link);

      expect(link.getClientRects()).to.have.lengthOf(2);
      expect(getShapes(el)).to.have.lengthOf(1);
      expectAligned(firstOf(getShapes(el)), link.getBoundingClientRect());
    });

    it('renders one shape for each line of a wrapped leaf with split text', async () => {
      const paragraph = document.createElement('p');
      paragraph.style.width = '80px';
      const link = document.createElement('a');
      link.append(...splitText('a link ', 'that wraps ', 'over lines'));
      paragraph.append(link);
      const el = await createSkeletonWith(paragraph);

      const lines = uniqueTops(link.getClientRects());

      expect(lines.length).to.be.greaterThan(1);
      expect(
        uniqueTops(getShapes(el).map((shape) => shape.getBoundingClientRect()))
      ).to.deep.equal(lines);
      expect(getShapes(el)).to.have.lengthOf(lines.length);
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
      expectAligned(getShapes(el)[0], bold);
      expectAligned(getShapes(el)[1], range.getBoundingClientRect());
    });

    it('renders one shape for split text in a right-to-left layout', async () => {
      const paragraph = document.createElement('p');
      paragraph.dir = 'rtl';
      const link = document.createElement('a');
      link.append(...splitText('שלום ', '30', ' עולם'));
      paragraph.append(link);
      const el = await createSkeletonWith(paragraph);

      expect(getShapes(el)).to.have.lengthOf(1);
      expectAligned(firstOf(getShapes(el)), link.getBoundingClientRect());
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

      const range = document.createRange();
      range.selectNodeContents(label);

      expect(getShapes(el)).to.have.lengthOf(1);
      expectAligned(firstOf(getShapes(el)), range.getBoundingClientRect());
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

      expectAligned(getShapes(el)[1], bold);
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
          expectAligned(getShapes(el)[1], bold);
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

    it('takes the radius of a rounded shadow element in a covering wrapper', async () => {
      const avatar = shadowBlock(
        '<div><div style="height: 40px; border-radius: 50%"></div></div>'
      );
      avatar.style.width = '40px';
      const el = await createSkeletonWith(avatar);

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

    it('treats a zero percent radius as square', async () => {
      const source = block(50, 20);
      source.style.borderRadius = '0%';
      const el = await createSkeletonWith(source);

      expect(firstOf(getShapes(el)).style.borderRadius).to.be.empty;
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

      host.shadowRoot!.firstElementChild!.scrollTop = 20;
      await settle(el);

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

      const shape = firstOf(getShapes(el)).getBoundingClientRect();
      const box = scroller.getBoundingClientRect();

      expect(shape.left).to.be.closeTo(box.left + 10, 0.5);
      expect(shape.top).to.be.closeTo(box.top + 10, 0.5);
      expect(shape.width).to.be.closeTo(scroller.clientWidth, 0.5);
      expect(shape.height).to.be.closeTo(scroller.clientHeight, 0.5);
    });

    it('clips only the axes that the overflow clips', async () => {
      const box = block(40, 30);
      box.style.overflowX = 'clip';
      box.append(block(60, 60));
      const el = await createSkeletonWith(box);

      const shape = firstOf(getShapes(el)).getBoundingClientRect();

      expect(shape.width).to.be.closeTo(40, 0.5);
      expect(shape.height).to.be.closeTo(60, 0.5);
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

    it('skips the content of a closed details element', async () => {
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = 'Summary';
      details.append(
        summary,
        document.createTextNode('Hidden text'),
        block(50, 20)
      );
      const el = await createSkeletonWith(details);

      expect(getShapes(el)).to.have.lengthOf(1);
      expectAligned(firstOf(getShapes(el)), summary);
    });

    it('skips the text of a `display: contents` child of a closed details element', async () => {
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = 'Summary';
      const label = document.createElement('span');
      label.style.display = 'contents';
      label.textContent = 'Hidden text';
      details.append(summary, label);
      const el = await createSkeletonWith(details);

      expect(getShapes(el)).to.have.lengthOf(1);
      expectAligned(firstOf(getShapes(el)), summary);
    });

    it('skips text slotted into a shadow element with `content-visibility: hidden`', async () => {
      const host = shadowBlock(
        '<div style="content-visibility: hidden; height: 40px"><slot></slot></div>'
      );
      host.style.width = '50px';
      host.append(document.createTextNode('Hidden text'), block(10, 10));
      const el = await createSkeletonWith(host);

      expect(getShapes(el)).to.have.lengthOf(1);
      expectAligned(firstOf(getShapes(el)), host);
    });

    it('renders the box of an element with `content-visibility: hidden`', async () => {
      const box = block(50, 20);
      box.style.contentVisibility = 'hidden';
      box.append(document.createTextNode('Skipped '), block(10, 10));
      const el = await createSkeletonWith(box);

      expect(getShapes(el)).to.have.lengthOf(1);
      expectAligned(firstOf(getShapes(el)), box);
    });

    it('aligns the shapes when an ancestor is zoomed', async () => {
      const parentNode = document.createElement('div');
      parentNode.style.zoom = '2';
      const el = await fixture<IgcSkeletonComponent>(
        html`<igc-skeleton loading></igc-skeleton>`,
        { parentNode }
      );
      el.style.border = '5px solid';
      const source = block(50, 20);
      el.append(source);
      await settle(el);

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
    it('clears the reveal timer and does not throw on disconnect', async () => {
      const clock = fakeTimers();
      const el = await createLoadingSkeleton();

      el.loading = false;
      await elementUpdated(el);
      expect(el.matches(':state(revealing)')).to.be.true;

      el.remove();

      expect(clock.countTimers()).to.equal(0);
      expect(() => clock.tick(600)).not.to.throw();
    });

    it('does not observe content changes after a reconnect while not loading', async () => {
      const scheduleMeasure = spyScheduleMeasure();
      const el = await fixture<IgcSkeletonComponent>(
        html`<igc-skeleton></igc-skeleton>`
      );
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

    it('ends the `revealing` state on disconnect', async () => {
      const el = await createLoadingSkeleton();
      const parent = el.parentElement!;

      el.loading = false;
      await elementUpdated(el);
      el.remove();
      parent.append(el);

      expect(el.matches(':state(revealing)')).to.be.false;
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

    it('does not measure while disconnected', async () => {
      const el = await createIdleSkeleton();
      const measure = spy(el as unknown as { _measure(): void }, '_measure');

      el.loading = true;
      await elementUpdated(el);
      el.remove();
      await nextFrame();
      await nextFrame();

      expect(measure.called).to.be.false;
    });

    it('stops observing resizes when loading ends', async () => {
      const scheduleMeasure = spyScheduleMeasure();
      const source = block(50, 20);
      source.classList.add('skeleton-idle');
      const el = await createSkeletonWith(source);

      el.loading = false;
      await elementUpdated(el);
      scheduleMeasure.resetHistory();

      await withDocumentStyle(
        '.skeleton-idle { width: 120px !important; }',
        async () => {
          await settle(el);
          expect(scheduleMeasure.called).to.be.false;
        }
      );
    });
  });

  //#endregion
});

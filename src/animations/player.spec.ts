import {
  defineCE,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import { css, LitElement } from 'lit';
import { createRef } from 'lit/directives/ref.js';
import sinon from 'sinon';

import { EaseOut } from './easings.js';
import { addAnimationController, getPrefersReducedMotion } from './player.js';
import { type AnimationReferenceMetadata, animation } from './types.js';

const keyframes = [
  { opacity: 0, transform: 'scale(0.1)' },
  { opacity: 1, transform: 'scale(1)' },
];

const animationOptions = {
  duration: 100,
  easing: EaseOut.Quad,
};

const fade: AnimationReferenceMetadata = animation(keyframes, animationOptions);

describe('Animations Player', () => {
  let tag: string;
  let el: HTMLElement & { player: ReturnType<typeof addAnimationController> };

  before(() => {
    tag = defineCE(
      class extends LitElement {
        public static override styles = css`
          :host {
            display: block;
            height: 300px;
            width: 300px;
            background-color: red;
          }
        `;

        public player = addAnimationController(this);
      }
    );
  });

  beforeEach(async () => {
    const tagName = unsafeStatic(tag);
    el = await fixture(html`<${tagName}></${tagName}>`);
  });

  it('should construct animation reference metadata', () => {
    expect(fade.steps).to.equal(keyframes);
    expect(fade.options).to.equal(animationOptions);
  });

  it('animate an element to completion', async () => {
    const animation = (await el.player.play(fade)) as AnimationPlaybackEvent;

    expect(animation.type).to.equal('finish');
  });

  it('should cancel running animations', async () => {
    const [playbackEvent] = (await Promise.all([
      el.player.play(fade),
      el.player.cancelAll(),
    ])) as AnimationPlaybackEvent[];

    expect(playbackEvent.type).to.equal('cancel');
  });

  it('should error on infinite animations', async () => {
    for (const options of [
      { duration: Number.POSITIVE_INFINITY },
      { duration: 100, iterations: Number.POSITIVE_INFINITY },
    ]) {
      const error = await el.player.play(animation(keyframes, options)).then(
        () => null,
        (err: Error) => err
      );

      expect(error?.message).to.equal(
        'Promise-based animations must be finite.'
      );
    }
  });

  describe('Targets and reduced motion', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('animates an element target instead of the host', async () => {
      const target = document.createElement('div');
      el.append(target);

      const player = addAnimationController(el, target);
      const finished = player.play(fade);

      expect(target.getAnimations()).to.have.lengthOf(1);
      expect(el.getAnimations()).to.be.empty;
      expect((await finished).type).to.equal('finish');
    });

    it('animates the value of a ref, and the host while the ref is empty', async () => {
      const ref = createRef<HTMLElement>();
      const player = addAnimationController(el, ref);

      const onHost = player.play(fade);
      expect(el.getAnimations()).to.have.lengthOf(1);
      await onHost;

      const target = document.createElement('div');
      el.append(target);
      (ref as { value?: HTMLElement }).value = target;

      const onTarget = player.play(fade);
      expect(target.getAnimations()).to.have.lengthOf(1);
      await onTarget;
    });

    it('plays with a zero duration under reduced motion', async () => {
      sinon.stub(window, 'matchMedia').returns({
        matches: true,
      } as MediaQueryList);

      const animate = sinon.spy(el, 'animate');

      expect((await el.player.play(fade)).type).to.equal('finish');
      expect(animate.firstCall.args[1]).to.include({ duration: 0 });
    });

    it('plays with a zero duration when the animation has no options', async () => {
      const animate = sinon.spy(el, 'animate');

      expect((await el.player.play({ steps: keyframes })).type).to.equal(
        'finish'
      );
      expect(animate.firstCall.args[1]).to.eql({ duration: 0 });
    });

    it('reports no reduced motion without `matchMedia`', () => {
      sinon.stub(window, 'matchMedia').value(undefined);
      expect(getPrefersReducedMotion()).to.be.false;
    });
  });
});

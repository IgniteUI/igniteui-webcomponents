import {
  defineCE,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import { css, LitElement } from 'lit';

import { EaseOut } from './easings.js';
import { addAnimationController } from './player.js';
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
      el.player.stopAll(),
    ])) as AnimationPlaybackEvent[];

    expect(playbackEvent.type).to.equal('cancel');
  });

  it('should error on infinite animations', async () => {
    el.player
      .play(animation(keyframes, { duration: Number.POSITIVE_INFINITY }))
      .then(() => {})
      .catch((err) => {
        expect(err.message).to.equal(
          'Promise-based animations must be finite.'
        );
      });
  });
});

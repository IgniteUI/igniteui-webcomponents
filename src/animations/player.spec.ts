import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit';

import { EaseOut } from './easings.js';
import { AnimationPlayer } from './player.js';
import { AnimationReferenceMetadata, animation } from './types.js';

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
  let el: HTMLElement;
  let animationPlayer: AnimationPlayer;

  beforeEach(async () => {
    el = await fixture<HTMLElement>(
      html`<div style="width: 300px; height: 300px; background: red;"></div>`
    );
    animationPlayer = new AnimationPlayer(el);
  });

  it('should construct animation reference metadata', () => {
    expect(fade.steps).to.equal(keyframes);
    expect(fade.options).to.equal(animationOptions);
  });

  it('animate an element to completion', async () => {
    const animation = (await animationPlayer.play(
      fade
    )) as AnimationPlaybackEvent;

    expect(animation.type).to.equal('finish');
  });

  it('should cancel running animations', async () => {
    const [playbackEvent] = (await Promise.all([
      animationPlayer.play(fade),
      animationPlayer.stopAll(),
    ])) as AnimationPlaybackEvent[];

    expect(playbackEvent.type).to.equal('cancel');
  });
});

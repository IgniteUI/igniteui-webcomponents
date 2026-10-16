import { spy } from 'sinon';
import type { SpeechToTextProviderListener } from './types.js';

/** A provider listener with a sinon spy for each callback. */
export function createListener() {
  return {
    onStart: spy(),
    onResult: spy(),
    onError: spy(),
    onEnd: spy(),
    onActivity: spy(),
  } satisfies SpeechToTextProviderListener;
}

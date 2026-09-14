import { spy } from 'sinon';
import type { SpeechToTextProviderListener } from './types.js';

/** A provider listener whose callbacks are all sinon spies. */
export function createListener() {
  return {
    onStart: spy(),
    onResult: spy(),
    onError: spy(),
    onEnd: spy(),
    onActivity: spy(),
  } satisfies SpeechToTextProviderListener;
}

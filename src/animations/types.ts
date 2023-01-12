export interface AnimationReferenceMetadata {
  steps: Keyframe[];
  options?: KeyframeAnimationOptions;
}

export function animation(
  steps: Keyframe[],
  options?: KeyframeAnimationOptions
): AnimationReferenceMetadata {
  return {
    steps,
    options,
  };
}

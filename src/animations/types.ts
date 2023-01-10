export interface AnimationReferenceMetadata {
  steps: Keyframe[];
  options: KeyframeAnimationOptions | null;
}

export function animation(
  steps: Keyframe[],
  options: KeyframeAnimationOptions | null
): AnimationReferenceMetadata {
  return {
    steps,
    options,
  };
}

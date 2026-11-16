// Only the curves in use: a bundle keeps every property of an object.
const EaseOut = {
  Quad: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
  Sine: 'cubic-bezier(0.390, 0.575, 0.565, 1.000)',
} as const;

const EaseInOut = {
  Quad: 'cubic-bezier(0.455, 0.030, 0.515, 0.955)',
} as const;

export { EaseInOut, EaseOut };

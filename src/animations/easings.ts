const EaseOut = {
  Quad: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
  Cubic: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
  Quart: 'cubic-bezier(0.165, 0.840, 0.440, 1.000)',
  Quint: 'cubic-bezier(0.230, 1.000, 0.320, 1.000)',
  Sine: 'cubic-bezier(0.390, 0.575, 0.565, 1.000)',
  Expo: 'cubic-bezier(0.190, 1.000, 0.220, 1.000)',
  Circ: 'cubic-bezier(0.075, 0.820, 0.165, 1.000)',
  Back: 'cubic-bezier(0.175, 0.885, 0.320, 1.275)',
} as const;

const EaseInOut = {
  Quad: 'cubic-bezier(0.455, 0.030, 0.515, 0.955)',
  Cubic: 'cubic-bezier(0.645, 0.045, 0.355, 1.000)',
  Quart: 'cubic-bezier(0.770, 0.000, 0.175, 1.000)',
  Quint: 'cubic-bezier(0.860, 0.000, 0.070, 1.000)',
  Sine: 'cubic-bezier(0.445, 0.050, 0.550, 0.950)',
  Expo: 'cubic-bezier(1.000, 0.000, 0.000, 1.000)',
  Circ: 'cubic-bezier(0.785, 0.135, 0.150, 0.860)',
  Back: 'cubic-bezier(0.680, -0.550, 0.265, 1.550)',
} as const;

export { EaseInOut, EaseOut };

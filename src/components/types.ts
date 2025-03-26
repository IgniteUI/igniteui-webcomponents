export type StyleVariant =
  | 'primary'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger';

// NOTE: use default value as first in order where possible for union types

export type SelectionRangeDirection = 'none' | 'backward' | 'forward';
export type RangeTextSelectMode = 'preserve' | 'select' | 'start' | 'end';

export type TileManagerDragMode = 'none' | 'tile-header' | 'tile';
export type TileManagerResizeMode = 'none' | 'hover' | 'always';

export type AvatarShape = 'square' | 'circle' | 'rounded';
export type BadgeShape = 'rounded' | 'square';

export type ButtonVariant = 'contained' | 'flat' | 'outlined' | 'fab';
export type IconButtonVariant = 'contained' | 'flat' | 'outlined';

export type ButtonGroupAlignment = 'horizontal' | 'vertical';
export type ButtonGroupSelection = 'single' | 'single-required' | 'multiple';

export type StepperOrientation = 'horizontal' | 'vertical';
export type StepperStepType = 'full' | 'indicator' | 'title';
export type StepperVerticalAnimation = 'grow' | 'fade' | 'none';
export type StepperHorizontalAnimation = 'slide' | 'fade' | 'none';
export type StepperTitlePosition = 'bottom' | 'top' | 'end' | 'start';

export type TickLabelRotation = 0 | 90 | -90;

export type Orientation = 'vertical' | 'horizontal';

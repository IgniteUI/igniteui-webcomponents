// Public API types
// NOTE: use default value as first in order where possible for union types

//#region shared types
export type AbsolutePosition = 'bottom' | 'middle' | 'top';
export type ContentOrientation = 'horizontal' | 'vertical';
export type HorizontalTransitionAnimation = 'slide' | 'fade' | 'none';
export type PickerMode = 'dropdown' | 'dialog';
export type PopoverScrollStrategy = 'scroll' | 'block' | 'close';
export type RangeTextSelectMode = 'preserve' | 'select' | 'start' | 'end';
export type SelectionRangeDirection = 'none' | 'backward' | 'forward';
export type StyleVariant =
  | 'primary'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger';
export type ToggleLabelPosition = 'after' | 'before';
export type TreeSelection = 'none' | 'multiple' | 'cascade';
//#endregion

//#region component-specific
export type AvatarShape = 'square' | 'circle' | 'rounded';
export type BadgeShape = 'rounded' | 'square';
export type ButtonGroupSelection = 'single' | 'single-required' | 'multiple';
export type ButtonVariant = 'contained' | 'flat' | 'outlined' | 'fab';
export type CarouselIndicatorsOrientation = 'end' | 'start';
export type DividerType = 'solid' | 'dashed';
export type ExpansionPanelIndicatorPosition = 'start' | 'end' | 'none';
export type IconButtonVariant = 'contained' | 'flat' | 'outlined';
export type InputType =
  | 'email'
  | 'number'
  | 'password'
  | 'search'
  | 'tel'
  | 'text'
  | 'url';
export type LinearProgressLabelAlign =
  | 'top-start'
  | 'top'
  | 'top-end'
  | 'bottom-start'
  | 'bottom'
  | 'bottom-end';
export type MaskInputValueMode = 'raw' | 'withFormatting';
export type NavDrawerPosition = 'start' | 'end' | 'top' | 'bottom' | 'relative';
export type SliderTickLabelRotation = 0 | 90 | -90;
export type SliderTickOrientation = 'end' | 'mirror' | 'start';
export type StepperOrientation = 'horizontal' | 'vertical';
export type StepperStepType = 'full' | 'indicator' | 'title';
export type StepperTitlePosition = 'auto' | 'bottom' | 'top' | 'end' | 'start';
export type StepperVerticalAnimation = 'grow' | 'fade' | 'none';
export type TabsActivation = 'auto' | 'manual';
export type TabsAlignment = 'start' | 'end' | 'center' | 'justify';
export type TextareaResize = 'vertical' | 'auto' | 'none';
export type TileManagerDragMode = 'none' | 'tile-header' | 'tile';
export type TileManagerResizeMode = 'none' | 'hover' | 'always';
//#endregion

// Public API types
// NOTE: use default value as first in order where possible for union types

//#region shared types
/**
 * Vertical position of a notification component (toast, snackbar)
 * within its positioning context. See {@link NotificationPositioning} for what
 * that context is.
 *
 * - `bottom` — aligned to the bottom edge.
 * - `middle` — centered vertically.
 * - `top` — aligned to the top edge.
 */
export type AbsolutePosition = 'bottom' | 'middle' | 'top';

/**
 * Layout direction of a component's content, such as the buttons of a group,
 * the radios of a radio group, or the months of a multi-month calendar.
 *
 * - `horizontal` — items laid out side by side.
 * - `vertical` — items stacked top to bottom.
 */
export type ContentOrientation = 'horizontal' | 'vertical';

/**
 * Transition between horizontally arranged panes, such as carousel slides or
 * the steps of a horizontal stepper.
 *
 * - `slide` — the new pane slides in while the old one slides out.
 * - `fade` — the new pane fades in while the old one fades out.
 * - `none` — the panes switch without animation.
 */
export type HorizontalTransitionAnimation = 'slide' | 'fade' | 'none';

/**
 * Element a notification component (toast, snackbar) is positioned
 * relative to.
 *
 * - `viewport` — the viewport; ancestor elements are ignored.
 * - `container` — the nearest visible ancestor; the component is constrained to
 *   that ancestor's bounding box.
 */
export type NotificationPositioning = 'viewport' | 'container';

/**
 * How a date picker shows its calendar.
 *
 * - `dropdown` — in a popover anchored to the input.
 * - `dialog` — in a modal dialog.
 */
export type PickerMode = 'dropdown' | 'dialog';

/**
 * What an open popover (dropdown, select list) does when the document scrolls.
 *
 * - `scroll` — stays open and moves with its anchor.
 * - `block` — stays open and prevents the scroll.
 * - `close` — closes.
 */
export type PopoverScrollStrategy = 'scroll' | 'block' | 'close';

export type RangeTextSelectMode = 'preserve' | 'select' | 'start' | 'end';
export type SelectionRangeDirection = 'none' | 'backward' | 'forward';

/**
 * Semantic color of a component such as a badge, chip, or a
 * progress indicator. The actual colors come from the active theme.
 *
 * - `primary` — the theme's primary color.
 * - `info` — informational.
 * - `success` — success or completion.
 * - `warning` — warning.
 * - `danger` — error or destructive action.
 */
export type StyleVariant =
  | 'primary'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger';

/**
 * Placement of the label of a checkbox, switch, or radio
 * relative to its control.
 *
 * - `after` — label after the control.
 * - `before` — label before the control.
 */
export type ToggleLabelPosition = 'after' | 'before';

/**
 * Selection mode of a tree.
 *
 * - `none` — items cannot be selected.
 * - `multiple` — any number of items can be selected, independently of each
 *   other.
 * - `cascade` — selecting an item selects all of its descendants; a parent with
 *   a partially selected subtree shows an indeterminate state.
 */
export type TreeSelection = 'none' | 'multiple' | 'cascade';
//#endregion

//#region component-specific
/**
 * Shape of an avatar.
 *
 * - `square` — square with sharp corners.
 * - `circle` — circular.
 * - `rounded` — square with rounded corners.
 */
export type AvatarShape = 'square' | 'circle' | 'rounded';

/**
 * Shape of a badge.
 *
 * - `rounded` — circular or pill shape.
 * - `square` — square shape with rounded corners.
 */
export type BadgeShape = 'rounded' | 'square';

/**
 * Selection mode of a button group.
 *
 * - `single` — at most one button is selected; clicking the selected button
 *   deselects it.
 * - `single-required` — exactly one button stays selected; clicking the
 *   selected button leaves it selected.
 * - `multiple` — any number of buttons can be selected.
 */
export type ButtonGroupSelection = 'single' | 'single-required' | 'multiple';

/**
 * Visual style of a button.
 *
 * - `contained` — filled background; highest visual emphasis.
 * - `flat` — no background or border; lowest visual emphasis.
 * - `outlined` — transparent background with a visible border.
 * - `fab` — floating action button, typically used for a screen's primary
 *   action.
 */
export type ButtonVariant = 'contained' | 'flat' | 'outlined' | 'fab';

/**
 * Placement of the slide indicators (dots) of a carousel.
 *
 * - `end` — after the slides: below them in a horizontal carousel, at the
 *   inline end (right in left-to-right layouts) in a vertical one.
 * - `start` — before the slides: above them in a horizontal carousel, at the
 *   inline start (left in left-to-right layouts) in a vertical one.
 */
export type CarouselIndicatorsOrientation = 'end' | 'start';

/**
 * Notation of a color picker's string value.
 *
 * - `hex` — `#rrggbb`.
 * - `rgb` — `rgb(r g b)`.
 * - `hsl` — `hsl(h s% l%)`.
 */
export type ColorFormat = 'hex' | 'rgb' | 'hsl';

/**
 * How a color picker presents the anchor that opens it.
 *
 * - `default` — a trigger button.
 * - `input` — an editable text field with a color swatch prefix that also
 *   opens the picker.
 */
export type ColorPickerMode = 'default' | 'input';

/* jsonAPIPlainObject */
export type DateRangeValue = { start: Date | null; end: Date | null };

/**
 * Line style of a divider.
 *
 * - `solid` — a continuous line.
 * - `dashed` — a dashed line.
 */
export type DividerType = 'solid' | 'dashed';

/**
 * Placement of the expand/collapse indicator in an expansion panel
 * header.
 *
 * - `start` — before the header content.
 * - `end` — after the header content.
 * - `none` — no indicator is rendered.
 */
export type ExpansionPanelIndicatorPosition = 'start' | 'end' | 'none';

/**
 * Visual style of an icon button.
 *
 * - `contained` — filled background; highest visual emphasis.
 * - `flat` — no background or border; lowest visual emphasis.
 * - `outlined` — transparent background with a visible border.
 */
export type IconButtonVariant = 'contained' | 'flat' | 'outlined';

/**
 * Type of the native input rendered by an input. Mirrors the HTML input
 * `type` attribute and affects validation and the virtual keyboard shown on
 * touch devices.
 *
 * - `text` — plain single-line text.
 * - `email` — an email address.
 * - `number` — a number.
 * - `password` — masked text.
 * - `search` — a search string.
 * - `tel` — a telephone number.
 * - `url` — a URL.
 */
export type InputType =
  | 'text'
  | 'email'
  | 'number'
  | 'password'
  | 'search'
  | 'tel'
  | 'url';

/**
 * Placement of the value label of a linear progress indicator relative to its
 * bar.
 *
 * - `top-start` — above the bar, aligned to the start.
 * - `top` — above the bar, centered.
 * - `top-end` — above the bar, aligned to the end.
 * - `bottom-start` — below the bar, aligned to the start.
 * - `bottom` — below the bar, centered.
 * - `bottom-end` — below the bar, aligned to the end.
 */
export type LinearProgressLabelAlign =
  | 'top-start'
  | 'top'
  | 'top-end'
  | 'bottom-start'
  | 'bottom'
  | 'bottom-end';

/**
 * Format in which a mask input exposes its value.
 *
 * - `raw` — returns clean input, e.g.  `"5551234567"`.
 * - `withFormatting` — returns with mask formatting, e.g. `"(555) 123-4567"`.
 */
export type MaskInputValueMode = 'raw' | 'withFormatting';

/**
 * Edge of the viewport a navigation drawer is anchored to.
 *
 * - `start` — the inline-start edge (left in left-to-right layouts).
 * - `end` — the inline-end edge (right in left-to-right layouts).
 * - `top` — the top edge.
 * - `bottom` — the bottom edge.
 * - `relative` — not anchored; the drawer is rendered inline in the page flow
 *   without a modal backdrop.
 */
export type NavDrawerPosition = 'start' | 'end' | 'top' | 'bottom' | 'relative';

/**
 * Rotation of the tick labels of a slider, in degrees.
 *
 * - `0` — horizontal labels.
 * - `90` — labels rotated 90 degrees clockwise.
 * - `-90` — labels rotated 90 degrees counterclockwise.
 */
export type SliderTickLabelRotation = 0 | 90 | -90;

/**
 * Side of the slider track on which ticks are drawn.
 *
 * - `end` — below the track.
 * - `mirror` — on both sides of the track.
 * - `start` — above the track.
 */
export type SliderTickOrientation = 'end' | 'mirror' | 'start';

/**
 * Arrangement of the panes of a splitter, which also sets the resize
 * direction.
 *
 * - `horizontal` — panes side by side, resized horizontally.
 * - `vertical` — panes stacked, resized vertically.
 */
export type SplitterOrientation = 'horizontal' | 'vertical';

/**
 * Arrangement of the steps of a stepper.
 *
 * - `horizontal` — steps in a row; the active step's content is shown below the
 *   step headers.
 * - `vertical` — steps in a column; each step's content is shown under its own
 *   header.
 */
export type StepperOrientation = 'horizontal' | 'vertical';

/**
 * Which parts of a step header a stepper renders.
 *
 * - `full` — indicator together with title and subtitle.
 * - `indicator` — indicator only.
 * - `title` — title and subtitle only.
 */
export type StepperStepType = 'full' | 'indicator' | 'title';

/**
 * Placement of a step's title relative to its indicator in a stepper.
 *
 * - `auto` — below the indicator in a horizontal stepper, after it in a
 *   vertical one.
 * - `bottom` — below the indicator.
 * - `top` — above the indicator.
 * - `end` — after the indicator.
 * - `start` — before the indicator.
 */
export type StepperTitlePosition = 'auto' | 'bottom' | 'top' | 'end' | 'start';

/**
 * Transition of step content in a vertical stepper.
 *
 * - `grow` — the content expands and collapses vertically.
 * - `fade` — the content fades in and out.
 * - `none` — the content switches without animation.
 */
export type StepperVerticalAnimation = 'grow' | 'fade' | 'none';

/**
 * How keyboard navigation between tab headers selects a tab.
 *
 * - `auto` — the focused tab is selected immediately and its panel shown.
 * - `manual` — navigation only moves focus; Space or Enter selects the focused
 *   tab.
 */
export type TabsActivation = 'auto' | 'manual';

/**
 * Alignment of the tab headers within the header strip of a tabs component.
 *
 * - `start` — packed at the start.
 * - `end` — packed at the end.
 * - `center` — packed in the center.
 * - `justify` — stretched to fill the available width equally.
 */
export type TabsAlignment = 'start' | 'end' | 'center' | 'justify';

/**
 * How the height of a textarea can change.
 *
 * - `vertical` — the user can drag the resize handle to change the height.
 * - `auto` — the height grows and shrinks to fit the content.
 * - `none` — fixed height.
 */
export type TextareaResize = 'vertical' | 'auto' | 'none';

/**
 * Which part of a tile starts a drag-and-drop reorder in a tile manager.
 *
 * - `none` — tiles cannot be dragged.
 * - `tile-header` — only the tile header starts a drag.
 * - `tile` — the whole tile starts a drag.
 */
export type TileManagerDragMode = 'none' | 'tile-header' | 'tile';

/**
 * When the resize handles of the tiles in a tile manager are shown.
 *
 * - `none` — tiles cannot be resized.
 * - `hover` — handles appear when the pointer is over a tile.
 * - `always` — handles are always visible.
 */
export type TileManagerResizeMode = 'none' | 'hover' | 'always';
//#endregion

import IgcAccordionComponent from '../../accordion/accordion.js';
import IgcAvatarComponent from '../../avatar/avatar.js';
import IgcBadgeComponent from '../../badge/badge.js';
import IgcBannerComponent from '../../banner/banner.js';
import IgcButtonGroupComponent from '../../button-group/button-group.js';
import IgcToggleButtonComponent from '../../button-group/toggle-button.js';
import IgcButtonComponent from '../../button/button.js';
import IgcIconButtonComponent from '../../button/icon-button.js';
import IgcCalendarComponent from '../../calendar/calendar.js';
import IgcCardActionsComponent from '../../card/card.actions.js';
import IgcCardContentComponent from '../../card/card.content.js';
import IgcCardHeaderComponent from '../../card/card.header.js';
import IgcCardComponent from '../../card/card.js';
import IgcCardMediaComponent from '../../card/card.media.js';
import IgcCarouselIndicatorComponent from '../../carousel/carousel-indicator.js';
import IgcCarouselSlideComponent from '../../carousel/carousel-slide.js';
import IgcCarouselComponent from '../../carousel/carousel.js';
import IgcChatComponent from '../../chat/chat.js';
import IgcCheckboxComponent from '../../checkbox/checkbox.js';
import IgcSwitchComponent from '../../checkbox/switch.js';
import IgcChipComponent from '../../chip/chip.js';
import IgcComboComponent from '../../combo/combo.js';
import IgcDatePickerComponent from '../../date-picker/date-picker.js';
import IgcDateTimeInputComponent from '../../date-time-input/date-time-input.js';
import IgcDialogComponent from '../../dialog/dialog.js';
import IgcDividerComponent from '../../divider/divider.js';
import IgcDropdownGroupComponent from '../../dropdown/dropdown-group.js';
import IgcDropdownHeaderComponent from '../../dropdown/dropdown-header.js';
import IgcDropdownItemComponent from '../../dropdown/dropdown-item.js';
import IgcDropdownComponent from '../../dropdown/dropdown.js';
import IgcExpansionPanelComponent from '../../expansion-panel/expansion-panel.js';
import IgcIconComponent from '../../icon/icon.js';
import IgcInputComponent from '../../input/input.js';
import IgcListHeaderComponent from '../../list/list-header.js';
import IgcListItemComponent from '../../list/list-item.js';
import IgcListComponent from '../../list/list.js';
import IgcMaskInputComponent from '../../mask-input/mask-input.js';
import IgcNavDrawerHeaderItemComponent from '../../nav-drawer/nav-drawer-header-item.js';
import IgcNavDrawerItemComponent from '../../nav-drawer/nav-drawer-item.js';
import IgcNavDrawerComponent from '../../nav-drawer/nav-drawer.js';
import IgcNavbarComponent from '../../navbar/navbar.js';
import IgcCircularGradientComponent from '../../progress/circular-gradient.js';
import IgcCircularProgressComponent from '../../progress/circular-progress.js';
import IgcLinearProgressComponent from '../../progress/linear-progress.js';
import IgcRadioGroupComponent from '../../radio-group/radio-group.js';
import IgcRadioComponent from '../../radio/radio.js';
import IgcRatingSymbolComponent from '../../rating/rating-symbol.js';
import IgcRatingComponent from '../../rating/rating.js';
import IgcRippleComponent from '../../ripple/ripple.js';
import IgcSelectGroupComponent from '../../select/select-group.js';
import IgcSelectHeaderComponent from '../../select/select-header.js';
import IgcSelectItemComponent from '../../select/select-item.js';
import IgcSelectComponent from '../../select/select.js';
import IgcRangeSliderComponent from '../../slider/range-slider.js';
import IgcSliderLabelComponent from '../../slider/slider-label.js';
import IgcSliderComponent from '../../slider/slider.js';
import IgcSnackbarComponent from '../../snackbar/snackbar.js';
import IgcStepComponent from '../../stepper/step.js';
import IgcStepperComponent from '../../stepper/stepper.js';
import IgcTabComponent from '../../tabs/tab.js';
import IgcTabsComponent from '../../tabs/tabs.js';
import IgcTextareaComponent from '../../textarea/textarea.js';
import IgcTileManagerComponent from '../../tile-manager/tile-manager.js';
import IgcTileComponent from '../../tile-manager/tile.js';
import IgcToastComponent from '../../toast/toast.js';
import IgcTooltipComponent from '../../tooltip/tooltip.js';
import IgcTreeItemComponent from '../../tree/tree-item.js';
import IgcTreeComponent from '../../tree/tree.js';
import { defineComponents } from './defineComponents.js';
import type { IgniteComponent } from './register.js';

const allComponents: IgniteComponent[] = [
  IgcAvatarComponent,
  IgcAccordionComponent,
  IgcBadgeComponent,
  IgcBannerComponent,
  IgcButtonComponent,
  IgcIconButtonComponent,
  IgcToggleButtonComponent,
  IgcButtonGroupComponent,
  IgcCalendarComponent,
  IgcCardActionsComponent,
  IgcCardContentComponent,
  IgcCardHeaderComponent,
  IgcCardMediaComponent,
  IgcCardComponent,
  IgcCarouselComponent,
  IgcCarouselIndicatorComponent,
  IgcCarouselSlideComponent,
  IgcChatComponent,
  IgcCheckboxComponent,
  IgcChipComponent,
  IgcComboComponent,
  IgcDatePickerComponent,
  IgcDropdownComponent,
  IgcDropdownGroupComponent,
  IgcDropdownHeaderComponent,
  IgcDropdownItemComponent,
  IgcDialogComponent,
  IgcDividerComponent,
  IgcSwitchComponent,
  IgcExpansionPanelComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcListHeaderComponent,
  IgcListItemComponent,
  IgcListComponent,
  IgcMaskInputComponent,
  IgcNavDrawerHeaderItemComponent,
  IgcNavDrawerItemComponent,
  IgcNavDrawerComponent,
  IgcNavbarComponent,
  IgcRadioComponent,
  IgcRadioGroupComponent,
  IgcRatingComponent,
  IgcRatingSymbolComponent,
  IgcRippleComponent,
  IgcSelectGroupComponent,
  IgcSelectHeaderComponent,
  IgcSelectItemComponent,
  IgcSelectComponent,
  IgcTreeComponent,
  IgcTreeItemComponent,
  IgcSliderComponent,
  IgcToastComponent,
  IgcSliderLabelComponent,
  IgcRangeSliderComponent,
  IgcTabsComponent,
  IgcTabComponent,
  IgcCircularProgressComponent,
  IgcLinearProgressComponent,
  IgcCircularGradientComponent,
  IgcSnackbarComponent,
  IgcDateTimeInputComponent,
  IgcStepperComponent,
  IgcStepComponent,
  IgcTextareaComponent,
  IgcTileComponent,
  IgcTileManagerComponent,
  IgcTooltipComponent,
];

export function defineAllComponents() {
  defineComponents(...allComponents);
}

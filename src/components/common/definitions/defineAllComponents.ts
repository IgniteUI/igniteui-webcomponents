import IgcAvatarComponent from '../../avatar/avatar.js';
import IgcAccordionComponent from '../../accordion/accordion.js';
import IgcBadgeComponent from '../../badge/badge.js';
import IgcButtonComponent from '../../button/button.js';
import IgcIconButtonComponent from '../../button/icon-button.js';
import IgcCalendarComponent from '../../calendar/calendar.js';
import IgcCardComponent from '../../card/card.js';
import IgcCardActionsComponent from '../../card/card.actions.js';
import IgcCardContentComponent from '../../card/card.content.js';
import IgcCardHeaderComponent from '../../card/card.header.js';
import IgcCardMediaComponent from '../../card/card.media.js';
import IgcCheckboxComponent from '../../checkbox/checkbox.js';
import IgcChipComponent from '../../chip/chip.js';
import IgcCircularProgressComponent from '../../progress/circular-progress.js';
import IgcComboComponent from '../../combo/combo.js';
import IgcDropdownComponent from '../../dropdown/dropdown.js';
import IgcDropdownGroupComponent from '../../dropdown/dropdown-group.js';
import IgcDropdownHeaderComponent from '../../dropdown/dropdown-header.js';
import IgcDropdownItemComponent from '../../dropdown/dropdown-item.js';
import IgcSwitchComponent from '../../checkbox/switch.js';
import IgcFormComponent from '../../form/form.js';
import IgcIconComponent from '../../icon/icon.js';
import IgcInputComponent from '../../input/input.js';
import IgcLinearProgressComponent from '../../progress/linear-progress.js';
import IgcListComponent from '../../list/list.js';
import IgcListHeaderComponent from '../../list/list-header.js';
import IgcListItemComponent from '../../list/list-item.js';
import IgcNavDrawerComponent from '../../nav-drawer/nav-drawer.js';
import IgcNavDrawerHeaderItemComponent from '../../nav-drawer/nav-drawer-header-item.js';
import IgcNavDrawerItemComponent from '../../nav-drawer/nav-drawer-item.js';
import IgcNavbarComponent from '../../navbar/navbar.js';
import IgcRadioGroupComponent from '../../radio-group/radio-group.js';
import IgcRadioComponent from '../../radio/radio.js';
import IgcRatingComponent from '../../rating/rating.js';
import IgcRatingSymbolComponent from '../../rating/rating-symbol.js';
import IgcRippleComponent from '../../ripple/ripple.js';
import IgcRangeSliderComponent from '../../slider/range-slider.js';
import IgcSliderComponent from '../../slider/slider.js';
import IgcSnackbarComponent from '../../snackbar/snackbar.js';
import IgcToastComponent from '../../toast/toast.js';
import IgcSliderLabelComponent from '../../slider/slider-label.js';
import IgcTabsComponent from '../../tabs/tabs.js';
import IgcTabComponent from '../../tabs/tab.js';
import IgcTabPanelComponent from '../../tabs/tab-panel.js';
import { defineComponents } from './defineComponents.js';
import IgcCircularGradientComponent from '../../progress/circular-gradient.js';
import IgcDateTimeInputComponent from '../../date-time-input/date-time-input.js';
import IgcMaskInputComponent from '../../mask-input/mask-input.js';
import IgcExpansionPanelComponent from '../../expansion-panel/expansion-panel.js';
import IgcTreeComponent from '../../tree/tree.js';
import IgcTreeItemComponent from '../../tree/tree-item.js';
import IgcStepperComponent from '../../stepper/stepper.js';
import IgcStepComponent from '../../stepper/step.js';
import IgcDialogComponent from '../../dialog/dialog.js';
import IgcSelectComponent from '../../select/select.js';
import IgcSelectGroupComponent from '../../select/select-group.js';
import IgcSelectHeaderComponent from '../../select/select-header.js';
import IgcSelectItemComponent from '../../select/select-item.js';

const allComponents: CustomElementConstructor[] = [
  IgcAvatarComponent,
  IgcAccordionComponent,
  IgcBadgeComponent,
  IgcButtonComponent,
  IgcIconButtonComponent,
  IgcCalendarComponent,
  IgcCardActionsComponent,
  IgcCardContentComponent,
  IgcCardHeaderComponent,
  IgcCardMediaComponent,
  IgcCardComponent,
  IgcCheckboxComponent,
  IgcChipComponent,
  IgcComboComponent,
  IgcDropdownComponent,
  IgcDropdownGroupComponent,
  IgcDropdownHeaderComponent,
  IgcDropdownItemComponent,
  IgcDialogComponent,
  IgcSwitchComponent,
  IgcExpansionPanelComponent,
  IgcFormComponent,
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
  IgcTabPanelComponent,
  IgcCircularProgressComponent,
  IgcLinearProgressComponent,
  IgcCircularGradientComponent,
  IgcSnackbarComponent,
  IgcDateTimeInputComponent,
  IgcStepperComponent,
  IgcStepComponent,
];

export const defineAllComponents = () => {
  defineComponents(...allComponents);
};

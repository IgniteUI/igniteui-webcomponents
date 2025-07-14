# Ignite UI Web Components Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [6.1.2] - 2025-07-14
### Added
- #### File input
  - Exposed CSS variables for styling most of the Shadow DOM parts [#1747](https://github.com/IgniteUI/igniteui-webcomponents/pull/1747)

### Fixed
- #### Calendar
  - Vertical mode container paddings [#1775](https://github.com/IgniteUI/igniteui-webcomponents/pull/1775)
- #### Carousel
  - Pause automatic rotation on pointer-initiated focus [#1731](https://github.com/IgniteUI/igniteui-webcomponents/issues/1731)
  - Ensure `igcSlideChanged` event is emitted when a slide is changed [#1772](https://github.com/IgniteUI/igniteui-webcomponents/issues/1772)
- #### Date picker
  - Styling issues [#1765](https://github.com/IgniteUI/igniteui-webcomponents/pull/1765)
- #### Date range picker
  - CSS borders and elevation [#1764](https://github.com/IgniteUI/igniteui-webcomponents/pull/1764)
- #### File input
  - Bootstrap invalid box-shadow styles [#1747](https://github.com/IgniteUI/igniteui-webcomponents/pull/1747)
- #### Stepper
  - Error when setting linear property in deferred rendering scenarios [#1672](https://github.com/IgniteUI/igniteui-webcomponents/pull/1672)
- #### Textarea
  - Readonly state styles [#1768](https://github.com/IgniteUI/igniteui-webcomponents/pull/1768)

## [6.1.1] - 2025-06-25
### Fixed
- #### Dropdown
  - Icon size in Bootstrap theme [#1755](https://github.com/IgniteUI/igniteui-webcomponents/pull/1755)
- #### Input, File Input
  - Label positioning and transition logic in Material theme [#1739](https://github.com/IgniteUI/igniteui-webcomponents/pull/1739) [#1753](https://github.com/IgniteUI/igniteui-webcomponents/pull/1753)

## [6.1.0] - 2025-06-12
### Added
- Date Range Picker

### Changed
- Updated the readonly styles of most form associated components across all themes to better signify when a component
  is in a readonly state.
- #### File input
  - **Breaking change**: `igcChange` & `igcCancel` events detail now returns the underlying component `files` property.
- #### Tooltip
  - **Behavioral change**: Tooltip default `placement` is 'bottom' now.
  - **Behavioral change**: Tooltip will not render an arrow indicator by default unless `with-arrow` is set.
  - **Breaking change**: Tooltip events will no longer return its `anchor` target in its `detail` property.

    You can still access it at `event.target.anchor`.

### Deprecated
- #### Tooltip
  - `disableArrow` is deprecated. Use `withArrow | with-arrow` to render an arrow indicator.

### Fixed
- #### Calendar & Date Picker
  - Incorrect date rollover for in certain scenarios [#1710](https://github.com/IgniteUI/igniteui-webcomponents/issues/1710)
- #### Combo
  - Case insensitive icon styles in themes [#1728](https://github.com/IgniteUI/igniteui-webcomponents/pull/1728)
- #### Input
  - Replace border in fluent theme with a box-shadow [#1726](https://github.com/IgniteUI/igniteui-webcomponents/pull/1726)
  - Focused state background color in Indigo theme [#1732](https://github.com/IgniteUI/igniteui-webcomponents/pull/1732)
- #### Textarea
  - Label height and component height override [#1715](https://github.com/IgniteUI/igniteui-webcomponents/pull/1715)

## [6.0.1] - 2025-05-28
### Added
- #### Radio group
  - Slotted `<label>` elements have default styles based on the current theme [#1694](https://github.com/IgniteUI/igniteui-webcomponents/pull/1694)

### Fixed
- #### Chip
  - Styling discrepancies [#1486](https://github.com/IgniteUI/igniteui-webcomponents/pull/1486)
- #### DateTime Input
  - Ensure `igcChange` is emitted in case an incomplete mask value has been filled [#1695](https://github.com/IgniteUI/igniteui-webcomponents/issues/1695)
- #### Input
  - Browser default autofill background styles [#1697](https://github.com/IgniteUI/igniteui-webcomponents/pull/1697)
- #### Textarea
  - Dynamic prefix/suffix slot content state [#1686](https://github.com/IgniteUI/igniteui-webcomponents/issues/1686)

## [6.0.0] - 2025-04-29
### Changed
- Minimum Node version required is now >= 20.
- #### Stepper
  - Stepper Step's `titlePosition` now defaults to `auto`, instead of being undefined, which has the same behavior.

### Removed
- #### Library
  - `CheckboxChangeEventArgs` removed, use `IgcCheckboxChangeEventArgs` instead.
  - `RadioChangeEventArgs` removed, use `IgcRadioChangeEventArgs` instead.
  - `IgcRangeSliderValue` removed, use `IgcRangeSliderValueEventArgs` instead.
  - `IgcActiveStepChangingArgs` removed, use `IgcActiveStepChangingEventArgs` instead.
  - `IgcActiveStepChangedArgs` removed, use `IgcActiveStepChangedEventArgs` instead.
- #### Tabs
  - `igc-tab` **panel** property is removed.
  - `igc-tab-panel` component is removed.
    The `igc-tab` now encompasses both the tab header and the tab content in a single component.

    Slotted content in the default slot of the `igc-tab` element now replaces the `igc-tab-panel` role
    while elements slotted inside the **label** slot will end up as content for the `igc-tab` header.

    Before:
    ```html
      <igc-tabs>
        <igc-tab panel="home">
          <igc-icon name="home"></igc-icon>
        </igc-tab>
        <igc-tab panel="search">
          <igc-icon name="search"></igc-icon>
        </igc-tab>
        <igc-tab panel="favorite">
          <igc-icon name="favorite"></igc-icon>
        </igc-tab>
        <igc-tab-panel id="home">Home tab panel</igc-tab-panel>
        <igc-tab-panel id="search">Search tab panel</igc-tab-panel>
        <igc-tab-panel id="favorite">Favorite tab panel</igc-tab-panel>
      </igc-tabs>
    ```

    After:
    ```html
      <igc-tabs>
        <igc-tab>
          <igc-icon name="home" slot="label"></igc-icon>
          Home tab panel
        </igc-tab>
        <igc-tab>
          <igc-icon name="search" slot="label"></igc-icon>
          Search tab panel
        </igc-tab>
        <igc-tab>
          <igc-icon name="favorite" slot="label"></igc-icon>
          Favorite tab panel
        </igc-tab>
      </igc-tabs>
    ```

## [5.4.1] - 2025-04-23
### Fixed
- Internal library issues

## [5.4.0] - 2025-04-23
### Added
- File Input component
- Tooltip component
- #### Library
  - Exposed more public API type aliases for component property types like `ButtonVariant`, `PickerMode`, `StepperOrientation`, `HorizontalTransitionAnimation` (carousel and horizontal stepper) and more.

### Changed
- #### Card
  - Spacing styles [#1620](https://github.com/IgniteUI/igniteui-webcomponents/pull/1620)
- #### Carousel
  - Use the new `button-focus-arrow-color` [#1612](https://github.com/IgniteUI/igniteui-webcomponents/pull/1612)
- #### Checkbox
  - Use the new `focus-border-color` [#1611](https://github.com/IgniteUI/igniteui-webcomponents/pull/1611)
- #### Radio
  - Use the new `focus-border-color` [#1644](https://github.com/IgniteUI/igniteui-webcomponents/pull/1644)
- #### Tile manager
  - Improved tile swap behavior based on drag direction [#1608](https://github.com/IgniteUI/igniteui-webcomponents/pull/1608)
  - View transition for UI triggered maximized state changes [#1624](https://github.com/IgniteUI/igniteui-webcomponents/pull/1624)

### Deprecated
- #### Carousel
  - Carousel Slide's `toggleAnimation` is now marked internal and deprecated for use in favor of parent Carousel's `select` method.
- #### Stepper
  - Stepper Step's `toggleAnimation` is now marked internal and deprecated for use in favor of parent Stepper's `navigateTo` method.
- #### Tabs - **NEXT MAJOR (v6.0.0) BREAKING CHANGE**
  - `igc-tab` **panel** property is removed.
  - Starting with the next major release of the library (6.0.0) the `igc-tab-panel` will be removed.
    The `igc-tab` now encompasses both the tab header and the tab content in a single component. Slotted content in the default
    slot of the `igc-tab` element now replaces the `igc-tab-panel` role while elements slotted inside the **label** slot
    will end up as content for the `igc-tab` header.

    Before 6.0.0:
    ```html
      <igc-tabs>
        <igc-tab panel="home">
          <igc-icon name="home"></igc-icon>
        </igc-tab>
        <igc-tab panel="search">
          <igc-icon name="search"></igc-icon>
        </igc-tab>
        <igc-tab panel="favorite">
          <igc-icon name="favorite"></igc-icon>
        </igc-tab>
        <igc-tab-panel id="home">Home tab panel</igc-tab-panel>
        <igc-tab-panel id="search">Search tab panel</igc-tab-panel>
        <igc-tab-panel id="favorite">Favorite tab panel</igc-tab-panel>
      </igc-tabs>
    ```

    6.0.0 and onwards:
    ```html
      <igc-tabs>
        <igc-tab>
          <igc-icon name="home" slot="label"></igc-icon>
          Home tab panel
        </igc-tab>
        <igc-tab>
          <igc-icon name="search" slot="label"></igc-icon>
          Search tab panel
        </igc-tab>
        <igc-tab>
          <igc-icon name="favorite" slot="label"></igc-icon>
          Favorite tab panel
        </igc-tab>
      </igc-tabs>
    ```
- #### Library
  - Some event argument types have been renamed for consistency:
    - `CheckboxChangeEventArgs` deprecated, use `IgcCheckboxChangeEventArgs` instead.
    - `RadioChangeEventArgs` deprecated, use `IgcRadioChangeEventArgs` instead.
    - `IgcRangeSliderValue` deprecated, use `IgcRangeSliderValueEventArgs` instead.
    - `IgcActiveStepChangingArgs` deprecated, use `IgcActiveStepChangingEventArgs` instead.
    - `IgcActiveStepChangedArgs` deprecated, use `IgcActiveStepChangedEventArgs` instead.
  - Node versions < 20 are now deprecated. The next major release (6.0.0) will require Node version > 20. [Nodejs support](https://nodejs.org/en/about/previous-releases)

### Removed
- #### Switch
  - Invalid state CSS properties [#1622](https://github.com/IgniteUI/igniteui-webcomponents/pull/1622)

### Fixed
- #### Chip
  - Bootstrap styles [#1635](https://github.com/IgniteUI/igniteui-webcomponents/pull/1635)
- #### Calendar
  - Date text color in range selection [#1630](https://github.com/IgniteUI/igniteui-webcomponents/pull/1630)
  - Header size [#1629](https://github.com/IgniteUI/igniteui-webcomponents/pull/1629)
  - Fluent theme range radius [#1650](https://github.com/IgniteUI/igniteui-webcomponents/pull/1650)
  - ARIA violation when a week with all days hidden is rendered [#1637](https://github.com/IgniteUI/igniteui-webcomponents/pull/1637)
- #### Input
  - Fluent theme discrepancies [#1651](https://github.com/IgniteUI/igniteui-webcomponents/pull/1651)
- #### Rating
  - Overwritten properties [#1654](https://github.com/IgniteUI/igniteui-webcomponents/pull/1654)
- #### Stepper
  - Header text alignment [#1624](https://github.com/IgniteUI/igniteui-webcomponents/pull/1624)
- #### Forms
  - Setting validation properties on a pristine non-dirty form associated element does not apply invalid styles [#1632](https://github.com/IgniteUI/igniteui-webcomponents/issues/1632)
- #### Library
  - Exposed `IgcCalendarResourceStrings`, `PopoverPlacement` (Dropdown and Select) and `IgcTreeSelectionEventArgs` from the public API

## [5.3.0] - 2025-03-13
### Added
- Tile manager component [#1402](https://github.com/IgniteUI/igniteui-webcomponents/pull/1402)
- #### List
  - The `igc-list-item` component exposes a new `selected` property. When set on a list item, the item will become visually highlighted [#1590](https://github.com/IgniteUI/igniteui-webcomponents/pull/1590)

### Changed
- #### Progressbar
  - Use theme schemas [#1582](https://github.com/IgniteUI/igniteui-webcomponents/pull/1582)

### Fixed
- #### Calendar
  - Days row height for Fluent and Bootstrap themes [#1597](https://github.com/IgniteUI/igniteui-webcomponents/pull/1597)
  - Disabled date text color in range preview for Material and Indigo themes [#1595](https://github.com/IgniteUI/igniteui-webcomponents/pull/1595)
- #### Chip
  - Improved responsive layout styles [#1588](https://github.com/IgniteUI/igniteui-webcomponents/pull/1588)
- #### Combo
  - Improved toggle button visual states [#1580](https://github.com/IgniteUI/igniteui-webcomponents/pull/1580)

## [5.2.4] - 2025-02-24
### Changed
- #### Carousel - **Potential visual breaking change.**
  - Removed `[part='base']` wrapping container from slide's internal DOM.

## [5.2.3] - 2025-02-13
### Fixed
- #### Chip
  - Disabled state in Bootstrap [#1573](https://github.com/IgniteUI/igniteui-webcomponents/pull/1573)

## [5.2.2] - 2025-02-12
### Fixed
- #### Combo
  - Incorrect defaultValue with async data-binding [#1555](https://github.com/IgniteUI/igniteui-webcomponents/pull/1555)
- #### Circular progressbar
  - Value label correctly scales with the diameter of the component [#1543](https://github.com/IgniteUI/igniteui-webcomponents/pull/1543)
- #### Date picker
  - Date picker styles for the helper-text slot based on its size [#1559](https://github.com/IgniteUI/igniteui-webcomponents/pull/1559)
- #### Icon button
  - Outlined border sinks behind parent element background [#1566](https://github.com/IgniteUI/igniteui-webcomponents/pull/1566)
- #### Input
  - helper-text slot padding styles [#1547](https://github.com/IgniteUI/igniteui-webcomponents/pull/1547)
- ### Navbar
  - Apply correct sizes for slotted elements from the library [#1570](https://github.com/IgniteUI/igniteui-webcomponents/pull/1570)
- #### Rating
  - Inaccurate value rounding calculation when step is not 1 [#1560](https://github.com/IgniteUI/igniteui-webcomponents/issues/1560)

## [5.2.1] - 2025-01-23
### Added
- #### Dialog
  - A new `message` slot that renders text content inside the dialog component has been added. The enhancement was introduced to align the design behavior between Ignite UI for WC and Ignite UI for Angular, ensuring a consistent user experience across products. The newly added `message' slot comes with additional styling with a max-width of 40 characters. The default slot is also still available for rendering content inside the dialog without limiting the component's width.

### Fixed
- #### List
  - CSS variables are correctly consumed from internal schemas [#1538](https://github.com/IgniteUI/igniteui-webcomponents/pull/1538)
- #### Rating
  - Inaccurate value calculation on selection when step is set to 1 [#1548](https://github.com/IgniteUI/igniteui-webcomponents/issues/1548)

## [5.2.0] - 2025-01-09
### Added
- Form-associated elements now have a `defaultValue` property (`defaultChecked` for radio buttons, checkboxes, and switches). When a form is reset, components will use this property’s value as their new value or checked state.

### Changed
- #### Calendar
  - enabled passing string values to the **value**, **values**, and **activeDate** properties [#1467](https://github.com/IgniteUI/igniteui-webcomponents/issues/1467)
- #### Checkbox
  - updated style implementation and improved slotted checkbox styles [#1489](https://github.com/IgniteUI/igniteui-webcomponents/pull/1489)
- #### Date-time input
  - enabled passing string values to the **value**, **min**, and **max** properties [#1467](https://github.com/IgniteUI/igniteui-webcomponents/issues/1467)
- #### Date picker
  - enabled passing string values to the **value**, **min**, **max** and **activeDate** properties [#1467](https://github.com/IgniteUI/igniteui-webcomponents/issues/1467)
- #### List
  - updated list item internal slots gaps and sizing [#1480](https://github.com/IgniteUI/igniteui-webcomponents/pull/1480)
- #### Progressbar
  - the default value label animation now uses CSS counters and animations [#1492](https://github.com/IgniteUI/igniteui-webcomponents/pull/1492)
- #### Validation
  - Updated validation constraints to align with the behavior of native HTML elements. For instance, the minlength attribute will now only trigger a tooShort validity state if the component contains a value.

### Fixed
- #### Avatar
  - slotted icon size [#1504](https://github.com/IgniteUI/igniteui-webcomponents/pull/1504)
- #### Badge
  - aligned colors with UI kits [#1466](https://github.com/IgniteUI/igniteui-webcomponents/pull/1466)
- #### Card
  - actions content alignment in vertical orientation [#1472](https://github.com/IgniteUI/igniteui-webcomponents/pull/1472)
- #### Combo
  - rendering issue after Edge browser autofill behavior [#1497](https://github.com/IgniteUI/igniteui-webcomponents/issues/1497)
- #### Checkbox
  - removed extra gap between the checkbox and the label [#1479](https://github.com/IgniteUI/igniteui-webcomponents/pull/1479)
  - tick color in disabled state [#1528](https://github.com/IgniteUI/igniteui-webcomponents/pull/1528)
- #### Dialog
  - removed vertical padding in Bootstrap theme [#1471](https://github.com/IgniteUI/igniteui-webcomponents/pull/1471)
  - Fluent theme typography [#1475](https://github.com/IgniteUI/igniteui-webcomponents/pull/1475)
- #### Dropdown
  - remove vertical padding in Bootstrap theme [#1471](https://github.com/IgniteUI/igniteui-webcomponents/pull/1471)
- #### Input
  - input type search does not interfere with the outline variant in Material theme [#1520](https://github.com/IgniteUI/igniteui-webcomponents/pull/1520)
  - step validation for numeric input [#1522](https://github.com/IgniteUI/igniteui-webcomponents/pull/1522)
  - helper-text color in invalid state [#1525](https://github.com/IgniteUI/igniteui-webcomponents/pull/1525)
- #### List
  - discrepancies between the list and the UI kits [#1488](https://github.com/IgniteUI/igniteui-webcomponents/pull/1488)
- #### Radio
  - remove label part when there is not slotted content [#1482](https://github.com/IgniteUI/igniteui-webcomponents/pull/1482)
- #### Textarea
  - label position in Material theme [#1518](https://github.com/IgniteUI/igniteui-webcomponents/pull/1518)
  - helper-text color in disabled state [#1519](https://github.com/IgniteUI/igniteui-webcomponents/pull/1519)
  - remove layout space for hidden content in prefix/suffix slots [#1526](https://github.com/IgniteUI/igniteui-webcomponents/pull/1526)
- #### Icon service
  - reduce sync events between copies of the service in different tabs [#1532](https://github.com/IgniteUI/igniteui-webcomponents/pull/1532)

## [5.1.2] - 2024-11-04
### Added
- Carousel component select method overload accepting index [#1457](https://github.com/IgniteUI/igniteui-webcomponents/issues/1457)

### Fixed
- Tabs - nested tabs selection [#713](https://github.com/IgniteUI/igniteui-webcomponents/issues/713)

## [5.1.1] - 2024-10-28
### Fixed
- Library - internal import path for styles and public exports for themes

## [5.1.0] - 2024-10-25
### Added
- Carousel component [#1226](https://github.com/IgniteUI/igniteui-webcomponents/issues/1226)
- Form associated custom elements validation messages [#1254](https://github.com/IgniteUI/igniteui-webcomponents/pull/1254)

### Changed
- Library - migrated palettes to relative colors [#1432](https://github.com/IgniteUI/igniteui-webcomponents/pull/1432)
- Badge - update themes [#1399](https://github.com/IgniteUI/igniteui-webcomponents/pull/1399)
- Card - update themes [#1414](https://github.com/IgniteUI/igniteui-webcomponents/pull/1414)
- Chips - update themes [#1408](https://github.com/IgniteUI/igniteui-webcomponents/pull/1408) [#1416](https://github.com/IgniteUI/igniteui-webcomponents/pull/1416)
- Dropdown - update themes [#1409](https://github.com/IgniteUI/igniteui-webcomponents/pull/1409)
- Expansion panel - update themes [#1415](https://github.com/IgniteUI/igniteui-webcomponents/pull/1415)
- Icon - update theme references [#1404](https://github.com/IgniteUI/igniteui-webcomponents/pull/1404) [#1423](https://github.com/IgniteUI/igniteui-webcomponents/pull/1423)
- Tabs - update themes [#1408](https://github.com/IgniteUI/igniteui-webcomponents/pull/1408)

### Fixed
- Checkbox, Switch - click event fires more than once [#1427](https://github.com/IgniteUI/igniteui-webcomponents/pull/1427)
- Radio - click event fires more than once [#1428](https://github.com/IgniteUI/igniteui-webcomponents/pull/1428)
- Library - export components event maps through the main package entrypoint [#1422](https://github.com/IgniteUI/igniteui-webcomponents/pull/1422)
- Calendar - cannot select dates before UNIX epoch [#1443](https://github.com/IgniteUI/igniteui-webcomponents/issues/1443)

## [5.0.2] - 2024-09-25
### Added
- Calendar, Date picker - added **header-date** slot; renders content instead of the current date/range in the calendar header [#1329](https://github.com/IgniteUI/igniteui-webcomponents/pull/1329/files)

### Changed
- Input - label typography [#1363](https://github.com/IgniteUI/igniteui-webcomponents/pull/1363/files)
- Calendar, Select, Combo - updated to latest Indigo theme [#1337](https://github.com/IgniteUI/igniteui-webcomponents/pull/1337/files)

### Fixed
- Navigation drawer - use min-width in the mini variant [#1394]((https://github.com/IgniteUI/igniteui-webcomponents/pull/1394/files))

## [5.0.1] - 2024-08-30
### Added
- Checkbox, Radio, Switch - Exported the `CheckboxChangeEventArgs` and `RadioChangeEventArgs` types for public use, providing more flexibility and control over event handling.

### Fixed
- Select - Resolved an issue where pressing the Tab key while a Select component's dropdown was open would incorrectly return focus to the document. Now, focus is correctly returned to the Select component after closing the dropdown.
- Radio - Prevented form submission if a Radio component/group is invalid on initial render within a form context. This ensures that forms with invalid Radio components are not submitted prematurely.

## [5.0.0] - 2024-08-27
### Added
- Icon Registry [#1304](https://github.com/IgniteUI/igniteui-webcomponents/issues/1304)
    - You can now register and replace icons by reference via the `setIconRef` function. To learn more check out the [documentation](https://www.infragistics.com/webcomponentssite/components/layouts/icon#icon-references).
    - All components now use icons by reference internally so that it's easy to replace them without explicitly providing custom templates.

### Changed
- **BREAKING**: Removed `igcFocus` and `igcBlur` events from buttons and inputs - Button, Icon Button, Checkbox, Switch, Combo, Date Time Input, Input, Mask Input, Radios, Select, Textarea.

  Use the native `focus` & `blur` events instead.

  Before:
  ```ts
  const input = document.createElement('igc-input');
  input.addEventListener('igcFocus', focusHandler);
  ```

  Now:
  ```ts
  input.addEventListener('focus', focusHandler);
  ```
- **BREAKING**: Checkbox, Switch `igcChange` event.

  Before:
  ```ts
  CustomEvent<boolean>
  ```

  Now:
  ```ts
  CustomEvent<{ checked: boolean; value: string | undefined }>
  ```
- **BREAKING**: Radio `igcChange` event.

  Before:
  ```ts
  CustomEvent<boolean>
  ```

  Now:
  ```ts
  CustomEvent<{ checked: boolean; value: string | undefined }>
  ```

### Removed
- **BREAKING**: igc-form - use the native form element instead.
- **BREAKING**: Range slider - `ariaThumbLower/ariaThumbUpper`. Use `thumbLabelLower/thumbLabelUpper` instead.
- **BREAKING**: Rating - `readonly` property. Use `readOnly` instead.
- **BREAKING**: Dialog - `closeOnEscape` property. Use `keepOpenOnEscape`.
- **BREAKING**: Combo, Select - `positionStrategy`, `flip`, `sameWidth` removed.
- **BREAKING**: Dropdown - `positionStrategy` removed.
- **BREAKING**: Input - `readonly`, `inputmode`, `maxlength` and `minlength`.
  Use the native `readOnly`, `inputMode`, `maxLength` and `minLength` properties instead.
- **BREAKING**: Date-time-input - `minValue`/`mavValue` are removed. Use `min`/`max` instead.
- **BREAKING**: Removed `size` property from components.

### Fixed
- Date-time input - update masked value according to the input format on focus when value is set [#1320](https://github.com/IgniteUI/igniteui-webcomponents/issues/1320)
- Radio - do not emit change event on already checked radio
- Calendar - add correct dates DOM parts based on active view [[#1278](https://github.com/IgniteUI/igniteui-webcomponents/issues/1278)]
- Date-picker, Dropdown & Select - showing the component programmatically in response to an outside click event closes the dropdown popover [#1339](https://github.com/IgniteUI/igniteui-webcomponents/issues/1339)
- Radio - Initially checked radio by attribute throws error when not being last sibling [#1356](https://github.com/IgniteUI/igniteui-webcomponents/issues/1356)

## [4.11.1] - 2024-07-03
### Changed
- Stepper Design in vertical mode [#1246](https://github.com/IgniteUI/igniteui-webcomponents/issues/1246)

## [4.11.0] - 2024-07-03
### Changed
- Toast Component Indigo Theme [#1249](https://github.com/IgniteUI/igniteui-webcomponents/pull/1249)
- Rating Component Indigo Theme [#1249](https://github.com/IgniteUI/igniteui-webcomponents/pull/1249)
- Stepper Component Indigo Theme [#1249](https://github.com/IgniteUI/igniteui-webcomponents/pull/1249)

## [4.10.0] - 2024-07-01
### Added
- Banner component [#1174](https://github.com/IgniteUI/igniteui-webcomponents/issues/1174)
- Divider component [#1237](https://github.com/IgniteUI/igniteui-webcomponents/issues/1237)
- Date picker component [#174](https://github.com/IgniteUI/igniteui-webcomponents/issues/174)
- Radio group - Bind underlying radio components name and checked state through the radio group [#315](https://github.com/IgniteUI/igniteui-webcomponents/issues/315)
- VSCode custom data intellisense (both HTML and CSS)
- JetBrains editors WebTypes intellisense

### Deprecated
- Input `inputmode` property. Aligned with the native `inputMode` DOM property instead.

### Fixed
- Input, Textarea - passing `undefined` to **value** sets the underlying input value to undefined [#1206](https://github.com/IgniteUI/igniteui-webcomponents/issues/1206)
- Mask input - after a form `reset` call correctly update underlying input value and placeholder state
- Tree - setting `--ig-size` on the item `indicator` CSS Part will now change the size of the icon
- Date-time input - double emit of `igcChange` in certain scenarios
- Navigation drawer - mini variant is not initially rendered when not in an open state [#1266](https://github.com/IgniteUI/igniteui-webcomponents/issues/1266)
- Combo:
  - Selecting an entry using the Enter key now correctly works in single selection mode [#1229](https://github.com/IgniteUI/igniteui-webcomponents/issues/1229)
  - Turning on the `disableFiltering` option now clears any previously entered search term [#1238](https://github.com/IgniteUI/igniteui-webcomponents/issues/1238)
  - Entering a search term in single selection mode that already matches the selected item now works correctly [#1260](https://github.com/IgniteUI/igniteui-webcomponents/issues/1260)

## [4.9.0] - 2024-04-30
### Added
- Button group component now allows resetting the selection state via the `selectedItems` property [#1168](https://github.com/IgniteUI/igniteui-webcomponents/pull/1168)
- Input, Textarea - exposed `validateOnly` to enable validation rules being enforced without restricting user input [#1178](https://github.com/IgniteUI/igniteui-webcomponents/pull/1178)

### Changed
- Combo, Select and Dropdown components now use the native Popover API [#1082](https://github.com/IgniteUI/igniteui-webcomponents/pull/1082)

### Deprecated
- Dropdown `positionStrategy` property. The dropdown now uses the Popover API to render its container in the top layer of the browser viewport,
  making the property obsolete.

### Fixed
- Date-time input - Label in Material theme is broken when component is in read-only mode [#1166](https://github.com/IgniteUI/igniteui-webcomponents/issues/1166)

## [4.8.2] - 2024-04-15
### Fixed
- Textarea - resize handle position for non-suffixed textarea [#1094](https://github.com/IgniteUI/igniteui-webcomponents/issues/1094)
- Tabs - error when dynamically creating and adding a tab group and tabs in a single call stack [#1140](https://github.com/IgniteUI/igniteui-webcomponents/issues/1140)
- Checkbox/Switch - participate in form submission when initially checked [#1144](https://github.com/IgniteUI/igniteui-webcomponents/issues/1144)
- Dialog - `igcClosed` fired before the component was actually closed/hidden.

## [4.8.1] - 2024-04-08
### Fixed
- Date-time input - `inputFormat` is not applied to an already set value [#1114](https://github.com/IgniteUI/igniteui-webcomponents/issues/1114)
- Checkbox, Radio, Switch - apply form validation synchronously [#1122](https://github.com/IgniteUI/igniteui-webcomponents/issues/1122)
- Select, Dropdown - Unable to select item when clicking on a wrapping element inside the dropdown/select item slot [#1123](https://github.com/IgniteUI/igniteui-webcomponents/issues/1123)
- Tree - active state is correctly applied to the correct tree node on click [#1131](https://github.com/IgniteUI/igniteui-webcomponents/issues/1131)

## [4.8.0] - 2024-03-20
### Added
- Combo component can now set `groupSorting` to `none` which shows the groups in the order of the provided data. [#1026](https://github.com/IgniteUI/igniteui-webcomponents/pull/1026)
- Button/Icon button - updated visual looks across themes, new states. [#1050](https://github.com/IgniteUI/igniteui-webcomponents/pull/1050)
- Navigation bar - added border in Bootstrap theme. [#1060](https://github.com/IgniteUI/igniteui-webcomponents/pull/1060)

### Changed
- Grouping in Combo component no longer sorts the data. `groupSorting` property now affects the sorting direction only of the groups.
  **Behavioral change**
  In previous release the sorting directions of the groups sorted the items as well. If you want to achieve this behavior you can pass already sorted data to the Combo component.

### Deprecated
- Slider
   - `aria-label-upper` and `aria-label-lower` are deprecated and will be removed in the next major release. Use `thumb-label-upper` and `thumb-label-lower` instead.

### Fixed
- Button
   - slotted icon size. [#1054](https://github.com/IgniteUI/igniteui-webcomponents/pull/1054)
- Button group
   - updated Fluent theme look. [#1044](https://github.com/IgniteUI/igniteui-webcomponents/pull/1044)
   - disabled state in Safari. [#1047](https://github.com/IgniteUI/igniteui-webcomponents/pull/1047)
- Combo/Select
   - style issues. [#1038](https://github.com/IgniteUI/igniteui-webcomponents/pull/1038) [#1059](https://github.com/IgniteUI/igniteui-webcomponents/pull/1059)
- Slider
   - clicks on the slider track now use the track element width as a basis for the calculation. [#1049](https://github.com/IgniteUI/igniteui-webcomponents/pull/1049)
   - input events are not longer emitted while continuously dragging the slider thumb and exceeding upper/lower bounds. [#1049](https://github.com/IgniteUI/igniteui-webcomponents/pull/1049)
   - when setting **upper-bound/lower-bound** *before* **min/max**, the slider will no longer overwrite the bound properties with the previous values of min/max. [#1049](https://github.com/IgniteUI/igniteui-webcomponents/pull/1049)
   - the **aria-label** bound to the slider thumb is no longer reset on consequent renders. [#1049](https://github.com/IgniteUI/igniteui-webcomponents/pull/1049)
- Input
   - default validators are run synchronously. [#1066](https://github.com/IgniteUI/igniteui-webcomponents/issues/1066)
   - style issues. [#1038](https://github.com/IgniteUI/igniteui-webcomponents/pull/1038) [#1104](https://github.com/IgniteUI/igniteui-webcomponents/pull/1104)
- Date-time input
   - setRangeText() updates underlying value. [#1075](https://github.com/IgniteUI/igniteui-webcomponents/issues/1075)

## [4.7.0] - 2024-01-05
### Added
- Tree - Added **`toggleNodeOnClick`** property that determines whether clicking over a node will change its expanded state or not. Defaults to `false`. [#1003](https://github.com/IgniteUI/igniteui-webcomponents/pull/1003).
- Rating - **`allowReset`** added. When enabled selecting the same value will reset the component [#1014](https://github.com/IgniteUI/igniteui-webcomponents/issues/1014).
  **Behavioral change**

  In previous releases this was the default behavior of the rating component. Make sure to set `allowReset` if you need to keep this behavior in your application.

### Changed
- Improved WAI-ARIA compliance for Avatar, Badge and Combo components [#1007](https://github.com/IgniteUI/igniteui-webcomponents/pull/1007)

### Fixed
- Active item visual styles for Dropdown, Select and Combo components [#1002](https://github.com/IgniteUI/igniteui-webcomponents/pull/1002)
- Navigation drawer - mini variant broken visual style [#1011](https://github.com/IgniteUI/igniteui-webcomponents/pull/1011)

## [4.6.0] - 2023-12-05
### Added
- **`action`** slot added to Snackbar [#974](https://github.com/IgniteUI/igniteui-webcomponents/issues/974)
- **`indicator-expanded`** slot added to Expansion panel [#982](https://github.com/IgniteUI/igniteui-webcomponents/pull/982)
- **`toggle-icon-expanded`** slot added to Select [#983](https://github.com/IgniteUI/igniteui-webcomponents/pull/983)
- Select, Dropdown - exposed **`selectedItem`**, **`items`** and **`groups`** getters

### Changed
- Updated the package to Lit v3
- Components dark variants are now bound to their shadow root [#940](https://github.com/IgniteUI/igniteui-webcomponents/pull/940)
- Components implement default sizes based on current theme [#977](https://github.com/IgniteUI/igniteui-webcomponents/pull/977)
- Button group - changed events to non-cancellable [#984](https://github.com/IgniteUI/igniteui-webcomponents/pull/984)
- Optimized components CSS and reduced bundle size [#972](https://github.com/IgniteUI/igniteui-webcomponents/pull/972)
- WAI-ARIA improvements for Icon, Select, Dropdown and List components [#980](https://github.com/IgniteUI/igniteui-webcomponents/pull/980) [#983](https://github.com/IgniteUI/igniteui-webcomponents/pull/983)

### Fixed
- Textarea missing styling parts [#944](https://github.com/IgniteUI/igniteui-webcomponents/issues/944)
- Tree item disabled styles [#949](https://github.com/IgniteUI/igniteui-webcomponents/pull/949)
- Snackbar removed unnecessary styles [#960](https://github.com/IgniteUI/igniteui-webcomponents/pull/960)
- Tree item hover state visual design [#987](https://github.com/IgniteUI/igniteui-webcomponents/pull/987)
- Calendar not keeping focus state when switching views [#992](https://github.com/IgniteUI/igniteui-webcomponents/issues/992)

## [4.5.0] - 2023-10-09
### Added
- Text area component [#764](https://github.com/IgniteUI/igniteui-webcomponents/issues/764)
- Button group component [#827](https://github.com/IgniteUI/igniteui-webcomponents/issues/827)
- Toggle button component [#877](https://github.com/IgniteUI/igniteui-webcomponents/issues/877)
- Navigation drawer now supports CSS transitions [#922](https://github.com/IgniteUI/igniteui-webcomponents/pull/922)
- Position attribute for toast and snackbar [#934](https://github.com/IgniteUI/igniteui-webcomponents/pull/934)

### Deprecated
- The `size` property and attribute have been deprecated for all components. Use the `--ig-size` CSS custom property instead.
  The following example sets the size of the avatar component to small:
  ```css
    igc-avatar {
      --ig-size: var(--ig-size-small);
    }
  ```

### Fixed
- Combo items position in Safari [#903](https://github.com/IgniteUI/igniteui-webcomponents/pull/903)
- Calendar navigation buttons in RTL context [#915](https://github.com/IgniteUI/igniteui-webcomponents/pull/915)
- Export `IgcComboChangeEventArgs` type [#917](https://github.com/IgniteUI/igniteui-webcomponents/pull/917)
- Combo value and selection states with lazy data binding [#937](https://github.com/IgniteUI/igniteui-webcomponents/pull/937)
- Various style and theming fixes and adjustments

## [4.4.0] - 2023-08-30
### Added
- The following components are now Form Associated Custom Elements. They are automatically associated with a parent `<form>`
  and behave like a browser-provided control:
  - Button & Icon button
  - Checkbox
  - Combo
  - DateTime input
  - Input
  - Masked input
  - Radio
  - Rating
  - Single slider
  - Select
  - Switch
- Stepper now supports animations [#861](https://github.com/IgniteUI/igniteui-webcomponents/issues/861)

### Changed
- Rating fluent theme colors [#481](https://github.com/IgniteUI/igniteui-webcomponents/issues/481)
- Stepper indicator styles and color schemas [#766](https://github.com/IgniteUI/igniteui-webcomponents/issues/766) [#868](https://github.com/IgniteUI/igniteui-webcomponents/issues/868)

### Deprecated
- IgcForm component is deprecated
- Input component:
  - `minlength` property is deprecated and will be removed in the next major version. Use `minLength` instead.
  - `maxlength` property is deprecated and will be removed in the next major version. Use `maxLength` instead.
  - `readonly` property is deprecated and will be removed in the next major version. Use `readOnly` instead.
- Mask input component:
  - `readonly` property is deprecated and will be removed in the next major version. Use `readOnly` instead.
- DateTime input component:
  - `readonly` property is deprecated and will be removed in the next major version. Use `readOnly` instead.
  - `minValue` property is deprecated and will be removed in the next major version. Use `min` instead.
  - `maxValue` property is deprecated and will be removed in the next major version. Use `max` instead.
- Rating component:
  - `readonly` property is deprecated and will be removed in the next major version. Use `readOnly` instead.

### Removed
- Removed our own `dir` attribute which shadowed the default one. This is a **non-breaking change**.
- Slider - `ariaLabel` shadowed property. This is a **non-breaking change**.
- Checkbox - `ariaLabelledBy` shadowed attribute. This is a **non-breaking change**.
- Switch - `ariaLabelledBy` shadowed attribute. This is a **non-breaking change**.
- Radio - `ariaLabelledBy` shadowed attribute. This is a **non-breaking change**.

### Fixed
- Input - outlined variant styling issues [#875](https://github.com/IgniteUI/igniteui-webcomponents/issues/875) and indigo theme issues [#879](https://github.com/IgniteUI/igniteui-webcomponents/issues/879)
- Select - outlined variant styling issues [#880](https://github.com/IgniteUI/igniteui-webcomponents/issues/880)
- DateTime Input - `spinUp/spinDown` calls moving the caret when the input is focused [#859](https://github.com/IgniteUI/igniteui-webcomponents/issues/859)

## [4.3.1] - 2023-08-02
### Added
- Tree - component animations [#846](https://github.com/IgniteUI/igniteui-webcomponents/issues/846)
- Components border radius is consumed from their schemas [#805](https://github.com/IgniteUI/igniteui-webcomponents/issues/805)

### Changed
- Combo, Input, Select - schema colors [#767](https://github.com/IgniteUI/igniteui-webcomponents/issues/767)
- Dropdown - schema colors [#828](https://github.com/IgniteUI/igniteui-webcomponents/issues/828)
- Icon - updated theming styles and size [#813](https://github.com/IgniteUI/igniteui-webcomponents/issues/813)

### Fixed
- Combo - single selection not working in certain scenarios [#816](https://github.com/IgniteUI/igniteui-webcomponents/issues/816)
- Dropdown - various styling fixes [#841](https://github.com/IgniteUI/igniteui-webcomponents/issues/841) [#848](https://github.com/IgniteUI/igniteui-webcomponents/issues/848)
- Icon button - border radius with ripple [#839](https://github.com/IgniteUI/igniteui-webcomponents/issues/839)
- Icon button - fixed wrong color in Fluent theme [#845](https://github.com/IgniteUI/igniteui-webcomponents/issues/845)
- Input - various styling fixes [#818](https://github.com/IgniteUI/igniteui-webcomponents/issues/818) [#832](https://github.com/IgniteUI/igniteui-webcomponents/issues/832) [#844](https://github.com/IgniteUI/igniteui-webcomponents/pull/844)
- Tree Item - assign closest *igc-tree-item* ancestor as a parent [#829](https://github.com/IgniteUI/igniteui-webcomponents/issues/829)
- Tabs - internal **hidden** styles and custom display property [#851](https://github.com/IgniteUI/igniteui-webcomponents/issues/851)

## [4.3.0] - 2023-06-28
### Added
- Combo: Added `matchDiacritics` to the filtering options property. Defaults to `false`.
  If set to `true` the filter distinguishes between accented letters and
  their base letters. Otherwise strings are normalized and then matched.
- Combo: Added `selection` property which returns the current selection as an array of data objects.
- Card: Support explicit height
- Dialog: Added animations
- Snackbar: Added animations
- Toast: Added animations

### Changed
- Combo: `value` is no longer readonly and can be explicitly set. The value attribute also supports declarative binding,
  accepting a valid JSON stringified array.
- Combo: `value` type changed from `string[]` to `ComboValue<T>[]` where
  ```ts
  ComboValue<T> = T | T[keyof T]
  ```
- Combo: `igcChange` event object properties are also changed to reflect tee new `value` type:
  ```typescript
  interface IgcComboChangeEventArgs<T> {
  newValue: ComboValue<T>[];
  items: T[];
  type: ComboChangeType;
  }
  ```

### Deprecated
- Select: Deprecated `sameWidth`, `positionStrategy` and `flip`. They will be removed in the next major release.

### Fixed
- Select: prefix/suffix/helper-text slots not being rendered [#722](https://github.com/IgniteUI/igniteui-webcomponents/issues/722)
- Tabs: Nested tabs selection [#713](https://github.com/IgniteUI/igniteui-webcomponents/issues/713)
- Dialog: Backdrop doesn't overlay elements [#727](https://github.com/IgniteUI/igniteui-webcomponents/issues/727)
- Dropdown: Listbox position on initial open state [#723](https://github.com/IgniteUI/igniteui-webcomponents/issues/723)
- Stepper: Stretch vertically in parent container [#738](https://github.com/IgniteUI/igniteui-webcomponents/issues/738)
- Navbar: Wrong colors in fluent theme [#719](https://github.com/IgniteUI/igniteui-webcomponents/issues/719)
- Animation player throws errors when height is unspecified [#793](https://github.com/IgniteUI/igniteui-webcomponents/issues/793)
- DateTimeInput: Intl.DateTimeFormat issues in Chromium based browsers [#803](https://github.com/IgniteUI/igniteui-webcomponents/issues/803)

## [4.2.3] - 2023-04-03
### Deprecated
- Dialog - Property `closeOnEscape` is deprecated in favor of new property `keepOpenOnEscape`.

### Fixed
- Radio Button- colors in selected focus state [#685](https://github.com/IgniteUI/igniteui-webcomponents/issues/685)
- Icon Button - set icon size to match other design system products [#598](https://github.com/IgniteUI/igniteui-webcomponents/issues/598), [#695](https://github.com/IgniteUI/igniteui-webcomponents/issues/695)
- Chip - removed outline styles for Fluent and Material themes [#702](https://github.com/IgniteUI/igniteui-webcomponents/pull/702)
- Calendar - navigation to date on set value [#436](https://github.com/IgniteUI/igniteui-webcomponents/issues/436)
- Tabs - not taking the full height of their parents [#710](https://github.com/IgniteUI/igniteui-webcomponents/issues/710)

## [4.2.2] - 2023-03-07
### Deprecated
- Button - The prefix/suffix slots are no longer needed and will be removed in the next major release.

### Fixed
- Button - UI inconsistencies [#675](https://github.com/IgniteUI/igniteui-webcomponents/issues/675), [#679](https://github.com/IgniteUI/igniteui-webcomponents/issues/679)
- Calendar - Fluent theme inconsistencies [#653](https://github.com/IgniteUI/igniteui-webcomponents/issues/653), [#672](https://github.com/IgniteUI/igniteui-webcomponents/issues/672)
- Combo - Selection via API doesn't work on a searched list [#649](https://github.com/IgniteUI/igniteui-webcomponents/issues/649)
- Dialog - Fluent theme inconsistency [#603](https://github.com/IgniteUI/igniteui-webcomponents/issues/603)
- Input - UI inconsistencies [#657](https://github.com/IgniteUI/igniteui-webcomponents/issues/657), [#658](https://github.com/IgniteUI/igniteui-webcomponents/issues/658)
- Toast - Fluent theme inconsistency [#668](https://github.com/IgniteUI/igniteui-webcomponents/issues/668)
- Components missing in defineAllComponents [#691](https://github.com/IgniteUI/igniteui-webcomponents/issues/691)
- Wrong host sizes for Avatar, Badge, Button and Icon Button [#669](https://github.com/IgniteUI/igniteui-webcomponents/issues/669)

## [4.2.1] - 2023-02-01
### Fixed
- Combo - Matching item not activated on filtering in single selection mode

## [4.2.0] - 2023-01-31
### Added
- Combo - Single Selection mode via the `single-select` attribute [#626](https://github.com/IgniteUI/igniteui-webcomponents/issues/626)

### Fixed
- Input - UI inconsistencies [#619](https://github.com/IgniteUI/igniteui-webcomponents/issues/619), [#620](https://github.com/IgniteUI/igniteui-webcomponents/issues/620), [#633](https://github.com/IgniteUI/igniteui-webcomponents/issues/633), [#638](https://github.com/IgniteUI/igniteui-webcomponents/issues/638)
- Badge - Doesn't correctly render `igc-icon` and font icons [#631](https://github.com/IgniteUI/igniteui-webcomponents/issues/631)
- Radio - UI inconsistencies [#621](https://github.com/IgniteUI/igniteui-webcomponents/issues/621), [#623](https://github.com/IgniteUI/igniteui-webcomponents/issues/623)
- Navigation Drawer - Can't override item margin [#614](https://github.com/IgniteUI/igniteui-webcomponents/issues/614)

## [4.1.1] - 2023-01-12
### Fixed
- Input - position label based on component size [#589](https://github.com/IgniteUI/igniteui-webcomponents/pull/589)
- Input - material themes don't match design by [#580](https://github.com/IgniteUI/igniteui-webcomponents/issues/580)
- Input - do not cache the underlying input [#604](https://github.com/IgniteUI/igniteui-webcomponents/issues/604)
- Card - color discrepancy between WC and Angular [#586](https://github.com/IgniteUI/igniteui-webcomponents/issues/586)
- Theme - update stale --igc-* variables to --ig-* [#603](https://github.com/IgniteUI/igniteui-webcomponents/issues/603)
- Removed dangling references after element disconnect [#608](https://github.com/IgniteUI/igniteui-webcomponents/pull/608)

## [4.1.0] - 2022-12-09
### Added
- Stepper Component [#219](https://github.com/IgniteUI/igniteui-webcomponents/issues/219)
- Combo Component [#411](https://github.com/IgniteUI/igniteui-webcomponents/issues/411)
- Mask Input - Skip literal positions when deleting symbols in the component

### Fixed
- Mask input - Validation state on user input [#558](https://github.com/IgniteUI/igniteui-webcomponents/issues/558)

## [4.0.0] - 2022-11-02
### Changed
- Themes
  - Build - Utilize [Ignite UI Theming](https://github.com/IgniteUI/igniteui-theming) package when building themes [#415](https://github.com/IgniteUI/igniteui-webcomponents/issues/415)
  - Sizing - Introduced CSS variables that allow runtime CSS configuration of the size for all or individual components [#115](https://github.com/IgniteUI/igniteui-webcomponents/issues/115)
  - Spacing - Introduced CSS variables that allow runtime CSS configuration of the internal spacing (padding/margin) of components [#506](https://github.com/IgniteUI/igniteui-webcomponents/issues/506)
  - Scrollbars - Added the ability to style application-level scrollbars by setting the `ig-scrollbar` CSS class on any element [#141](https://github.com/IgniteUI/igniteui-webcomponents/issues/141)

## [3.4.2] - 2022-11-01
### Fixed
- Resolved importing error for `DateRangeType` [#535](https://github.com/IgniteUI/igniteui-webcomponents/issues/535)

## [3.4.1] - 2022-09-19
### Changed
- Slider - updated theme with the latest fluent spec [#453](https://github.com/IgniteUI/igniteui-webcomponents/pull/453)
- Calendar - updated weekend days color [#483](https://github.com/IgniteUI/igniteui-webcomponents/issues/483)

### Fixed
- Tabs `selected` attribute breaks content visibility on init [#507](https://github.com/IgniteUI/igniteui-webcomponents/issues/507)

## [3.4.0] - 2022-09-07
### Added
- Dialog component [#175](https://github.com/IgniteUI/igniteui-webcomponents/issues/175)
- Select component [#180](https://github.com/IgniteUI/igniteui-webcomponents/issues/180)

### Fixed
- Calendar - range selection a11y improvements [#476](https://github.com/IgniteUI/igniteui-webcomponents/issues/476)
- Range slider - a11y improvements for choosing range values [#477](https://github.com/IgniteUI/igniteui-webcomponents/issues/477)
- Rating - improved a11y with assistive software now reading the total number of items [#478](https://github.com/IgniteUI/igniteui-webcomponents/issues/478)
- Toast - added `role="alert"` to the message container for assistive software to read it without the need of focusing [#479](https://github.com/IgniteUI/igniteui-webcomponents/issues/479)
- Chip - made remove button accessible with the keyboard [#480](https://github.com/IgniteUI/igniteui-webcomponents/issues/480)
- Button prefix/suffix does not align icons to the button text [#491](https://github.com/IgniteUI/igniteui-webcomponents/issues/491)

## [3.3.1] - 2022-08-10
### Changed
- Tree - Removed theme-specified height [#460](https://github.com/IgniteUI/igniteui-webcomponents/pull/460)

### Fixed
- Dropdown - Dispose of top-level event listeners [#462](https://github.com/IgniteUI/igniteui-webcomponents/issues/462)
- Linear Progress - Indeterminate animation in Safari [#378](https://github.com/IgniteUI/igniteui-webcomponents/issues/378)
- Radio Group - Child radio components auto-registration [#464](https://github.com/IgniteUI/igniteui-webcomponents/pull/464)

## [3.3.0] - 2022-07-26
### Added
- DateTime input component [#314](https://github.com/IgniteUI/igniteui-webcomponents/pull/314)
- Tabs component [#341](https://github.com/IgniteUI/igniteui-webcomponents/pull/341)
- Typography styles in themes [#392](https://github.com/IgniteUI/igniteui-webcomponents/pull/392)
- Accordion component [#418](https://github.com/IgniteUI/igniteui-webcomponents/pull/418)

### Changed
- Rating - Added support for single selection and empty symbols [#428](https://github.com/IgniteUI/igniteui-webcomponents/pull/428)
- Slider - Improved slider steps rendering [#448](https://github.com/IgniteUI/igniteui-webcomponents/pull/448)
- Components will now auto register their dependencies when they are registered in `defineComponents`

    ```typescript
    import { IgcDropdownComponent, defineComponents } from 'igniteui-webcomponents';
    // will automatically register the dropdown item & group elements
    // as well as their dependencies if any
    defineComponents(IgcDropdownComponent);
    ```

    Check the official [documentation](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/general-getting-started) for more information.

### Fixed
- Remove input helper text container when it is empty [#395](https://github.com/IgniteUI/igniteui-webcomponents/pull/395)
- Icon not showing in Safari [#393](https://github.com/IgniteUI/igniteui-webcomponents/pull/393)
- Checkbox not showing in Safari [#398](https://github.com/IgniteUI/igniteui-webcomponents/pull/398)
- Button stretches correctly in flex containers [#407](https://github.com/IgniteUI/igniteui-webcomponents/pull/407)
- Various theming issues [#402](https://github.com/IgniteUI/igniteui-webcomponents/pull/402) [#409](https://github.com/IgniteUI/igniteui-webcomponents/pull/409) [#424](https://github.com/IgniteUI/igniteui-webcomponents/pull/424)
- Dropdown - bug fixes and improvements [#434](https://github.com/IgniteUI/igniteui-webcomponents/pull/434)

## [3.2.0] - 2022-05-30
### Added
- Mask input [#173](https://github.com/IgniteUI/igniteui-webcomponents/issues/173)
- Expansion Panel [#177](https://github.com/IgniteUI/igniteui-webcomponents/issues/177)
- Tree [#188](https://github.com/IgniteUI/igniteui-webcomponents/issues/188)
- Rating - Added `selected` CSS part and exposed CSS variable to control symbol sizes [#340](https://github.com/IgniteUI/igniteui-webcomponents/pull/340) [#371](https://github.com/IgniteUI/igniteui-webcomponents/pull/371)
- Icon Button - Allow slotted content [#355](https://github.com/IgniteUI/igniteui-webcomponents/pull/355)

### Fixed
- Navigation drawer - Various styles fixes [#356](https://github.com/IgniteUI/igniteui-webcomponents/pull/356) [#349](https://github.com/IgniteUI/igniteui-webcomponents/pull/349) [#363](https://github.com/IgniteUI/igniteui-webcomponents/pull/363) [#364](https://github.com/IgniteUI/igniteui-webcomponents/pull/364)
- Buttons - Vertical align [#357](https://github.com/IgniteUI/igniteui-webcomponents/pull/357) and focus management [#380](https://github.com/IgniteUI/igniteui-webcomponents/pull/380)
- Input - Overflow for suffix/prefix [#359](https://github.com/IgniteUI/igniteui-webcomponents/pull/359)
- Switch - Collapse with small sizes [#362](https://github.com/IgniteUI/igniteui-webcomponents/pull/362)
- List - Overflow behaviour [#391](https://github.com/IgniteUI/igniteui-webcomponents/pull/391)

## [3.1.0] - 2022-04-15
### Added
- Chip: Added `prefix` and `suffix` slots [#334](https://github.com/IgniteUI/igniteui-webcomponents/pull/334)
- Snackbar: Added `toggle` method [#326](https://github.com/IgniteUI/igniteui-webcomponents/issues/326)

### Deprecated
- Chip: Previously exposed `start` and `end` slots are replaced by prefix and suffix. They remain active, but are now deprecated and will be removed in a future version.

### Fixed
- Chip: Auto load internal icons [#327](https://github.com/IgniteUI/igniteui-webcomponents/issues/327)
- Chip: Selected chip is misaligned [#328](https://github.com/IgniteUI/igniteui-webcomponents/issues/328)
- Package: ESM internal import paths

## [3.0.0] - 2022-04-12
### Changed
- **Breaking Change**: All dropdown related classes renamed from `IgcDropDown*` to `IgcDropdown*`

## [2.2.0] - 2022-04-01
### Added
- Drop Down component
- Calendar: Active date can be set via an attribute

## [2.1.1] - 2022-03-15
### Added
- Control border radius and elevation from `--igc-radius-factor` and `--igc-elevation-factor`:

  Example:

  ```css
  /* Make all components square and remove all shadows */
  :root {
    --igc-radius-factor: 0;
    --igc-elevation-factor: 0;
  }
  ```

## [2.1.0] - 2022-03-15
### Added
- Linear Progress component
- Circular Progress component
- Chip component
- Snackbar component
- Toast component
- Rating component
- Component themes can be changed at runtime by calling the `configureTheme(theme: Theme)` function

## [2.0.0] - 2022-02-03
### Added
- Dark Themes
- Slider component
- Range Slider component
- Support `required` property in Radio component.

### Changed
- Fix checkbox/switch validity status
- Split Calendar component's `value: Date | Date[]` property into two properties - `value: Date` and `values: Date[]`
- Replaced Calendar component's `hasHeader` property & `has-header` attribute with `hideHeader` & `hide-header` respectively.
- Replaced Card component's `outlined` property with `elevated`.

### Removed
- Removed `igcOpening`, `igcOpened`, `igcClosing` and `igcClosed` events from Navigation drawer component.

## [1.0.0] - 2021-11-22
Initial release of Ignite UI Web Components

### Added
- Avatar component
- Badge component
- Button component
- Calendar component
- Card component
- Checkbox component
- Form component
- Icon component
- Icon button component
- Input component
- List component
- Navigation bar component
- Navigation drawer component
- Radio group component
- Radio component
- Ripple component
- Switch component

[6.1.2]: https://github.com/IgniteUI/igniteui-webcomponents/compare/6.1.1...6.1.2
[6.1.1]: https://github.com/IgniteUI/igniteui-webcomponents/compare/6.1.0...6.1.1
[6.1.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/6.0.1...6.1.0
[6.0.1]: https://github.com/IgniteUI/igniteui-webcomponents/compare/6.0.0...6.0.1
[6.0.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/5.4.1...6.0.0
[5.4.1]: https://github.com/IgniteUI/igniteui-webcomponents/compare/5.4.0...5.4.1
[5.4.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/5.3.0...5.4.0
[5.3.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/5.2.4...5.3.0
[5.2.4]: https://github.com/IgniteUI/igniteui-webcomponents/compare/5.2.3...5.2.4
[5.2.3]: https://github.com/IgniteUI/igniteui-webcomponents/compare/5.2.2...5.2.3
[5.2.2]: https://github.com/IgniteUI/igniteui-webcomponents/compare/5.2.1...5.2.2
[5.2.1]: https://github.com/IgniteUI/igniteui-webcomponents/compare/5.2.0...5.2.1
[5.2.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/5.1.2...5.2.0
[5.1.2]: https://github.com/IgniteUI/igniteui-webcomponents/compare/5.1.1...5.1.2
[5.1.1]: https://github.com/IgniteUI/igniteui-webcomponents/compare/5.1.0...5.1.1
[5.1.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/5.0.2...5.1.0
[5.0.2]: https://github.com/IgniteUI/igniteui-webcomponents/compare/5.0.1...5.0.2
[5.0.1]: https://github.com/IgniteUI/igniteui-webcomponents/compare/5.0.0...5.0.1
[5.0.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/4.11.1...5.0.0
[4.11.1]: https://github.com/IgniteUI/igniteui-webcomponents/compare/4.11.0...4.11.1
[4.11.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/4.10.0...4.11.0
[4.10.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/4.9.0...4.10.0
[4.9.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/4.8.2...4.9.0
[4.8.2]: https://github.com/IgniteUI/igniteui-webcomponents/compare/4.8.1...4.8.2
[4.8.1]: https://github.com/IgniteUI/igniteui-webcomponents/compare/4.8.0...4.8.1
[4.8.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/4.7.0...4.8.0
[4.7.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/4.6.0...4.7.0
[4.6.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/4.5.0...4.6.0
[4.5.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/4.4.0...4.5.0
[4.4.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/4.3.1...4.4.0
[4.3.1]: https://github.com/IgniteUI/igniteui-webcomponents/compare/4.3.0...4.3.1
[4.3.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/4.2.3...4.3.0
[4.2.3]: https://github.com/IgniteUI/igniteui-webcomponents/compare/4.2.2...4.2.3
[4.2.2]: https://github.com/IgniteUI/igniteui-webcomponents/compare/4.2.1...4.2.2
[4.2.1]: https://github.com/IgniteUI/igniteui-webcomponents/compare/4.2.0...4.2.1
[4.2.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/4.1.1...4.2.0
[4.1.1]: https://github.com/IgniteUI/igniteui-webcomponents/compare/4.1.0...4.1.1
[4.1.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/4.0.0...4.1.0
[4.0.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/3.4.2...4.0.0
[3.4.2]: https://github.com/IgniteUI/igniteui-webcomponents/compare/3.4.1...3.4.2
[3.4.1]: https://github.com/IgniteUI/igniteui-webcomponents/compare/3.4.0...3.4.1
[3.4.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/3.3.1...3.4.0
[3.3.1]: https://github.com/IgniteUI/igniteui-webcomponents/compare/3.3.0...3.3.1
[3.3.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/3.2.0...3.3.0
[3.2.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/3.1.0...3.2.0
[3.1.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/3.0.0...3.1.0
[3.0.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/2.2.0...3.0.0
[2.2.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/2.1.1...2.2.0
[2.1.1]: https://github.com/IgniteUI/igniteui-webcomponents/compare/2.1.0...2.1.1
[2.1.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/2.0.0...2.1.0
[2.0.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/1.0.0...2.0.0
[1.0.0]: https://github.com/IgniteUI/igniteui-webcomponents/releases/tag/1.0.0

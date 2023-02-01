# Ignite UI Web Components Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

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

# IgniteUI Web Components Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

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

[3.2.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/3.1.0...3.2.0
[3.1.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/3.0.0...3.1.0
[3.0.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/2.2.0...3.0.0
[2.2.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/2.1.1...2.2.0
[2.1.1]: https://github.com/IgniteUI/igniteui-webcomponents/compare/2.1.0...2.1.1
[2.1.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/2.0.0...2.1.0
[2.0.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/1.0.0...2.0.0
[1.0.0]: https://github.com/IgniteUI/igniteui-webcomponents/releases/tag/1.0.0

# IgniteUI Web Components Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

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

[2.1.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/2.0.0...2.1.0
[2.0.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/1.0.0...2.0.0
[1.0.0]: https://github.com/IgniteUI/igniteui-webcomponents/releases/tag/1.0.0

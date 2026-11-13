# Ignite UI Web Components Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Added
- #### Accordion, Expansion panel, Tabs, Tree
  - Find-in-page, text fragments and links to an element now find content in collapsed panels, in tabs that are not selected and in collapsed tree items. The component shows the match and emits its usual events. [#2594](https://github.com/IgniteUI/igniteui-webcomponents/pull/2594)
    - Expansion panel: opens and emits `igcOpening`, which you can cancel, and `igcOpened`. In an accordion with `single-expand`, the other panels close with no animation.
    - Tabs: selects the tab and emits `igcChange`. The focus does not move, and a link tab does not follow its link.
    - Tree: expands the collapsed items above the match. Each item emits `igcItemExpanding`, which you can cancel, and `igcItemExpanded`. In WebKit, the tree does not scroll to a match in an item that skips its rendering.
    - A disabled panel, tab or item stays closed, and its content is not searchable.
    - The browser must support `hidden="until-found"` (Chrome 102, Firefox 139, Safari 26.2). Other browsers hide the content as before.
- #### API documentation
  - The manifest and the API documentation now list the custom states and 20 parts that were not documented. The states are `ig-invalid` of the form controls, `disabled` and `label-before` of the radio group, and `start-collapsed` and `end-collapsed` of the splitter. Style a state with `:state()`, for example `igc-input:state(ig-invalid)`. [#2489](https://github.com/IgniteUI/igniteui-webcomponents/pull/2489)
- #### Calendar, Date picker, Date range picker
  - `DateRangeDescriptor` has an optional `label`. The calendar adds the labels of the matching `specialDates` and `disabledDates` to the accessible name of a date, for example "Thursday, October 8, 2026, Free delivery". [#2423](https://github.com/IgniteUI/igniteui-webcomponents/pull/2423)
- #### Chat
  - `focusInput()` moves the focus to the text area, for example after you set `draftMessage`. It waits for the first render. It does nothing when a custom `input` renderer replaces the text area. [#2474](https://github.com/IgniteUI/igniteui-webcomponents/pull/2474) [#2539](https://github.com/IgniteUI/igniteui-webcomponents/pull/2539)
  - `igcNavigate` is emitted before a plain click or Enter opens a message link in the same tab. Cancel it to route on the client. The detail has the message and the absolute URL. The event does not bubble, so listen to it on the chat. [#2573](https://github.com/IgniteUI/igniteui-webcomponents/pull/2573)
- #### Combo
  - Remote data: set `filteringOptions.mode` to `remote` to stop the local filter. Read `detail.searchText` of `igcSearchInput`, search on the server, and set `data` to the results. When the user scrolls near the end of `data`, `igcDataRequest` asks for `count` more items at `startIndex`. New types: `ComboFilteringMode`, `IgcComboSearchInputEventArgs`. [#2519](https://github.com/IgniteUI/igniteui-webcomponents/issues/2519) [#2545](https://github.com/IgniteUI/igniteui-webcomponents/pull/2545)
  - `totalItemCount` gives the size of a remote source. The list shows a skeleton for each item that is not loaded, so the scrollbar shows the full length. `loading` shows a spinner in place of the toggle icon. Change them with the `loading` slot and the `loading` and `placeholder` parts. [#2519](https://github.com/IgniteUI/igniteui-webcomponents/issues/2519) [#2545](https://github.com/IgniteUI/igniteui-webcomponents/pull/2545)
  - `bindComboDataSource()` from `igniteui-webcomponents/extras/combo-data-source` connects a combo to a server that searches and pages. You give it a `load` function that returns one page, and an optional `resolve` function for the items of preset values. It sets `totalItemCount` and `loading`. See "Extras" in the README. [#2519](https://github.com/IgniteUI/igniteui-webcomponents/issues/2519) [#2545](https://github.com/IgniteUI/igniteui-webcomponents/pull/2545)
  - `showSelectAll` adds a "Select all" option in multiple selection. `selectAllItems()` and `deselectAllItems()` do the same from code. Both act on the items that the filter shows. Give `ignoreFilter` to the methods to act on all of `data`. Part: `select-all`. Resource string: `combo_select_all`. [#2535](https://github.com/IgniteUI/igniteui-webcomponents/issues/2535) [#2545](https://github.com/IgniteUI/igniteui-webcomponents/pull/2545)
  - `groupSelection` makes each group header an option that selects or deselects the shown items of its group, in multiple selection with `groupKey`. The items are indented under their header. Set `--ig-combo-item-indent` to change the indent. [#2535](https://github.com/IgniteUI/igniteui-webcomponents/issues/2535) [#2545](https://github.com/IgniteUI/igniteui-webcomponents/pull/2545)
  - `selectionCommit="confirm"` holds the changes of the user while the list is open, in multiple selection. Each toggle emits `igcPendingChange`, which you can cancel. Enter or the Apply button applies the changes with one `igcChange`. Any other close drops them. For a custom `footer`, use `pendingValue`, `commitSelection()` and `cancelSelection()`. New type: `ComboSelectionCommit`. [#2533](https://github.com/IgniteUI/igniteui-webcomponents/issues/2533) [#2545](https://github.com/IgniteUI/igniteui-webcomponents/pull/2545)
  - The `detail` of `igcClosing` and `igcClosed` gives the `trigger` of the close, for example `enter`, `escape`, `outside-click` or `apply`. New types: `IgcComboClosingEventArgs`, `ComboCloseTrigger`. [#2533](https://github.com/IgniteUI/igniteui-webcomponents/issues/2533) [#2545](https://github.com/IgniteUI/igniteui-webcomponents/pull/2545)
  - The group header template gets `key`, the `groupKey` value of the group. New types: `ComboGroupHeaderTemplate`, `ComboGroupHeaderContext`. [#2462](https://github.com/IgniteUI/igniteui-webcomponents/issues/2462) [#2468](https://github.com/IgniteUI/igniteui-webcomponents/pull/2468)
- #### Dropdown
  - The `header` and `footer` slots hold content before and after the items, outside the `listbox` role. Use them for a search field or action buttons. [#2531](https://github.com/IgniteUI/igniteui-webcomponents/issues/2531) [#2585](https://github.com/IgniteUI/igniteui-webcomponents/pull/2585)
- #### File input
  - `directory` lets the user select a folder. The selection holds all the files in the folder and its subfolders. `webkitRelativePath` gives the path of each file. [#2481](https://github.com/IgniteUI/igniteui-webcomponents/pull/2481)
- #### Form controls
  - `--ig-helper-min-lines` keeps space for `1`, `2` or `3` message lines below a control, so a validation message does not move the content below. Set it on a form to apply it to all its controls. The browser must support container style queries. [#2491](https://github.com/IgniteUI/igniteui-webcomponents/pull/2491)
- #### Host ARIA attributes
  - Button, Chip, Icon button: a host `aria-expanded`, `aria-haspopup` and `aria-controls` now go to the inner button or link. So assistive technology knows that the control opens a menu or a panel. A selectable chip keeps its `aria-pressed`. [#2513](https://github.com/IgniteUI/igniteui-webcomponents/issues/2513) [#2517](https://github.com/IgniteUI/igniteui-webcomponents/pull/2517) [#2581](https://github.com/IgniteUI/igniteui-webcomponents/pull/2581)
  - Button, Icon button: a host `aria-pressed` now goes to the native button, so the button can be a toggle button. A link does not get it. [#2474](https://github.com/IgniteUI/igniteui-webcomponents/pull/2474)
  - Date time input, File input, Input, Mask input, Textarea: a host `role="combobox"`, `aria-expanded`, `aria-haspopup`, `aria-autocomplete`, `aria-controls` and `aria-activedescendant` now go to the native field. Use them to make the field a combobox over your own listbox, for example in a command palette. Do not set `role` on a textarea, because HTML does not allow it. [#2548](https://github.com/IgniteUI/igniteui-webcomponents/pull/2548)
- #### Library
  - A component no longer defines its tag when another class already defines it, for example a second copy of the library on the page. It writes one warning to the console. [#2461](https://github.com/IgniteUI/igniteui-webcomponents/pull/2461)
- #### Localization
  - The color picker, dialog, splitter, tile and tooltip have `locale` and `resourceStrings`. Before, their default labels were English only. The English label of the color value input is now "Color value". [#2477](https://github.com/IgniteUI/igniteui-webcomponents/pull/2477) [#2480](https://github.com/IgniteUI/igniteui-webcomponents/pull/2480)
  - The chat and the tile manager have `locale`. The tile manager gives its locale to the tiles that have no `locale`. [#2475](https://github.com/IgniteUI/igniteui-webcomponents/pull/2475) [#2478](https://github.com/IgniteUI/igniteui-webcomponents/pull/2478)
- #### QR code
  - `copyToClipboard()` copies the code as a PNG image. With `format: 'svg'`, it copies an SVG image and a PNG image. `scale` multiplies the size. The promise resolves with the format that the clipboard got. Browsers allow the copy only during a user action. So call the method directly in the event handler, with no `await` before it. New types: `QrCodeCopyFormat`, `QrCodeCopyOptions`. [#2483](https://github.com/IgniteUI/igniteui-webcomponents/pull/2483)
- #### Tabs
  - `headerPosition` (`header-position`) puts the headers in a column on the `start` or `end` side of the panels. The default is `top`. In a column, Up and Down move between the tabs. Give the tabs a `height` or a `max-height` to scroll a tall panel and to show the scroll buttons. New type: `TabsHeaderPosition`. [#2553](https://github.com/IgniteUI/igniteui-webcomponents/issues/2553) [#2556](https://github.com/IgniteUI/igniteui-webcomponents/pull/2556)
  - Link tabs: a tab with `href` renders its header as a link. A plain click, Enter or Space selects the tab, emits `igcChange` and `igcNavigate`, and follows the link. Cancel `igcNavigate` to route on the client. A middle click, Ctrl/Cmd+click and Ctrl/Cmd+Enter open the link in a new browser tab and do not change the selection. `target` and `rel` go to the link. [#2497](https://github.com/IgniteUI/igniteui-webcomponents/pull/2497)
  - The `header-background` theme token paints the full header strip. Until you set it, it follows `item-background`. The `tabs-theme` function of `igniteui-theming` 29.1.0 has the matching `$header-background` parameter. [#2431](https://github.com/IgniteUI/igniteui-webcomponents/pull/2431)
- #### Text selection
  - The date picker, date time input, input, mask input and textarea have read-only `selectionStart` and `selectionEnd`. In the input, both are `null` for the `email` and `number` types, as in the native input. [#2451](https://github.com/IgniteUI/igniteui-webcomponents/pull/2451) [#2452](https://github.com/IgniteUI/igniteui-webcomponents/pull/2452)
- #### Theming
  - Four export conditions keep only one theme in your bundle: `igc-theme-material`, `igc-theme-bootstrap`, `igc-theme-indigo` and `igc-theme-fluent`. Set one in your bundler or with `node --conditions`. The bundle is then approximately 15–17% smaller after gzip. With a theme that is not in the bundle, `configureTheme()` gives only the structural styles. See "Bundling a single theme" in the README. [#2461](https://github.com/IgniteUI/igniteui-webcomponents/pull/2461)
- #### Tile manager
  - `--grid-padding` sets the padding of the grid. The default is `1.25rem`. Use it, not a padding on the `base` part, so that the resize handles stay inside the tiles. [#2501](https://github.com/IgniteUI/igniteui-webcomponents/pull/2501)
- #### Tooltip
  - `showAt()` shows the tooltip at a point or a rectangle, in viewport coordinates. For example, `tooltip.showAt({ x: event.clientX, y: event.clientY })` shows it at the pointer over a canvas. Call it again to move the tooltip. The application shows and hides the tooltip, and Escape still closes it. After it closes, `anchor` applies again. New type: `TooltipRect`. [#2538](https://github.com/IgniteUI/igniteui-webcomponents/issues/2538) [#2561](https://github.com/IgniteUI/igniteui-webcomponents/pull/2561)

### Changed
- #### Avatar, Badge, Carousel
  - The avatar, the badge and the carousel slide no longer set `aria-roledescription`. Screen readers now announce their role in the language of the user, not the English words "avatar", "badge" and "slide". To set a role description, add an `aria-roledescription` attribute. The carousel keeps its role description, from the `carousel_role_description` resource string. [#2472](https://github.com/IgniteUI/igniteui-webcomponents/pull/2472) [#2477](https://github.com/IgniteUI/igniteui-webcomponents/pull/2477)
- #### Calendar, Chat, Color picker, Combo
  - **Behavioral change:** The events of inner components no longer leave the component. Listen to the events of the component. [#2530](https://github.com/IgniteUI/igniteui-webcomponents/issues/2530) [#2545](https://github.com/IgniteUI/igniteui-webcomponents/pull/2545) [#2568](https://github.com/IgniteUI/igniteui-webcomponents/pull/2568)
    - Chat: use `igcInputChange`, not `igcInput` or `igcChange` of the text area. Use `igcAttachmentRemoved`, not `igcRemove` of the attachment chip.
    - Combo: use `igcSearchInput`, not `igcInput` of the inputs. A listener on the combo no longer gets a second `igcChange` from the search input. For more data on scroll, use `igcDataRequest` of the combo in remote mode, not the events of the inner list.
    - Color picker: the `igcInput` of its inputs and the open and close events of its format select stay inside.
    - Calendar: the internal `igcActiveDateChange` and `igcRangePreviewDateChange` stay inside, also in the date pickers.
- #### Carousel
  - **Behavioral change:** The carousel takes the height of its tallest slide, so the text of a slide no longer overflows. Before, it took the height of its parent, at least 240px. A `height` or `max-height` on the carousel, or a height from its parent, still sets the height. Set a height to keep the page stable when slide content loads late. An image that is a direct child of a slide does not add height. [#2550](https://github.com/IgniteUI/igniteui-webcomponents/pull/2550)
- #### Chat
  - The message area follows the newest message only while it is at the bottom. When the user scrolls up, new messages do not move it. A new message of the current user, or a new conversation, scrolls to the bottom again. At the bottom, the area also stays there when content grows late. [#2461](https://github.com/IgniteUI/igniteui-webcomponents/pull/2461) [#2474](https://github.com/IgniteUI/igniteui-webcomponents/pull/2474) [#2594](https://github.com/IgniteUI/igniteui-webcomponents/pull/2594)
  - The Markdown renderer of `igniteui-webcomponents/extras` does less work. It loads shiki only when syntax highlighting is on, and it loads only the themes that it uses. While a message streams, it highlights each finished code block one time. Renderers with the same languages and themes share one highlighter. A code block of more than 2 KB that still streams shows as plain code until its closing fence. [#2494](https://github.com/IgniteUI/igniteui-webcomponents/pull/2494)
  - The Markdown renderer opens links to another origin in a new tab, with `rel="noopener noreferrer"`. Links in the same origin, such as `/register` or `#top`, and `mailto:` links open in the same tab, so the application can route them. Before, the result depended on the sanitizer. [#2494](https://github.com/IgniteUI/igniteui-webcomponents/pull/2494) [#2500](https://github.com/IgniteUI/igniteui-webcomponents/pull/2500)
  - `colorReplacements` of the Markdown renderer applies to every theme, not only to the GitHub themes. [#2494](https://github.com/IgniteUI/igniteui-webcomponents/pull/2494)
- #### Chat, List, Tree
  - Tree items, list items and chat messages that are far from the view skip their rendering (`content-visibility: auto`). Long lists render faster. For example, the first render of a tree with 2,000 items takes 41% less time. [#2594](https://github.com/IgniteUI/igniteui-webcomponents/pull/2594)
    - In a container that takes its width from its content, the width follows the items near the view. It can change while the user scrolls.
    - `innerText` of a skipped item is an empty string. Use `textContent`.
    - In Safari before 26, find-in-page does not find the text of a skipped item.
    - To render every item, set `content-visibility: visible` on `igc-tree-item`, on `igc-list-item` or on `igc-chat::part(message-item)`.
- #### Chip
  - The `end` slot renders after the `suffix` slot, at the end of the chip. Before, it rendered before the `suffix` slot. [#2488](https://github.com/IgniteUI/igniteui-webcomponents/pull/2488)
- #### Combo
  - **Behavioral change:** A new `data` keeps the selection. A selected item or value that `data` does not hold stays selected until the user or the application deselects it. To clear the selection with the data, for example in cascading combos, set `value` to `[]`. `select()` also accepts objects that `data` does not hold, for example the records of a saved filter. [#2519](https://github.com/IgniteUI/igniteui-webcomponents/issues/2519) [#2545](https://github.com/IgniteUI/igniteui-webcomponents/pull/2545)
  - In multiple selection, the options report their checkbox state in `aria-checked`, not in `aria-selected`. Screen readers announce them as checked or not checked. [#2535](https://github.com/IgniteUI/igniteui-webcomponents/issues/2535) [#2545](https://github.com/IgniteUI/igniteui-webcomponents/pull/2545)
  - **Behavioral change:** When `data` holds two or more items with the same value, the selection holds the first one, and `value` lists the value one time. Before, a selection of the value took all its items, and `value` listed it for each item. The options of all the items of a selected value show as selected, and a click on any of them deselects the value.
  - In TypeScript, `igcClosing` and `igcClosed` are `CustomEvent<IgcComboClosingEventArgs>`, not `CustomEvent<void>`. Change the handlers that declare `CustomEvent<void>`. [#2533](https://github.com/IgniteUI/igniteui-webcomponents/issues/2533) [#2545](https://github.com/IgniteUI/igniteui-webcomponents/pull/2545)
- #### Date picker, Date range picker, Date time input
  - **Behavioral change:** `igcChange` reports only the changes of the user. A value that code sets no longer emits `igcChange` on the next blur or on Done. This applies to `value`, `clear()`, `stepUp()`, `stepDown()`, `setRangeText()`, `select()` and a form reset. The `clear()` of the date pickers still emits it, because their clear icon calls it. [#2488](https://github.com/IgniteUI/igniteui-webcomponents/pull/2488) [#2489](https://github.com/IgniteUI/igniteui-webcomponents/pull/2489) [#2580](https://github.com/IgniteUI/igniteui-webcomponents/pull/2580)
- #### Date picker, Date range picker, Dialog
  - **Breaking change:** The dialog backdrop is now the native `::backdrop`, in the top layer. It covers the full page, also when an ancestor has a `transform`, a `filter` or a stacking context. It also covers a toast or a snackbar that opened before the dialog. [#2549](https://github.com/IgniteUI/igniteui-webcomponents/pull/2549)
    - Removed parts: `backdrop` and `animating` of the dialog, and `overlay` of the date pickers in dialog mode.
    - To style the backdrop, use `igc-dialog::part(base)::backdrop`, or `::part(dialog-base)::backdrop` on a date picker.
  - **Behavioral change:** In dialog mode, the date pickers fade in and out, as the dialog does. `igcOpened` and `igcClosed` come after the animation, and `open` stays `true` until the exit ends. A change of `open` from code still applies at once. [#2574](https://github.com/IgniteUI/igniteui-webcomponents/pull/2574)
- #### Date range picker
  - **Behavioral change:** In dialog mode, Done emits `igcChange` after `igcClosing`. Done and Cancel change the range only when the close continues. So a canceled `igcClosing` keeps the dialog open with the selected range. To ask for a confirmation before a close, restore the range through `value` when the user declines. [#2577](https://github.com/IgniteUI/igniteui-webcomponents/pull/2577)
  - **Behavioral change:** "Last 7 Days" selects 7 days: today and the 6 days before it. Before, it selected 8 days. [#2528](https://github.com/IgniteUI/igniteui-webcomponents/issues/2528) [#2540](https://github.com/IgniteUI/igniteui-webcomponents/pull/2540)
- #### Form controls
  - **Behavioral change:** Enter in a text field submits the form as in a native form. It clicks the first submit button of the form. So that button is the `submitter`, and a `click` listener can stop the submission. Before, Enter submitted the form with no submitter. [#2545](https://github.com/IgniteUI/igniteui-webcomponents/pull/2545) [#2586](https://github.com/IgniteUI/igniteui-webcomponents/pull/2586) [#2590](https://github.com/IgniteUI/igniteui-webcomponents/pull/2590)
    - The text fields are the input, mask input, date time input, date picker, date range picker, and the combo in single selection with its list closed. The combo in multiple selection does not submit, as a native `select`.
    - An `igc-button` with `type="submit"` counts as a submit button. A disabled first submit button blocks the submission.
    - A form without a submit button submits only when it has one text field.
    - The checkbox, radio and switch submit only through a submit button.
    - Enter does not submit when a `keypress` listener cancels it, or when it commits an IME composition.
- #### Highlight
  - **Behavioral change:** The match colors come only from `--background`, `--foreground`, `--background-active` and `--foreground-active` on the highlight. A match inside a list, a tree, a button or a nested highlight now shows the colors of the highlight. Before, it took the colors of that component. [#2554](https://github.com/IgniteUI/igniteui-webcomponents/pull/2554)
  - The highlight searches again when its content changes. You no longer call `search()` after a change. [#2572](https://github.com/IgniteUI/igniteui-webcomponents/pull/2572)
- #### Library
  - Dependencies:
    - New runtime dependency: `tslib`. [#2461](https://github.com/IgniteUI/igniteui-webcomponents/pull/2461)
    - `igniteui-i18n-core` 2.0. If you register languages from `igniteui-i18n-resources`, update it to 2.0 too. [#2474](https://github.com/IgniteUI/igniteui-webcomponents/pull/2474) [#2477](https://github.com/IgniteUI/igniteui-webcomponents/pull/2477) [#2595](https://github.com/IgniteUI/igniteui-webcomponents/pull/2595)
    - The optional peer dependency `shiki` must be 4.5.0 or later. [#2575](https://github.com/IgniteUI/igniteui-webcomponents/pull/2575)
    - `marked-shiki` is no longer a peer dependency. You can remove it. [#2494](https://github.com/IgniteUI/igniteui-webcomponents/pull/2494)
    - The themes are built with `igniteui-theming` 30.2.0. The built-in palettes keep their colors. [#2487](https://github.com/IgniteUI/igniteui-webcomponents/pull/2487) [#2570](https://github.com/IgniteUI/igniteui-webcomponents/pull/2570) [#2576](https://github.com/IgniteUI/igniteui-webcomponents/pull/2576)
  - Bundle size:
    - All the components together are approximately 6% smaller after gzip. The components share their common styles, and the dark themes hold only the values that are different from the light themes. [#2461](https://github.com/IgniteUI/igniteui-webcomponents/pull/2461)
    - The carousel, chat, chip, combo, file input and tree no longer bundle the date formatter of `igniteui-i18n-core`. Each one is approximately 7 KB smaller after minification. [#2475](https://github.com/IgniteUI/igniteui-webcomponents/pull/2475)
    - The styles no longer have vendor prefixes for KaiOS, Opera Mini, UC Browser and QQ Browser. The library does not support these browsers. [#2461](https://github.com/IgniteUI/igniteui-webcomponents/pull/2461)
- #### Localization
  - **Behavioral change:** A component without `locale` now inherits the locale. It uses its own `lang`, then the `locale` or `lang` of the nearest ancestor, then the global locale. The search goes up through shadow roots, but not through slots. For example, `<section lang="it">` gives the Italian locale to the components in it. [#2478](https://github.com/IgniteUI/igniteui-webcomponents/pull/2478) [#2493](https://github.com/IgniteUI/igniteui-webcomponents/pull/2493)
    - If you set `lang` on `<body>` or on another element below `<html>`, the components in it now use that `lang`, not the language from `setCurrentI18n()`. Set `locale` on a component to keep a different locale.
    - Server-side rendering cannot see the ancestors. Set `locale` on a server-rendered component that must not use the global locale.
    - This applies to the calendar, carousel, chat, chip, color picker, combo, date picker, date range picker, date time input, dialog, file input, splitter, tile, tile manager, tooltip and tree.
  - The components no longer register their English strings with `igniteui-i18n-core`. `getCurrentResourceStrings()` now returns only the strings that you register. [#2476](https://github.com/IgniteUI/igniteui-webcomponents/pull/2476)
  - In TypeScript, the core strings in `resourceStrings` of the date picker and the date range picker are `string`, not `string | undefined`. [#2475](https://github.com/IgniteUI/igniteui-webcomponents/pull/2475)
- #### Navigation drawer
  - **Behavioral change:** In Firefox and Safari, a drawer at an edge position slides out and its backdrop fades out, as in Chromium. `hide()` and `toggle()` resolve, and `igcClosed` comes, after the exit. `open` still changes at once. With reduced motion, the drawer changes at once. [#2578](https://github.com/IgniteUI/igniteui-webcomponents/pull/2578)
- #### Snackbar, Toast
  - The display time pauses while the pointer or the keyboard focus is on the component. It starts again in full when both leave. A click on the action does not keep the component open. [#2447](https://github.com/IgniteUI/igniteui-webcomponents/pull/2447)
  - `show()` on an open component starts the display time again. [#2447](https://github.com/IgniteUI/igniteui-webcomponents/pull/2447)
- #### Splitter
  - **Behavioral change:** A change of `orientation` keeps the sizes and the minimum and maximum sizes that you set. Only the sizes from a drag, a key or a collapse go back to the default. The minimum and maximum sizes now also apply on the new axis, so change them together with the orientation when they are different. [#2527](https://github.com/IgniteUI/igniteui-webcomponents/pull/2527)
  - Each pane has its own stacking context, so slotted content with any `z-index` stays under the focus ring of the bar. [#2567](https://github.com/IgniteUI/igniteui-webcomponents/pull/2567)
- #### Tabs
  - With `prefers-reduced-motion: reduce`, the header strip scrolls at once. The scroll buttons also follow a `scroll-behavior` on the `tabs` part. [#2579](https://github.com/IgniteUI/igniteui-webcomponents/pull/2579)
  - Changes inside a panel no longer make the tabs measure all the headers. [#2497](https://github.com/IgniteUI/igniteui-webcomponents/pull/2497)
- #### Textarea
  - With `resize="auto"`, a browser that supports CSS `field-sizing` sizes the control to its content. Other browsers measure the height as before. [#2479](https://github.com/IgniteUI/igniteui-webcomponents/pull/2479)
    - The control uses the content box. So a `max-height` or `max-block-size` on the `input` part no longer includes the padding and the border. Subtract them from your value, or give the maximum in lines, for example `max-block-size: 8lh`.
    - In a shrink-to-fit layout, such as a flex item with no width, the control is approximately 20 characters wide.
- #### Theming
  - **Breaking change:** The components take their surface color from `--ig-surface-base`, not from `--ig-surface-500`. The themes also define `--ig-surface-raised`, `--ig-surface-overlay`, `--ig-surface-sunken` and `--ig-surface-container`. To change the surface at runtime, set these surface roles. `--ig-surface-500` has no effect on the components. [#2487](https://github.com/IgniteUI/igniteui-webcomponents/pull/2487)
  - A theme change updates only the components that render differently for each theme. A `configureTheme()` call with the active theme and variant does nothing. [#2461](https://github.com/IgniteUI/igniteui-webcomponents/pull/2461)
  - The component styles no longer declare `--ig-theme` and `--ig-theme-variant`. The library reads them from the document root only. [#2461](https://github.com/IgniteUI/igniteui-webcomponents/pull/2461)
- #### Tile manager
  - **Behavioral change:** A tile no longer spans past the last column. A tile that starts after the last column moves back so that its span fits. `colSpan` and `colStart` keep the values that you set at every column count. So one layout works for all column counts, and `saveLayout()` returns your values. A `--column-count` from a style sheet must be a whole number, and `initial` gives the responsive layout. [#2496](https://github.com/IgniteUI/igniteui-webcomponents/pull/2496) [#2565](https://github.com/IgniteUI/igniteui-webcomponents/pull/2565)
  - **Behavioral change:** The tile manager no longer inherits `--column-count` and `--grid-gap` from an ancestor. Set them on the tile manager, for example `igc-tile-manager { --column-count: 2; }`. [#2565](https://github.com/IgniteUI/igniteui-webcomponents/pull/2565)
  - A tile is a region. The content of its `title` slot gives its name. An `aria-label` or `aria-labelledby` on the tile replaces that name. The default actions have names: "Maximize" or "Restore", and "Enter full screen" or "Exit full screen". In Chromium, the Tab order and the screen reader order follow the layout. [#2456](https://github.com/IgniteUI/igniteui-webcomponents/pull/2456) [#2477](https://github.com/IgniteUI/igniteui-webcomponents/pull/2477)
  - `igcTileDragEnd` and `igcTileDragCancel` are emitted after the tiles have their new positions, as `igcTileResizeEnd` is. So a handler can call `saveLayout()` and `loadLayout()`. [#2456](https://github.com/IgniteUI/igniteui-webcomponents/pull/2456)
  - The content container fills the tile under the header. So content with `block-size: 100%`, such as a chart, takes the free height. You can remove the flex rules that you added on `::part(base)` or `::part(content-container)` for this. [#2496](https://github.com/IgniteUI/igniteui-webcomponents/pull/2496)
  - The default resize handles stand out of the tile through a negative margin. If you move them with `bottom`, `right` or `inset-inline-end` on the `trigger`, `trigger-side` or `trigger-bottom` part, also set `margin: 0`. [#2501](https://github.com/IgniteUI/igniteui-webcomponents/pull/2501)
  - A tile has a `view-transition-name` only during a view transition of its manager. If your own view transition moves tiles, give them a name for that transition. [#2566](https://github.com/IgniteUI/igniteui-webcomponents/pull/2566)
  - The content of a tile has its own stacking context. So the resize handles stay above content with any `z-index`. [#2566](https://github.com/IgniteUI/igniteui-webcomponents/pull/2566)

### Deprecated
- #### Combo
  - The `item` of the group header template. Use `key`. [#2462](https://github.com/IgniteUI/igniteui-webcomponents/issues/2462) [#2468](https://github.com/IgniteUI/igniteui-webcomponents/pull/2468)
- #### Theming
  - The numbered surface shades, such as `--ig-surface-500`. A future release of `igniteui-theming` removes them. Use the surface roles. [#2487](https://github.com/IgniteUI/igniteui-webcomponents/pull/2487)

### Fixed
- #### Accordion, Tabs
  - The arrow keys, Home and End skip a panel or a tab that does not render, such as one with the `hidden` attribute. [#2418](https://github.com/IgniteUI/igniteui-webcomponents/pull/2418) [#2497](https://github.com/IgniteUI/igniteui-webcomponents/pull/2497)
- #### AI-Assisted Development
  - The `igniteui-wc-migrate-grid-lite-to-premium` skill shows a correct custom sort strategy for the Premium Grid. [#2407](https://github.com/IgniteUI/igniteui-webcomponents/pull/2407)
- #### Banner
  - The banner stays inside its container. A closed banner takes no space in a column flex container, and the banner is never wider than its container. [#2543](https://github.com/IgniteUI/igniteui-webcomponents/issues/2543) [#2546](https://github.com/IgniteUI/igniteui-webcomponents/pull/2546)
- #### Banner, Dialog, Expansion panel, Snackbar, Toast, Tooltip
  - A change of `open` during a running `show()`, `hide()` or animation now ends it, and the component keeps the new state. The running method resolves `false`. Before, the end of the animation replaced the new state. [#2447](https://github.com/IgniteUI/igniteui-webcomponents/pull/2447) [#2549](https://github.com/IgniteUI/igniteui-webcomponents/pull/2549) [#2571](https://github.com/IgniteUI/igniteui-webcomponents/pull/2571)
    - Dialog, Snackbar, Toast: `open` stays `true` during the exit. To keep the component open, set `open` to `false` and then to `true`.
    - Snackbar, Toast: `show()` and `toggle()` during the fade-out keep the component open.
    - Tooltip: when the pointer leaves the anchor during the show animation, the animation ends at once. The pointer can then move onto the tooltip to keep it open.
- #### Button, Icon button
  - A button with `href` keeps the link role. [#2421](https://github.com/IgniteUI/igniteui-webcomponents/pull/2421)
  - A disabled link renders a disabled native `<button>` with `role="link"`. It leaves the tab order and cannot navigate. While the link is disabled, the `base` part is this `<button>`. [#2421](https://github.com/IgniteUI/igniteui-webcomponents/pull/2421)
  - The form action of a `submit` or `reset` button runs after the `click` listeners, as in a native button. So a listener can stop it. [#2590](https://github.com/IgniteUI/igniteui-webcomponents/pull/2590)
  - Setting `commandfor` on a detached button no longer throws an error. The change applies when the button is attached. [#2592](https://github.com/IgniteUI/igniteui-webcomponents/pull/2592)
- #### Button group, Stepper
  - The arrow keys that the orientation does not use are no longer canceled, so the page can scroll with them. [#2556](https://github.com/IgniteUI/igniteui-webcomponents/pull/2556)
- #### Calendar
  - A calendar without `activeDate` renders one time. Before, it rendered two times, and Lit in development mode showed a warning. [#2423](https://github.com/IgniteUI/igniteui-webcomponents/pull/2423)
- #### Card
  - In the dark Bootstrap theme, the last card content has its bottom padding. [#2461](https://github.com/IgniteUI/igniteui-webcomponents/pull/2461)
  - Header text that does not fit on one line wraps next to the thumbnail, not under it. [#2551](https://github.com/IgniteUI/igniteui-webcomponents/pull/2551)
- #### Carousel
  - An icon in the `previous-button` or `next-button` slot gets the arrow color tokens of the theme. [#2550](https://github.com/IgniteUI/igniteui-webcomponents/pull/2550)
- #### Chat
  - The chat creates one object URL for each attached file and revokes it when the attachment goes. Before, the memory use increased with each render. [#2461](https://github.com/IgniteUI/igniteui-webcomponents/pull/2461)
  - An attachment with an image MIME type, such as `image/png`, renders as an image. [#2474](https://github.com/IgniteUI/igniteui-webcomponents/pull/2474)
  - The file picker attaches only the files that `acceptedFiles` allows. A pick or a drop that adds no file does not emit `igcAttachmentAdded`. [#2474](https://github.com/IgniteUI/igniteui-webcomponents/pull/2474)
  - Keyboard users can get to the attachment header in a message. Enter and Space emit `igcAttachmentClick`. [#2474](https://github.com/IgniteUI/igniteui-webcomponents/pull/2474)
  - The message actions and the input controls take their names from resource strings, such as the `chat_reaction_*` strings and `chat_send_message`. Like and dislike report their state with `aria-pressed`. The remove button of an attachment names the file, for example "Remove photo.png". [#2474](https://github.com/IgniteUI/igniteui-webcomponents/pull/2474)
  - Elements in the `suggestion` slot replace the default suggestions. Content in the `suggestions` or `suggestion` slot shows also without `options.suggestions`. [#2488](https://github.com/IgniteUI/igniteui-webcomponents/pull/2488) [#2489](https://github.com/IgniteUI/igniteui-webcomponents/pull/2489)
  - Markdown renderer of `igniteui-webcomponents/extras`: [#2494](https://github.com/IgniteUI/igniteui-webcomponents/pull/2494) [#2573](https://github.com/IgniteUI/igniteui-webcomponents/pull/2573)
    - A `theme` with only `light` or only `dark` uses the default theme for the other mode. A `theme` that pairs `none` with another theme gives valid colors.
    - The text of a link keeps its formatting, and the renderer escapes `href` and `title`.
    - A code block that cannot be highlighted shows as escaped text. Before, HTML in the code, such as `<b>`, rendered as elements.
    - The default GitHub themes use the `--shiki-purple`, `--shiki-dark-blue`, `--shiki-red`, `--shiki-blue`, `--shiki-green` and `--shiki-orange` variables in the two modes. Set a variable on the chat to change a color.
- #### Checkbox
  - The indicator icon is hidden from assistive technology. Before, each checkbox had an unnamed image next to it. [#2425](https://github.com/IgniteUI/igniteui-webcomponents/pull/2425)
- #### Chip
  - `focus()` and `blur()` work on the chip. The chip delegates the focus to its action control. [#2426](https://github.com/IgniteUI/igniteui-webcomponents/pull/2426)
- #### Circular progress, Linear progress
  - The percentage rounds to two decimals and is correct for a fractional `max`. The default `aria-valuetext` is the percentage that the label shows. [#2427](https://github.com/IgniteUI/igniteui-webcomponents/pull/2427)
  - With `prefers-reduced-motion: reduce`, the indeterminate animation runs at a third of its speed, and a new value shows at once. [#2545](https://github.com/IgniteUI/igniteui-webcomponents/pull/2545)
  - Circular progress: in forced colors mode, the ring has the text color and the track is `GrayText`. The element has the size of the ring, so a small ring is at the center of its parent. [#2545](https://github.com/IgniteUI/igniteui-webcomponents/pull/2545)
- #### Color picker
  - The initial `value` has the notation of `format`, also when the `value` attribute comes before `format`. [#2413](https://github.com/IgniteUI/igniteui-webcomponents/pull/2413)
  - The HSL saturation is no longer infinite for a very small saturation at full value. [#2409](https://github.com/IgniteUI/igniteui-webcomponents/pull/2409)
  - The hue and alpha slider tracks match the thumb positions, also in right-to-left layouts. [#2466](https://github.com/IgniteUI/igniteui-webcomponents/pull/2466)
- #### Color picker, Combo, Date picker, Date range picker, Dropdown, Select, Slider, Tooltip
  - In browsers without CSS anchor positioning, a popup stays at its anchor inside an ancestor with CSS `zoom`. It also stays at an anchor in a modal dialog while the page scrolls. [#2561](https://github.com/IgniteUI/igniteui-webcomponents/pull/2561)
- #### Color picker, Combo, Date picker, Date time input, Mask input
  - The keys that an IME uses, such as the Enter that commits a composition, no longer act in these components. [#2545](https://github.com/IgniteUI/igniteui-webcomponents/pull/2545)
- #### Color picker, Date picker, Date range picker, Select
  - A closed component no longer cancels Escape. So a parent popup, such as a dropdown, can close on the key. [#2545](https://github.com/IgniteUI/igniteui-webcomponents/pull/2545) [#2585](https://github.com/IgniteUI/igniteui-webcomponents/pull/2585)
- #### Combo
  - Arrow Down no longer closes the list or moves the focus to the search input when a search finds one match or none. [#2428](https://github.com/IgniteUI/igniteui-webcomponents/pull/2428)
  - A form reset clears the invalid styles of a required single-selection combo. [#2428](https://github.com/IgniteUI/igniteui-webcomponents/pull/2428)
  - The native input no longer has `aria-disabled`. [#2432](https://github.com/IgniteUI/igniteui-webcomponents/pull/2432)
  - Removing the `locale` attribute no longer throws a `TypeError`. [#2475](https://github.com/IgniteUI/igniteui-webcomponents/pull/2475)
  - When the list closes while it has the focus, the focus goes to the main input, not to the document. [#2533](https://github.com/IgniteUI/igniteui-webcomponents/issues/2533) [#2545](https://github.com/IgniteUI/igniteui-webcomponents/pull/2545)
  - `newValue` of `igcChange` has the same order as the `value` after the change. [#2533](https://github.com/IgniteUI/igniteui-webcomponents/issues/2533) [#2545](https://github.com/IgniteUI/igniteui-webcomponents/pull/2545)
  - A new `itemTemplate` or `groupHeaderTemplate` renders the open list again. [#2555](https://github.com/IgniteUI/igniteui-webcomponents/issues/2555) [#2557](https://github.com/IgniteUI/igniteui-webcomponents/pull/2557)
  - The deprecated `item` of the group header template follows a new `valueKey` or `displayKey`.
- #### Combo, Dropdown, Highlight, Select
  - Setting a property to its current value no longer resets the state. This fixes React and other frameworks that set every property on each render. [#2515](https://github.com/IgniteUI/igniteui-webcomponents/issues/2515) [#2516](https://github.com/IgniteUI/igniteui-webcomponents/issues/2516) [#2518](https://github.com/IgniteUI/igniteui-webcomponents/pull/2518) [#2523](https://github.com/IgniteUI/igniteui-webcomponents/pull/2523) [#2545](https://github.com/IgniteUI/igniteui-webcomponents/pull/2545) [#2572](https://github.com/IgniteUI/igniteui-webcomponents/pull/2572)
    - Combo: `singleSelect`, `disableFiltering` and `filteringOptions` no longer clear the search text or filter the items again. The same `value` no longer updates the combo.
    - Dropdown, Select: `selected` on an item no longer moves the active item.
    - Highlight: `searchText` and `caseSensitive` no longer move the active match back to the first match.
    - Select: `value` no longer moves the active item. When you remove the active item, the navigation goes back to the selected item.
- #### Combo, Dropdown, Select
  - Interactive content in the `header` and `footer` slots, and in the `empty` slot of the combo, keeps its keys while the list is open. A text field gets the typed text, the arrow keys, Home and End. A button gets Enter and Space. [#2529](https://github.com/IgniteUI/igniteui-webcomponents/issues/2529) [#2531](https://github.com/IgniteUI/igniteui-webcomponents/issues/2531) [#2532](https://github.com/IgniteUI/igniteui-webcomponents/issues/2532) [#2545](https://github.com/IgniteUI/igniteui-webcomponents/pull/2545) [#2585](https://github.com/IgniteUI/igniteui-webcomponents/pull/2585)
    - Tab and Shift+Tab move through this content. Past either end, Tab closes the list, as before.
    - Escape from this content closes the list only when the content does not use the key.
    - When the list closes with the focus in it, the focus goes back to the input or to the target.
    - In the select, the two slots are outside the `listbox` role, so they pass the accessibility audit. In the dropdown, put this content in the new `header` and `footer` slots.
- #### Date picker, Date range picker
  - In dialog mode, a canceled `igcClosing` keeps the dialog open. An outside click commits the range only when the close continues. [#2574](https://github.com/IgniteUI/igniteui-webcomponents/pull/2574)
  - Enter in the content of the `prefix` or `suffix` slot no longer submits the form a second time. [#2590](https://github.com/IgniteUI/igniteui-webcomponents/pull/2590)
  - Date picker: in a dropdown that is not editable, a selection in the calendar emits one `igcChange`, not two. [#2489](https://github.com/IgniteUI/igniteui-webcomponents/pull/2489)
- #### Date picker, Date time input
  - `stepUp()` and `stepDown()` update `value` and the form value at once, also while the input has the focus. A step of a part that is not in the input format no longer goes away on blur. The arrow keys and the mouse wheel still change only the text until blur. [#2488](https://github.com/IgniteUI/igniteui-webcomponents/pull/2488) [#2489](https://github.com/IgniteUI/igniteui-webcomponents/pull/2489)
- #### Date range picker
  - The predefined ranges use the date of the click, not the date of the first render. [#2540](https://github.com/IgniteUI/igniteui-webcomponents/pull/2540)
  - A change of `mode` no longer sets `keepOpenOnSelect`. [#2488](https://github.com/IgniteUI/igniteui-webcomponents/pull/2488)
  - A `min` or `max` that you set before the first render no longer throws a `TypeError`. [#2409](https://github.com/IgniteUI/igniteui-webcomponents/pull/2409)
- #### Date range picker, Date time input, Mask input
  - The editors reject an astral character, such as an emoji, as input and as a prompt. A mask or an input format with an astral literal edits at the correct positions. [#2409](https://github.com/IgniteUI/igniteui-webcomponents/pull/2409)
  - Mask input: an empty value is not a bad input. Only `required` makes an empty control invalid. A value that fits no position of a letter mask, such as `12` for `LLL`, is a bad input. [#2409](https://github.com/IgniteUI/igniteui-webcomponents/pull/2409)
  - Date range picker, Date time input: [#2409](https://github.com/IgniteUI/igniteui-webcomponents/pull/2409)
    - Mask flags in the input format, such as `A` or `0`, stay literal. So do the letters of a range separator, such as the `t` of `' to '`.
    - A `yyyy` year of three or four typed digits stays as typed, so `0049` is the year 49. One or two typed digits still give a year from 1950 to 2049.
    - A `y` or `yyy` year format widens to four characters.
- #### Date time input
  - An empty input without the focus no longer has the `filled` part. [#2580](https://github.com/IgniteUI/igniteui-webcomponents/pull/2580)
- #### Dialog
  - `hide()` in the same task as `show()` closes the dialog at once. [#2574](https://github.com/IgniteUI/igniteui-webcomponents/pull/2574)
  - A dialog that you move, or remove and append again, keeps its state. An open dialog is modal again, with its backdrop, and a closed dialog stays closed. This also applies to the date pickers in dialog mode. [#2577](https://github.com/IgniteUI/igniteui-webcomponents/pull/2577)
  - An `aria-label` on the dialog is its only accessible name. [#2429](https://github.com/IgniteUI/igniteui-webcomponents/pull/2429)
  - When the browser closes the dialog while `open` stays `true`, the dialog opens again. An example is a second Escape after a canceled `igcClosing`. [#2441](https://github.com/IgniteUI/igniteui-webcomponents/pull/2441)
- #### File input
  - In the Bootstrap, Fluent and Indigo themes, a long file name ends with an ellipsis again. [#2384](https://github.com/IgniteUI/igniteui-webcomponents/issues/2384) [#2411](https://github.com/IgniteUI/igniteui-webcomponents/pull/2411)
  - An empty string in `value` clears the form value and updates the validity. [#2481](https://github.com/IgniteUI/igniteui-webcomponents/pull/2481)
- #### Focus
  - `focus()` right after a component connects moves the focus to the component after its first render, as on a native control. Before, the call did nothing, and in the checkbox, radio, select and switch it threw a `TypeError`. [#2569](https://github.com/IgniteUI/igniteui-webcomponents/pull/2569)
    - This applies to the button, carousel, checkbox, chip, color picker, combo, date picker, date range picker, date time input, file input, icon button, input, mask input, radio, range slider, rating, select, slider, switch, textarea and toggle button.
- #### Form controls
  - A failed submit or `form.reportValidity()` moves the focus to the first invalid control, as for native controls. For this, the library wraps `checkValidity()`, `reportValidity()` and `requestSubmit()` of `HTMLFormElement.prototype`. [#2430](https://github.com/IgniteUI/igniteui-webcomponents/pull/2430)
  - The controls send `invalid` only from `checkValidity()`, `reportValidity()` or a failed submit, not while the user edits. [#2430](https://github.com/IgniteUI/igniteui-webcomponents/pull/2430)
  - `focus()` and `blur()` work in the rating, slider and range slider. [#2448](https://github.com/IgniteUI/igniteui-webcomponents/pull/2448)
  - The asterisk of a required control is no longer part of its accessible name. [#2428](https://github.com/IgniteUI/igniteui-webcomponents/pull/2428)
  - The date picker, date range picker, date time input and mask input set `aria-required` on each native input. [#2432](https://github.com/IgniteUI/igniteui-webcomponents/pull/2432)
  - A click on a button below a control works also when the control shows or hides a validation message on blur. [#2491](https://github.com/IgniteUI/igniteui-webcomponents/pull/2491)
- #### Hidden ancestors
  - Components hide at the same time as a hidden ancestor, such as a carousel slide that goes out of view. Before, some stayed visible for the length of their transition. The active slide and indicator of a carousel and the selected indicator of the tabs also hide. [#2552](https://github.com/IgniteUI/igniteui-webcomponents/pull/2552)
  - After an orientation change, the splitter bar takes its new size at once. [#2552](https://github.com/IgniteUI/igniteui-webcomponents/pull/2552)
- #### Highlight
  - A space in `searchText` matches any sequence of whitespace, such as a line break. [#2430](https://github.com/IgniteUI/igniteui-webcomponents/pull/2430)
  - A `searchText` or `caseSensitive` that you set before the first render runs the search. [#2572](https://github.com/IgniteUI/igniteui-webcomponents/pull/2572)
- #### Host ARIA attributes
  - A host `aria-label`, `aria-labelledby` and `aria-describedby` name and describe the inner element that has the role. A change of these attributes applies at once. [#2414](https://github.com/IgniteUI/igniteui-webcomponents/pull/2414) [#2432](https://github.com/IgniteUI/igniteui-webcomponents/pull/2432) [#2449](https://github.com/IgniteUI/igniteui-webcomponents/pull/2449)
    - This applies to the button, icon button, button group, chip, dialog, expansion panel, navigation drawer, QR code, splitter, stepper, tabs and tree, and to `aria-describedby` of the form controls.
    - Button, Icon button: a `<label>` for the button also names it, and an `igc-tooltip` on it describes it.
    - Dialog: the host `aria-labelledby` has priority over `aria-label` and the title.
    - Splitter: the bars of nested splitters no longer have the same name.
- #### Icon
  - The SVG is hidden from assistive technology, because the host has the name. A change of `aria-label` or `aria-labelledby` updates the role. [#2432](https://github.com/IgniteUI/igniteui-webcomponents/pull/2432)
- #### Input
  - `pattern` must match the full value, as in a native input. So `[0-9]{3}` no longer accepts `1234`. An invalid pattern sets no constraint. [#2432](https://github.com/IgniteUI/igniteui-webcomponents/pull/2432)
  - In the Material theme, the floated label of an outlined search field stays inside the box. [#2526](https://github.com/IgniteUI/igniteui-webcomponents/pull/2526)
- #### Library
  - The custom elements manifest no longer lists an event without a name, or chat events on the chat input. [#2488](https://github.com/IgniteUI/igniteui-webcomponents/pull/2488)
  - A server-rendered component with slotted content hydrates without an error and shows its slotted content. [#2580](https://github.com/IgniteUI/igniteui-webcomponents/pull/2580)
- #### List
  - `igc-list-header` has the `listitem` role, not `separator`, so screen readers read its text. Put a heading in the header, so that users can move from group to group. [#2439](https://github.com/IgniteUI/igniteui-webcomponents/pull/2439)
  - The title container of `igc-list-item` is a `div`, not a `header`. So browsers no longer expose a section header in each item. [#2439](https://github.com/IgniteUI/igniteui-webcomponents/pull/2439)
- #### Localization
  - A change of the global locale updates the chat labels, the combo group sort order, the tree item labels, and a date time input that was outside the document. [#2474](https://github.com/IgniteUI/igniteui-webcomponents/pull/2474) [#2475](https://github.com/IgniteUI/igniteui-webcomponents/pull/2475)
  - The calendar, date picker, date range picker and chat resolve every core resource string. Before, the newer strings were `undefined`. [#2474](https://github.com/IgniteUI/igniteui-webcomponents/pull/2474)
  - The date pickers give the calendar strings of `resourceStrings` to their calendar. [#2475](https://github.com/IgniteUI/igniteui-webcomponents/pull/2475)
  - English strings that you register with `registerI18n(strings, 'en-US')` before the first component apply. [#2476](https://github.com/IgniteUI/igniteui-webcomponents/pull/2476)
  - `validationMessage` of the form controls uses the strings, the number format and the date format of the locale. Before, it was always in English, and the date range picker showed "[object Object]". [#2492](https://github.com/IgniteUI/igniteui-webcomponents/pull/2492)
- #### Navigation drawer
  - When a drawer with a `mini` variant closes, the focus goes back to the element that had it when the drawer opened. [#2440](https://github.com/IgniteUI/igniteui-webcomponents/pull/2440)
  - When the browser closes the dialog of a drawer that stays open, the drawer opens the dialog again. [#2440](https://github.com/IgniteUI/igniteui-webcomponents/pull/2440)
  - In the Material theme, the item highlight shows in a drawer with `position="relative"`. [#2499](https://github.com/IgniteUI/igniteui-webcomponents/pull/2499)
  - Content with `position: fixed` in a `top` or `bottom` drawer, or in the mini variant, is placed against the viewport. [#2578](https://github.com/IgniteUI/igniteui-webcomponents/pull/2578)
- #### QR code
  - Codes of versions 30 to 40 agree with ISO/IEC 18004. The `M` level uses the correct data codeword counts, and versions 31 and 32 have their alignment patterns at the correct positions. Before, a scanner could fail to read these codes. [#2409](https://github.com/IgniteUI/igniteui-webcomponents/pull/2409) [#2461](https://github.com/IgniteUI/igniteui-webcomponents/pull/2461)
  - Without `error-level`, a logo that is too large for level `M` raises the error correction level, as documented. [#2414](https://github.com/IgniteUI/igniteui-webcomponents/pull/2414)
  - The logo in an exported SVG also has `xlink:href`, so SVG 1.1 tools, such as Illustrator, show it. [#2414](https://github.com/IgniteUI/igniteui-webcomponents/pull/2414)
  - `toImage()` reads `size` after pending changes render. [#2483](https://github.com/IgniteUI/igniteui-webcomponents/pull/2483)
  - A value that does not fit renders nothing and writes a warning to the console. `toBlob()` and `toImage()` reject with the reason. A `version` that is not a whole number from 1 to 40 selects the version automatically. [#2488](https://github.com/IgniteUI/igniteui-webcomponents/pull/2488)
- #### Radio group
  - In the horizontal alignment, the helper text and the validation messages show under the radios, each in its own row. [#2442](https://github.com/IgniteUI/igniteui-webcomponents/pull/2442)
- #### Range slider, Slider
  - Values: [#2433](https://github.com/IgniteUI/igniteui-webcomponents/issues/2433) [#2434](https://github.com/IgniteUI/igniteui-webcomponents/issues/2434) [#2438](https://github.com/IgniteUI/igniteui-webcomponents/pull/2438) [#2445](https://github.com/IgniteUI/igniteui-webcomponents/pull/2445)
    - A value snaps to the nearest step, counted from `min`, as in a native range input. A value on a fractional step, such as 0.5 with `step="0.01"`, stays where it is.
    - The order of `value`, `lower`, `upper`, `min`, `max` and `step` no longer changes the result. When `min` ends above `max`, the slider keeps the previous `min` and `max`.
    - A negative `step` keeps the previous step.
    - Removing `lower-bound` or `upper-bound` unsets the bound.
    - `upper` of the range slider follows `upperBound` until you set it, so the default range covers the full scale. A `lower` above `upper` swaps the two values.
    - When the `igc-slider-label` elements go, `min`, `max` and `step` go back to your values.
  - Interaction: [#2438](https://github.com/IgniteUI/igniteui-webcomponents/pull/2438)
    - The keyboard emits no `igcInput` or `igcChange` when the value stays the same. A drag emits one `igcChange`. A right click or a second pointer no longer moves a thumb.
    - Each thumb of the range slider announces its own value. The host `aria-label` and `aria-labelledby` name the group of the two thumbs.
    - The thumb label is in the top layer, so a container that clips its overflow does not cut it. It also shows on keyboard focus, and Escape hides it.
  - The box of the slider holds the ticks and their labels, so a slider with tick labels is taller. You can remove the space that you added for the labels. A tick label stays on one line. [#2445](https://github.com/IgniteUI/igniteui-webcomponents/pull/2445)
- #### Select
  - In forced colors mode, the list has a border. [#2488](https://github.com/IgniteUI/igniteui-webcomponents/pull/2488)
- #### Snackbar, Toast
  - `container` positioning no longer moves the component to the start of the container in the tab order. [#2447](https://github.com/IgniteUI/igniteui-webcomponents/pull/2447)
  - A component that moves while it is open shows again in its new place, with a full display time. [#2447](https://github.com/IgniteUI/igniteui-webcomponents/pull/2447)
  - The default action of the snackbar shows the keyboard focus style in every theme. [#2447](https://github.com/IgniteUI/igniteui-webcomponents/pull/2447)
- #### Splitter
  - The bar no longer has the English description "Start pane expanded and End pane expanded". Its value tells which pane is collapsed. [#2449](https://github.com/IgniteUI/igniteui-webcomponents/pull/2449)
- #### Stacking order
  - The `z-index` values of the parts stay inside each component, so they no longer compete with the layers of the page. For example, the tab labels no longer show through a sticky page header with `z-index: 1`. Slotted content with a `z-index` also stays inside. [#2499](https://github.com/IgniteUI/igniteui-webcomponents/pull/2499)
    - This applies to the button group, carousel, checkbox, color picker, date range picker, date time input, file input, input, mask input, navigation drawer with `position="relative"`, radio, splitter, stepper, switch, tabs, textarea and tile manager.
- #### Stepper
  - A click in the content of a step no longer activates the step. A click on a header of a nested stepper no longer changes the outer stepper. [#2453](https://github.com/IgniteUI/igniteui-webcomponents/pull/2453)
  - The content of an inactive step is `inert`, so Tab and screen readers skip it. [#2453](https://github.com/IgniteUI/igniteui-webcomponents/pull/2453)
  - The header of a disabled step, or of a step that linear mode locks, has `aria-disabled`. [#2453](https://github.com/IgniteUI/igniteui-webcomponents/pull/2453)
  - `navigateTo()` no longer activates a disabled step. [#2488](https://github.com/IgniteUI/igniteui-webcomponents/pull/2488)
  - Setting `active` activates the step at once. When several steps become active in one task, the last one is active. [#2547](https://github.com/IgniteUI/igniteui-webcomponents/pull/2547)
  - When an `igcActiveStepChanging` handler activates a step, the click stops and does not emit `igcActiveStepChanged`. [#2547](https://github.com/IgniteUI/igniteui-webcomponents/pull/2547)
  - `next()`, `prev()` and the arrow keys move from a disabled active step to its neighbors. `prev()` moves back from a step that linear mode locks. [#2547](https://github.com/IgniteUI/igniteui-webcomponents/pull/2547)
  - When all the steps are disabled, enabling a step activates the first enabled step. [#2547](https://github.com/IgniteUI/igniteui-webcomponents/pull/2547)
  - A control in the title or the subtitle of a step, such as a button, keeps its keys. [#2563](https://github.com/IgniteUI/igniteui-webcomponents/pull/2563)
- #### Tabs
  - `alignment` works in the Material, Fluent and Indigo themes. With `justify`, all the tabs have the same width, and a hidden tab leaves no space. [#2431](https://github.com/IgniteUI/igniteui-webcomponents/pull/2431) [#2556](https://github.com/IgniteUI/igniteui-webcomponents/pull/2556)
  - The Material and Fluent themes paint the full header strip. [IgniteUI/igniteui-angular#17421](https://github.com/IgniteUI/igniteui-angular/issues/17421) [#2431](https://github.com/IgniteUI/igniteui-webcomponents/pull/2431)
  - A tab that you select through its `selected` property scrolls into view inside the strip. A new selected tab that makes the strip overflow scrolls fully into view. [#2431](https://github.com/IgniteUI/igniteui-webcomponents/pull/2431)
  - The scroll buttons go away when the tabs fit again. [#2431](https://github.com/IgniteUI/igniteui-webcomponents/pull/2431)
  - A tab added as selected keeps the selection when the previous selected tab goes at the same time, as in a framework render. [#2446](https://github.com/IgniteUI/igniteui-webcomponents/pull/2446)
  - Tabs that you remove before their first frame no longer throw `Failed to execute 'observe' on 'ResizeObserver'`. [#2416](https://github.com/IgniteUI/igniteui-webcomponents/issues/2416) [#2467](https://github.com/IgniteUI/igniteui-webcomponents/pull/2467)
  - Tabs that another component projects through its slot: the keyboard works, and changes to the tabs apply. [#2497](https://github.com/IgniteUI/igniteui-webcomponents/pull/2497)
  - The selected indicator follows a change of size of a header and a change of direction. The scroll button arrows follow `dir="rtl"` on any ancestor. [#2497](https://github.com/IgniteUI/igniteui-webcomponents/pull/2497)
  - Changes made while the tabs are detached apply when they connect again. [#2497](https://github.com/IgniteUI/igniteui-webcomponents/pull/2497)
  - The tabs measure correctly under an ancestor with `zoom`. [#2497](https://github.com/IgniteUI/igniteui-webcomponents/pull/2497)
  - The strip no longer snaps to the edge of a tab when you scroll it by touch after a scroll button press. [#2497](https://github.com/IgniteUI/igniteui-webcomponents/pull/2497)
  - Tabs in a panel of `justify` tabs keep the width limit of a header. [#2556](https://github.com/IgniteUI/igniteui-webcomponents/pull/2556)
  - The scroll buttons and the selection of a hidden tab no longer scroll the strip. [#2556](https://github.com/IgniteUI/igniteui-webcomponents/pull/2556)
  - An element with `position: fixed` in the selected panel is placed against the viewport. [#2549](https://github.com/IgniteUI/igniteui-webcomponents/pull/2549)
- #### Text selection
  - In the input and the textarea, `setRangeText()` without `start` and `end` replaces the selected text, as the native method does. [#2432](https://github.com/IgniteUI/igniteui-webcomponents/pull/2432) [#2451](https://github.com/IgniteUI/igniteui-webcomponents/pull/2451)
  - In the date picker, the `start` and `end` parameters of `setRangeText()` are optional in TypeScript. [#2452](https://github.com/IgniteUI/igniteui-webcomponents/pull/2452)
- #### Textarea
  - A height that the user sets with the resize handle stays. [#2479](https://github.com/IgniteUI/igniteui-webcomponents/pull/2479)
  - A change of `minLength` or `maxLength` updates the validity at once. [#2461](https://github.com/IgniteUI/igniteui-webcomponents/pull/2461)
  - Whitespace in the default slot, such as the indentation around a helper text, no longer clears the value. [#2451](https://github.com/IgniteUI/igniteui-webcomponents/pull/2451)
  - `spellcheck` works as the native attribute: only `false` turns the spell check off. [#2451](https://github.com/IgniteUI/igniteui-webcomponents/pull/2451)
- #### Theming
  - The breadcrumbs, button and combo use their default sizes when `--ig-size-small`, `--ig-size-medium` and `--ig-size-large` are not registered, for example with a theme used only in a shadow root. [igniteui-theming#652](https://github.com/IgniteUI/igniteui-theming/issues/652) [#2544](https://github.com/IgniteUI/igniteui-webcomponents/pull/2544)
  - A theme change keeps the style sheets that other code adopted into the shadow root. [#2436](https://github.com/IgniteUI/igniteui-webcomponents/pull/2436)
- #### Tile manager
  - Focus and accessibility: [#2456](https://github.com/IgniteUI/igniteui-webcomponents/pull/2456)
    - Maximize and full screen keep the focus on the action.
    - While a tile is maximized, Tab skips the other tiles.
    - Screen readers no longer find a separator in each tile.
  - Maximize and full screen: [#2456](https://github.com/IgniteUI/igniteui-webcomponents/pull/2456)
    - Two quick clicks on the maximize action no longer cause an unhandled error.
    - When you remove a maximized tile, the manager releases the grid height that it kept for the tile.
    - `fullscreen` follows the browser, also after Escape or after a custom action calls `requestFullscreen()`. When the browser rejects a change, the tile emits an `igcTileFullscreen` with the real state, which you cannot cancel.
    - A fullscreen tile that you remove and add again is no longer `fullscreen`.
  - Touch: a maximized or fullscreen tile scrolls by touch. With `drag-mode="tile-header"`, the content scrolls by touch, and the native drag of images and links works. [#2456](https://github.com/IgniteUI/igniteui-webcomponents/pull/2456)
  - Drag and resize: [#2456](https://github.com/IgniteUI/igniteui-webcomponents/pull/2456) [#2565](https://github.com/IgniteUI/igniteui-webcomponents/pull/2565)
    - A drag swaps with the tile under the pointer also during a fast move. It no longer swaps with a tile that left the manager.
    - Escape after a drag restores every tile.
    - A drag or a resize cancels when the tile leaves the page or the browser sends `pointercancel`. The tile then emits `igcTileDragCancel` or `igcTileResizeCancel`. A second pointer no longer moves or ends the operation.
    - A resize works with a `grid-column` or `grid-row` from your CSS, with `min-row-height` and `min-column-width` in any CSS unit, and with a percentage `gap`.
    - In a right-to-left layout, the resize handles are on the left edge, and a drag reads the CSS `direction`.
    - The copy of the tile during a drag no longer acts as a second tile. Its form controls, frames and media do nothing.
    - A dragged tile keeps its size.
    - A drag gives an inline `user-select` back to the page body when it ends. A resize also stops text selection and touch scrolling.
  - Layout: [#2456](https://github.com/IgniteUI/igniteui-webcomponents/pull/2456) [#2565](https://github.com/IgniteUI/igniteui-webcomponents/pull/2565)
    - Tiles that move in the DOM, for example in a list that a framework sorts, keep their positions.
    - `loadLayout()` gives every tile a unique position.
    - A fractional `columnCount` is truncated to a whole number.
    - In a manager that is narrower than `minColumnWidth`, a responsive column takes the width of the manager.
  - Nested tile managers: [#2456](https://github.com/IgniteUI/igniteui-webcomponents/pull/2456) [#2457](https://github.com/IgniteUI/igniteui-webcomponents/pull/2457) [#2565](https://github.com/IgniteUI/igniteui-webcomponents/pull/2565)
    - An inner manager no longer takes the column count, the gap, the spans or the starts of the outer manager or tile.
    - A drag moves only the innermost tile, and it swaps only with the tiles of its own manager.
    - The swaps of a tile that holds a nested manager animate.
  - Previews and animations: [#2456](https://github.com/IgniteUI/igniteui-webcomponents/pull/2456)
    - The drag and resize previews render in the nearest modal dialog, fullscreen element or open popover. They cover the tile also when the page body is positioned or the page scrolls.
    - The maximize, restore and resize animations keep the content sharp. The animation rules are in the theme style sheets.
- #### Tooltip
  - An event in both `show-triggers` and `hide-triggers` emits `igcOpening` one time, not two. [#2561](https://github.com/IgniteUI/igniteui-webcomponents/pull/2561)
  - After a show at another target, the triggers of the anchor bind one time, not two. [#2561](https://github.com/IgniteUI/igniteui-webcomponents/pull/2561)
  - `show(target)` after a change of `anchor` in the same task shows the tooltip at the target. [#2561](https://github.com/IgniteUI/igniteui-webcomponents/pull/2561)
  - A tooltip that moves in the DOM still closes on Escape and hides when the pointer leaves it. A tooltip that you remove while it opens no longer takes the Escape key. [#2561](https://github.com/IgniteUI/igniteui-webcomponents/pull/2561)
  - Removing the `placement` attribute no longer throws an error. [#2561](https://github.com/IgniteUI/igniteui-webcomponents/pull/2561)
  - With `with-arrow`, the arrow is at the center of the anchor on the first show, and it stays inside the tooltip for the `-start` and `-end` placements. [#2520](https://github.com/IgniteUI/igniteui-webcomponents/issues/2520) [#2524](https://github.com/IgniteUI/igniteui-webcomponents/pull/2524) [#2561](https://github.com/IgniteUI/igniteui-webcomponents/pull/2561)
  - `message` shows when there is only whitespace between the tags. [#2561](https://github.com/IgniteUI/igniteui-webcomponents/pull/2561)
- #### Tree
  - A tree item outside a tree no longer renders a selection checkbox. [#2488](https://github.com/IgniteUI/igniteui-webcomponents/pull/2488)
- #### Virtual scroll
  - `scrollToIndex` puts the item at the requested edge, also when its size is different from the estimate. `layoutComplete` resolves after the rendered items are measured. [#2410](https://github.com/IgniteUI/igniteui-webcomponents/pull/2410)
  - A list larger than the maximum scroll size of the browser shows its last items, and its items move evenly during a scroll. [#2410](https://github.com/IgniteUI/igniteui-webcomponents/pull/2410)
  - A new `data` array measures the new items at the rendered indices again. [#2412](https://github.com/IgniteUI/igniteui-webcomponents/pull/2412)
  - A `data` change in the same task as `scrollToIndex()` renders at the new offset. [#2545](https://github.com/IgniteUI/igniteui-webcomponents/pull/2545)
  - A property change on a detached virtual scroll no longer throws an error.
  - `scrollToIndex()` on a hidden or detached list scrolls when the list shows, and its promise resolves then. Before, the call did nothing. A newer call replaces the waiting one.

### Security
- #### Tile manager
  - `loadLayout` copies only the serialized tile properties: the spans, the positions, the flags and `id`. So a layout from storage or a server can no longer set `innerHTML` on a tile or change its prototype through `__proto__`. The method ignores a value that is not an array, and an entry that is not an object. [#2409](https://github.com/IgniteUI/igniteui-webcomponents/pull/2409)

## [7.4.1] - 2026-09-25
### Added
- #### AI-Assisted Development
  - New `igniteui-wc-grids` skill. It helps an agent pick the grid package, register the grid, apply one theme, inject the theme into a Shadow DOM, set the layout and set up sorting and filtering. [#2376](https://github.com/IgniteUI/igniteui-webcomponents/pull/2376)
- #### Virtual scroll
  - `keyFunction` property. It returns the key of an item, so an item keeps its element while it is in the rendered window, also when it moves in `data`. Without it, the index is the key. [#2401](https://github.com/IgniteUI/igniteui-webcomponents/pull/2401)

### Changed
- #### AI-Assisted Development
  - All skills now declare the MIT license, and their descriptions state when to use them and when to use a different skill. [#2400](https://github.com/IgniteUI/igniteui-webcomponents/pull/2400)
  - The `igniteui-wc-figma-to-app` skill now supports Figma files from any UI kit, not only the Indigo.Design UI Kits. Its guidance now agrees with the current Figma, theming and component APIs, and its steps are in separate reference files, so an agent loads less text. [#2400](https://github.com/IgniteUI/igniteui-webcomponents/pull/2400) [#2404](https://github.com/IgniteUI/igniteui-webcomponents/pull/2404)
- #### Virtual scroll
  - **Behavior change:** Item elements are now recycled. An item that stays in the rendered window keeps its element, and the elements of the items that leave show the items that enter. Before, each element showed the item at its window position, so each scroll updated every rendered item. DOM state that the item template does not bind, for example the state of a checkbox without a `checked` binding, stays with the element and shows on the item that enters. The `itemTemplate` documentation shows how to bind this state or get new DOM for each item. [#2401](https://github.com/IgniteUI/igniteui-webcomponents/pull/2401)
  - The average measured item size now replaces `estimatedItemSize` for the items that are not measured yet, so the scrollbar follows the real content when the estimate is wrong. [#2401](https://github.com/IgniteUI/igniteui-webcomponents/pull/2401)

### Fixed
- #### Virtual scroll
  - `scrollToIndex` with `block: 'nearest'` now aligns an item after the viewport to the end of the viewport, as native `scrollIntoView` does. Before, it aligned each item out of view to the start, so a scroll to the next item moved a full page. [#2401](https://github.com/IgniteUI/igniteui-webcomponents/pull/2401)
- #### Checkbox, Switch, Radio
  - A `<label>` element bound through `for`, or wrapping the component, now names the control and a click on it focuses and toggles the control, as for a native checkbox or radio. Before, the control had no accessible name and the click did nothing. [#2402](https://github.com/IgniteUI/igniteui-webcomponents/pull/2402)
  - The host `aria-labelledby` now names the control. Before, the component copied the ID into its shadow root, where it did not resolve. [#2402](https://github.com/IgniteUI/igniteui-webcomponents/pull/2402)
- #### Rating, Slider
  - A `<label>` element bound through `for`, or wrapping the component, now names the control, and a click on it focuses the control. [#2402](https://github.com/IgniteUI/igniteui-webcomponents/pull/2402)
  - The host `aria-labelledby` now names the control. The slider now also follows a change of the host `aria-label` after the first render. [#2402](https://github.com/IgniteUI/igniteui-webcomponents/pull/2402)
  - The slider value tooltip is hidden from assistive technology, because `aria-valuetext` already carries the value. [#2402](https://github.com/IgniteUI/igniteui-webcomponents/pull/2402)
- #### Color picker
  - In `default` mode, an external `<label>` and the host `aria-labelledby` and `aria-label` now name the trigger button. Before, it was always "Open color picker". [#2402](https://github.com/IgniteUI/igniteui-webcomponents/pull/2402)
  - In `input` mode, the text input no longer carries `aria-expanded`, which ARIA does not allow on a text input. The swatch button in the prefix still reflects the open state. [#2402](https://github.com/IgniteUI/igniteui-webcomponents/pull/2402)
- #### File input
  - A click on an external `<label>` now focuses the native input and opens the file picker, as for a native file input. Before, the focus went to the browse button. [#2402](https://github.com/IgniteUI/igniteui-webcomponents/pull/2402)
- #### Combo
  - The `label` property and an external `<label>` now name the input. Before, the selection status text ("No options selected") replaced them. [#2402](https://github.com/IgniteUI/igniteui-webcomponents/pull/2402)
- #### Combo, Color picker, Date picker, Date range picker, Date time input, File input, Input, Mask input, Select, Textarea
  - The host `aria-labelledby` and `aria-label` now name the native editor. All form associated components use one naming order: the host `aria-labelledby`, then the external `<label>` elements, then the own label, then the host `aria-label`. [#2402](https://github.com/IgniteUI/igniteui-webcomponents/pull/2402)
  - A `<label>` element added after the first render now names the control from its first focus. Before, it did not name the control until the next render. [#2402](https://github.com/IgniteUI/igniteui-webcomponents/pull/2402)
  - The helper text `aria-describedby` of the input editors now stays after a re-render. Before, a re-render removed it. [#2402](https://github.com/IgniteUI/igniteui-webcomponents/pull/2402)

## [7.4.0] - 2026-09-23
### Added
- #### Breadcrumbs
  - New `igc-breadcrumbs` and `igc-breadcrumb` components show a navigation trail. [#1881](https://github.com/IgniteUI/igniteui-webcomponents/pull/1881)
    - `igc-breadcrumbs` has the `list` role. The `separator` attribute sets the icon between the items. The default is `tree_expand`. Put the component in a `<nav aria-label="...">` element, as the ARIA breadcrumb pattern requires.
    - `igc-breadcrumb` has the `listitem` role. Put the item content, usually an anchor, in the default slot. The `prefix` and `suffix` slots add content before and after it. The `separator` slot replaces the icon of one item.
    - `current` sets `aria-current="page"`. `disabled` sets `aria-disabled` and removes the slotted content from the tab sequence. Assistive technology does not read the separator.
    - The `label` and `separator` CSS parts style the two containers.
- #### Button group
  - The single selection modes now use the radio group keyboard pattern. [#2385](https://github.com/IgniteUI/igniteui-webcomponents/pull/2385)
    - The group is one tab stop.
    - The arrow keys move the focus and the selection together. They skip disabled buttons and wrap at the two ends.
    - `alignment="horizontal"` uses ArrowLeft and ArrowRight and follows the text direction. `alignment="vertical"` uses ArrowUp and ArrowDown.
    - Before, each button was a tab stop and the arrow keys did nothing. The `radiogroup` role does not permit this.
    - The `multiple` mode does not change. Each button stays a tab stop.
- #### Combo, Color picker, Date picker, Date range picker, Dropdown, Select, Tooltip
  - `scroll-strategy` attribute. It sets what the popup does when a container scrolls. [#2355](https://github.com/IgniteUI/igniteui-webcomponents/pull/2355)
    - `hide` (default) hides the popup while its anchor is fully out of view.
    - `scroll` keeps the popup visible and on its anchor.
    - `close` closes the component on each scroll. A `sticky` tooltip also closes.
    - The date pickers ignore the attribute in `dialog` mode.

### Changed
- #### Button group
  - The `radiogroup` or `group` role and the disabled state are now on the `igc-button-group` host. Before, they were on an element in the shadow root. An `aria-label` or `aria-labelledby` on the host now names the group. [#2385](https://github.com/IgniteUI/igniteui-webcomponents/pull/2385)
  - In the single selection modes, `alignment` sets the `aria-orientation` of the radio group.
- #### Combo, Color picker, Date picker, Date range picker, Dropdown, Select, Tooltip
  - **Behavior change:** The popup now hides while its anchor is fully scrolled out of view. Before, it stayed visible. Set `scroll-strategy="scroll"` to keep the previous behavior. [#2355](https://github.com/IgniteUI/igniteui-webcomponents/pull/2355)
- #### Dropdown, Select, Tooltip
  - The popup no longer moves along the viewport edge to stay in view. It only flips to the opposite side. [#2355](https://github.com/IgniteUI/igniteui-webcomponents/pull/2355)
- #### Popover
  - Popovers now use native CSS anchor positioning in browsers that support it (Chrome/Edge 133+, Firefox 147+, Safari 26+). Other browsers use `@floating-ui/dom` as before, and load it only when necessary. [#2355](https://github.com/IgniteUI/igniteui-webcomponents/pull/2355)

### Fixed
- #### Carousel
  - The indicators now set `aria-label` as a content attribute and in `ElementInternals`. Before, only `ElementInternals` had it, and tools that do not read internals reported no tab name. [#2378](https://github.com/IgniteUI/igniteui-webcomponents/pull/2378)
- #### Combo, Select
  - A click on the input label opened the list and closed it again. The component emitted `igcOpening`, `igcClosing` and `igcClosed`, and stayed closed. [#2390](https://github.com/IgniteUI/igniteui-webcomponents/pull/2390)
- #### Date picker
  - In dropdown mode, a `label` that you set after the first render did not go to the native input. This occurred in all themes except Material. [#2378](https://github.com/IgniteUI/igniteui-webcomponents/pull/2378)
  - The `container` CSS part is now exported. It was documented, but not exported. [#2398](https://github.com/IgniteUI/igniteui-webcomponents/pull/2398)
- #### Date range picker
  - The `ranges` CSS part is now exported. It was documented, but not exported. [#2398](https://github.com/IgniteUI/igniteui-webcomponents/pull/2398)
- #### Dropdown
  - The anchor now names the list through `ariaLabelledByElements`. Before, `aria-labelledby` pointed to the anchor slot, which tools cannot resolve. [#2378](https://github.com/IgniteUI/igniteui-webcomponents/pull/2378)
- #### Input, Date time input, Date range input, File input, Mask input, Textarea
  - A click on the label now emits one `click` event from the component. Before, it emitted two. A disabled component now emits none. [#2390](https://github.com/IgniteUI/igniteui-webcomponents/pull/2390)

## [7.3.2] - 2026-09-09
### Added
- #### Library
  - Each GitHub release now carries a CycloneDX 1.6 SBOM for the published package and for the build environment, together with Sigstore attestations for the build provenance and for the SBOM. The release notes link the attestations, thus you can verify the tarball that you install. [#2370](https://github.com/IgniteUI/igniteui-webcomponents/pull/2370)
- #### QR code
  - `toBlob()` serializes the rendered code to an `image/svg+xml` blob. Theme colors become plain `fill` attributes and a logo that is not a data URI is fetched and inlined, so the output renders the same outside the component. [#2367](https://github.com/IgniteUI/igniteui-webcomponents/pull/2367)
  - `toImage(options)` exports the code as a `File` in `svg`, `png`, `jpeg` or `webp` format. The `scale` option multiplies the component `size`, thus a 256px code with `scale: 2` gives a 512x512 image. Set `download: true` to open the browser download dialog. The `QrCodeExportFormat` and `QrCodeExportOptions` types are exported from the package entry point.
- #### Themes
  - All components now carry `forced-colors: active` styles in the Material, Bootstrap, Fluent and Indigo themes. Thus in Windows High Contrast mode they draw from the system palette (`CanvasText`, `Highlight`, `GrayText`, `LinkText`), and the disabled, hover, focus and selected states stay distinguishable. [#2347](https://github.com/IgniteUI/igniteui-webcomponents/pull/2347)

### Changed
- #### Calendar, Date picker, Date range picker
  - When `week-start` is not set, the week starts on the first day of the week of the `locale`, as reported by `Intl.Locale.prototype.getWeekInfo()`. For example, `bg` starts on Monday and `en` stays on Sunday. An explicit `week-start` has priority. Set `weekStart` to `undefined` to return to the locale value. Browsers without `getWeekInfo()` keep the Sunday default. [#1020](https://github.com/IgniteUI/igniteui-webcomponents/issues/1020)
  - The header date and the month/year navigation follow the field order of the `locale`. For `ja`, the header shows `7月15日(火)`, and the year button precedes the month button and shows `2025年`. The years view keeps plain numbers. In vertical header orientation, the weekday line has no trailing comma. [#1712](https://github.com/IgniteUI/igniteui-webcomponents/issues/1712)

### Fixed
- #### Library
  - `defineAllComponents()` did not register `igc-qr-code` and `igc-virtual-scroll`. Thus the two components stayed undefined when you relied on the bulk registration. [#2373](https://github.com/IgniteUI/igniteui-webcomponents/pull/2373)
- #### Validation
  - A host that starts invalid, such as `<igc-input required invalid>`, showed no validation messages. The validation container keeps its first render neutral for SSR parity and skips the projection slots until the host updates, and a host that hydrated invalid never rendered again. [#2374](https://github.com/IgniteUI/igniteui-webcomponents/pull/2374)

## [7.3.1] - 2026-09-01
### Added
- #### Color picker
  - `IgcColorPickerComponentEventMap` is now exported from the package entry point. [#2360](https://github.com/IgniteUI/igniteui-webcomponents/pull/2360)

### Changed
- #### Avatar
  - The component now exposes `role="img"`. Before, it declared `image`, which is an ARIA 1.3 token that current tools do not know. [#2363](https://github.com/IgniteUI/igniteui-webcomponents/pull/2363)
  - The accessible name now comes from `alt`, and then from `initials`. The role description is the static string `avatar`. Before, the two were inverted: the name was always the literal "avatar", and `alt` or `initials` became the role description.
- #### Badge
  - The role description is the static string `badge`. The visual `variant` no longer reaches assistive technology. `role="status"` is unchanged. [#2363](https://github.com/IgniteUI/igniteui-webcomponents/pull/2363)
  - The `icon` CSS part now applies only when an `igc-icon` is the only content of the badge, as the documentation already stated.
- #### Chip
  - **Breaking for custom styles:** `part="base"` is now a plain wrapper. The selection control moved to the new `action` part, and the remove control to the new `remove` part. Move rules that target `::part(base)` for the interactive surface to `::part(action)`. [#2362](https://github.com/IgniteUI/igniteui-webcomponents/pull/2362)
  - `igcRemove` is typed `CustomEvent<void>`. The type declared a boolean detail that the event never carried.
  - The `start` and `end` slots, and the `action` and `remove` parts, are documented. Thus they reach the custom elements manifest.
- #### Tile manager
  - `igc-tile` renders its resize handles directly. Before, an internal element rendered them and exported the parts. The `trigger-side`, `trigger` and `trigger-bottom` parts keep their names, and the new `tile-container` part wraps the tile content together with the handles. [#2359](https://github.com/IgniteUI/igniteui-webcomponents/pull/2359)

### Fixed
- #### Avatar
  - The `<img>` element carried no `alt` attribute when you set no alt text. This is an `image-alt` violation in the page of the consumer. The component now renders `alt=""`, thus the image counts as decorative. [#2363](https://github.com/IgniteUI/igniteui-webcomponents/pull/2363)
  - Removed the documented `icon` CSS part. The component never rendered it.
- #### Badge
  - A badge that holds an `igc-icon` together with text lost its inline padding and clipped the text under `overflow: hidden`. The `icon` part became active for any slotted icon, but the padding rule matched `[part='base']` exactly and thus did not apply. [#2363](https://github.com/IgniteUI/igniteui-webcomponents/pull/2363)
- #### Chip
  - A removable chip failed the `nested-interactive` accessibility audit. The chip rendered its full surface as a button, and the remove icon inside it declared `role="button"` and `tabindex="0"`. The two controls are now siblings. [#2362](https://github.com/IgniteUI/igniteui-webcomponents/pull/2362)
  - The accessible name of the chip read "Chip remove chip" or "select chip Chip", because the labels of the remove icon and of the selection icon became part of it. The name is now the content of the chip.
  - `Space` did not toggle the selection, and `igcRemove` fired on chips that are not removable. The remove keybindings applied to the host and cancelled the activation keys of the chip. They now apply to the remove control only.
  - Focus on the remove control now also shows the focus state of the chip.
  - The prefix wrapper hides only when the chip is selectable and selected, and the suffix wrapper no longer hides because of `removable`.
- #### Color picker
  - The picker canvas did not respond to touch input. [#2357](https://github.com/IgniteUI/igniteui-webcomponents/pull/2357)
- #### Textarea
  - A change of `resize` away from `auto` did not release the inline height. Thus the control stayed at its last automatic height. [#2361](https://github.com/IgniteUI/igniteui-webcomponents/pull/2361)
  - Text that you project into the default slot now becomes the default value, as with a native `<textarea>`. Before, it became the value. Thus the control was not pristine, and a form reset cleared the visible text while the light DOM still held it.
- #### Tile manager
  - A swap of two positioned tiles wrote a column value into `rowStart`. Thus the tiles moved to the wrong row. [#2359](https://github.com/IgniteUI/igniteui-webcomponents/pull/2359)
  - A tile that you add next to a single positioned tile collided with it at position 0.

## [7.3.0] - 2026-08-26
### Added
- #### Calendar
  - `igc-calendar` now exports the `label-inner`, `months-row` and `years-row` parts. The pickers export them as `calendar-label-inner`, `months-row` and `years-row`. The views rendered these parts but did not export them, thus you could not style them through the calendar.
- #### Color picker
  - New `igc-color-picker` component. It provides a user interface for selecting colors, supporting various color formats and a customizable palette. [#1973](https://github.com/IgniteUI/igniteui-webcomponents/pull/1973)
- #### Chip
  - `outlined` property. When you set it to `true`, the chip shows an outlined style. [#2307](https://github.com/IgniteUI/igniteui-webcomponents/pull/2307)
- #### Icon
  - `registerIcon` and `registerIconFromText` now accept a `RegisterIconOptions` object as their third argument, in addition to the plain collection string. [#1822](https://github.com/IgniteUI/igniteui-webcomponents/issues/1822)
    - `stripMeta: true` removes the `<title>` and `<desc>` elements from the stored SVG. This prevents the native browser tooltip on hover.
    - The title text stays available as the `aria-label` of the host `igc-icon` element.
    - The component removes the `aria-labelledby` and `aria-describedby` references on the root `<svg>` that point to the removed elements.
- #### Mask input, Date time input, Date range picker
  - The masked editors now support the standard undo and redo shortcuts: `Ctrl + Z` / `Cmd + Z` to undo, and `Ctrl + Y`, `Ctrl + Shift + Z` / `Cmd + Shift + Z` to redo. These shortcuts did nothing before, because each render of the masked text sets the value of the native input and clears the browser undo stack.
    - A sequence of typed characters, or a sequence of deletions, becomes one undo step. A caret movement, a paste, a drop, a cut, a spin of a date part, and an IME composition each start a new step.
    - A restored step emits `igcInput`, thus composite hosts and two-way bindings follow the undo. In the date editors the restored text stays an uncommitted draft, and the component emits `igcChange` on blur only if the committed value changed.
    - The history stays through focus changes. The component discards the history when you set the value programmatically, when the form resets the control, or when the `mask`, `prompt` or `input-format` pattern changes.
- #### QR Code
  - New `igc-qr-code` component. It renders a scannable QR code as an SVG from the `value` property, and encodes the data in numeric, alphanumeric or byte mode. [#2308](https://github.com/IgniteUI/igniteui-webcomponents/pull/2308)
    - Set an explicit `version` (1-40) and `error-level` (`L`/`M`/`Q`/`H`), or let the component select the smallest version and level that hold the data.
    - `size` and `margin` control the rendered pixel dimensions and the quiet zone (in modules) around the code.
    - `logo-src` adds an optional branding logo. `logo-size` and `logo-margin` control how much of the scannable area the logo covers. The component increases the error correction level for the logo, unless you set the level.
    - `dot-style` and `square-style` set the shape of the data modules and of the finder-pattern corners (`square`, `circle`, `rounded`).
    - The `--ig-qr-code-background`, `--ig-qr-code-dark-color`, `--ig-qr-code-corner-square-color` and `--ig-qr-code-corner-dot-color` CSS custom properties control the theme. The component exposes the `background`, `dots`, `corner-square` and `corner-dot` CSS parts.
- #### Splitter
  - `startCollapsed` and `endCollapsed` properties. Use them to read and to set the collapsed state of each pane.
  - `igcLayoutChanged` event. The component emits it after a user resize or a change of the expansion state. The payload holds the current layout (`startSize`, `endSize`, `startCollapsed`, `endCollapsed`).
- #### Tabs
  - `selectedTab` property. It returns the selected `igc-tab` element, or `null`.
  - `select()` now also matches the `label` of a tab, in addition to its IDREF. Thus you can pass the value that `selected` reports back into it.
- #### Virtual Scroll
  - New `igc-virtual-scroll` component. It renders large or unbounded lists efficiently, because it renders only the items in the viewport plus a configurable `overScan`. [#2222](https://github.com/IgniteUI/igniteui-webcomponents/pull/2222)
    - Supports `vertical` and `horizontal` orientation, and RTL layouts.
    - Item sizes can be fixed, estimated with `estimatedItemSize`, or fully variable. The component measures each rendered item and corrects its estimate automatically.
    - `scrollToIndex()` scrolls to a given item, with a configurable alignment (`block`/`inline`) and scroll `behavior` (`auto`/`smooth`). The component corrects the target offset while it measures the items around it, thus the requested item stops in the correct position.
    - `igcDataRequest` event. The component emits it when the scroll position comes near the end of the loaded data. Use it for infinite scroll and for remote data.
    - `igcStateChange` event. The component emits it after each render pass, with a snapshot of the current virtual window (`startIndex`, `endIndex`, `viewportSize`, `totalSize`).
    - `layoutComplete` property. This promise resolves when the current render pass, and all subsequent renders that item measurement causes, are complete.
    - The component operates correctly above the maximum scroll coordinate of the browser. Lists that are much larger than the DOM permits continue to scroll and to render correctly.

### Changed
- #### Button group
  - **Behavioral change:** a disabled group no longer sets `disabled` on its buttons. The buttons inherit the state. Thus a button that is disabled on its own stays disabled when you enable the group again, and the buttons that you add to a disabled group are also disabled.
  - Improved accessibility: the `single` and `single-required` modes expose a `radiogroup` with `radio` buttons, instead of toggle buttons with `aria-pressed`. The `focused` CSS part of `igc-toggle-button` is now documented.
- #### Carousel
  - The component now delegates focus to its indicator container, its navigation buttons, or the first focusable element in the active slide, in this sequence. Related to [#2291](https://github.com/IgniteUI/igniteui-webcomponents/issues/2291).
- #### Chip
  - The `focus-outline-color` and `focus-selected-outline-color` CSS variables are replaced by `focus-shadow-color` and `focus-selected-shadow-color`.
- #### Combo
  - The dropdown list now uses the new `igc-virtual-scroll` component instead of the third-party `@lit-labs/virtualizer` package. [#2222](https://github.com/IgniteUI/igniteui-webcomponents/pull/2222)
- #### Date time input, Date picker, Date range picker
  - **Behavioral change:** the components no longer change the `value` property while the user types. `value` now holds only a committed value and changes together with the `igcChange` event, which the components still emit on blur. Before, `value` changed on each keystroke - it became `null` for an incomplete mask, and the parsed date when the mask was full - and no event announced the change. [#1346](https://github.com/IgniteUI/igniteui-webcomponents/issues/1346)
    - Thus you can use the components in templates that bind `value` externally, such as an edit template in `igc-grid`. Before, each re-render during typing applied the stale bound value again and reset the editor, thus you could not enter a new date.
    - The value that the user types - and the result of a spin of a date part or of `Ctrl + ;` - is available in the `detail` of the `igcInput` event. The payload of the event does not change.
    - A spin of a date part in a focused editor also defers to the commit on blur. A programmatic `stepUp()` or `stepDown()` on an unfocused component changes `value` immediately, as do `clear()`, `setRangeText()` and direct assignments.
    - In `igc-date-picker` and `igc-date-range-picker` the calendar continues to follow the typed date during editing, as before.
- #### Dropdown
  - **Behavioral change:** the component no longer emits `igcChange` when you select the item that is already selected. The list still closes, as before.
  - Improved accessibility: the target element declares `aria-haspopup="listbox"` instead of `aria-haspopup="true"`. While the list is open, the target holds `aria-activedescendant` that points at the item that keyboard navigation is on, thus screen readers announce the highlight. The component sets an id only on items that have none. It also removes all the attributes that it wrote on the target when it no longer uses that target.
- #### Library
  - Updated the optional peer dependencies `dompurify`, `marked` and `shiki` to their latest stable versions.
  - Removed the `@lit-labs/virtualizer` dependency. The new `igc-virtual-scroll` component now supplies the virtualization. [#2222](https://github.com/IgniteUI/igniteui-webcomponents/pull/2222)
- #### Tabs
  - **Behavioral change:** the scroll buttons now scroll to the nearest tab that is not fully visible, instead of a fixed step of 180px. A tab below a scroll button counts as not visible. Thus one click brings exactly one tab into view and does not overshoot it.
  - Improved accessibility: the tab headers expose `aria-posinset` and `aria-setsize`, the strip declares its `aria-orientation`, and the selected panel is focusable. Thus keyboard users can reach panel content that holds no focusable elements of its own. The strip also keeps a tab stop when no tab is selected.
  - The component now finds `igc-tab` elements that come through an intermediate slot. Thus another component can wrap `igc-tabs`.
- #### Tooltip
  - **Behavioral change:** a tooltip that closes from a hide trigger now waits exactly `hide-delay`. Before, it waited through an additional, undocumented stage of 180ms, thus the real delay was `hide-delay + 180ms`.
  - **Behavioral change:** in `sticky` mode the default close button hides the tooltip immediately and does not wait for `hide-delay`. Before, an explicit close took almost half a second.
  - **Behavioral change:** `focusin` and `focusout` are now part of the default `show-triggers` and `hide-triggers`. Thus a tooltip opens when its anchor gets keyboard focus, and closes when the focus leaves the anchor.
  - Improved accessibility: the anchor points at the tooltip with `aria-describedby`, thus screen readers announce the content as the description of the anchor. The tooltip generates an `id` only when it has none, keeps the references that are already on the anchor, and removes its own reference when it no longer describes the anchor.
  - Improved accessibility: in `sticky` mode the default close action is a labelled `<button>` and not a bare icon. Thus you can reach and operate it from the keyboard. The new `close-button` CSS part exposes it.

### Fixed
- #### Button group
  - Single selection compared the values of the buttons. Thus buttons without a `value`, or with the same `value`, could not take the selection: a click on a second button only cleared the first. The component now tracks the selection per element. [#2229](https://github.com/IgniteUI/igniteui-webcomponents/issues/2229)
  - `selectedItems` added to the current selection instead of a replacement of it, and ignored buttons whose `value` is an empty string.
  - You could still interact with a disabled group through buttons that you added after the group became disabled.
  - `focus()`, `blur()` and `click()` on `igc-toggle-button` threw an error when you called them before the first render.
  - Toggle buttons that are not direct children of the group changed its selection state. This could keep two buttons selected in a single selection mode, or remove the selection.
- #### Calendar
  - A calendar with more than one visible month announced each navigation one time per month, because the off-screen live region with the current period was part of the navigation of each month. There is now one live region for the full calendar.
  - A calendar with more than one visible month exposed one tab stop per month. Thus the tab key moved into the grid of each month instead of out of the calendar. Only the active days view now holds the tab stop of its active date.
  - The component now resolves time-only date strings against the current local date and not the UTC date. Before, the parsed date moved by one day near midnight in some time zones.
  - `week-start` stayed stale until a subsequent update corrected the view. The component now resolves and renders `week-start` correctly on the initial render.
  - Keyboard navigation over a large number of disabled dates could hang the browser. The navigation is now a no-op in this condition.
- #### Carousel
  - A pointer over a carousel, or focus inside it, started the rotation of a carousel that you paused through `pause()`. The component now starts the rotation again only if an interaction paused it.
  - A change of `interval` set the playing state and left the paused state as it was, thus `isPlaying` and `isPaused` were both `true`. A clear of `interval` also reported the carousel as playing, without a rotation. Both states now describe the rotation correctly.
  - An interaction that changes nothing - a key press at the last slide with `disableLoop` - left a timer that ran without a rotation, and nothing cleared it.
  - A key press at the last slide with `disableLoop` moved the focus to an indicator on the next slide change that came from `select()`, `next()` or `prev()`.
  - A carousel with fewer projected `igc-carousel-indicator` elements than slides threw a `TypeError` during render. The indicators now map to the slides by position, for any count of each.
  - The removal of the active slide left the carousel with no active slide. The slide that takes its position now becomes active.
  - The component set `aria-controls` on the host, where it described nothing. Each projected indicator now carries it, and points at the slide that it selects.
  - Slides that entered an empty carousel after its first render stayed inactive, thus the carousel showed nothing. The authored active slide, or the first slide, now becomes active.
  - A change of `interval` on a carousel that left the DOM started a timer that no rotation used. Only a return to the DOM now starts the timer again.
  - A carousel that left the DOM before its first render completed threw an unhandled `TypeError` from the gestures controller. The controller now verifies that the element is still present.
  - The documentation of the component now includes the `indicator` slot.
- #### Chat
  - With `adoptRootStyles` enabled the component ignored the stylesheets that entered the document after the initial adoption. Thus custom renderers whose styles are injected during view creation - Angular component styles, for example - showed unstyled content. The component now tracks the document stylesheets while the option is on, and applies each addition or removal to the shadow roots that adopted them, including stylesheet links that load later. [#2328](https://github.com/IgniteUI/igniteui-webcomponents/issues/2328)
  - Adoption of the document styles no longer removes the theme styles of the message and the input parts. Before, the adoption built the stylesheet list from the static styles of the component only.
- #### Dropdown
  - `Enter` on an open dropdown before any arrow key threw a `TypeError` instead of doing nothing. The type of the item that keyboard navigation moves from declared that the item is always present, but the item is unset until you navigate the list or select something.
  - Keyboard navigation stopped on a dropdown that opened at an explicit target, after a close and a subsequent open without that target, because the close removed the target together with its key event listeners. The component now keeps the target until another target replaces it.
  - A dropdown that opened at an explicit target and then opened again through its own `target` slot stayed at the previous, detached element. The component now always resolves the current anchor and gives it to the popover.
  - A call of `show()` with another target while the dropdown is open left `aria-expanded` on the previous element and leaked its key event listeners.
  - `show()` with an id that matches no element threw a `TypeError`. An unresolved target now keeps the current target. When there is no anchor at all, `show()` returns `false` and does not open, because the popover cannot position a list without an anchor and the component would report itself open with nothing on screen.
  - `clearSelection()` cleared the selection but kept keyboard navigation on the cleared item. Thus the next `ArrowDown` returned to that item instead of the top of the list.
  - `selectedItem` continued to return an item that was removed from the DOM. The component now tracks the items that enter and leave the light DOM. It drops the selection when its item goes away, and navigation returns to the current selection.
  - `aria-haspopup` and `aria-expanded` stayed on the target element after the removal of the dropdown from the DOM, or after another target replaced it.
  - `igc-dropdown-header` had no role. Thus it stayed in the accessibility tree as a bare child of the `listbox`, which can own only `option` and `group` nodes. The component now removes it from the tree, as it already did for `igc-select-header`.
  - The label of an `igc-dropdown-group` named nothing, because the component renders it in the shadow root of the group, out of reach of the host ARIA. Thus screen readers announced the groups without their label.
- #### Form associated components
  - Validation messages no longer disappear immediately after the first failed form submission. The invalid state from the submission held only for the update that the submission scheduled. Thus a subsequent re-render - a `slotchange` from the validation slots, for example - removed the messages, but the invalid styles stayed.
  - The invalid styles now follow the validity state. A control that becomes valid again - a cleared `required`, a wider `min`/`max`, a disabled control - now drops the styles from an earlier interaction or submission.
- #### Highlight
  - Recent Firefox versions did not paint the matches. `::highlight()` rules are tree-scoped: they style only the text nodes in the same tree scope as the stylesheet. The component adopted the rules into its own shadow root, but the text that it highlights is slotted content in the tree scope of the host. Earlier Firefox versions applied such rules across scopes, as Chromium still does. The root node of the host now adopts the stylesheet, and the component adopts it again if it moves to another tree scope.
  - The same fix lets a component inside another shadow root resolve its `--background` and `--foreground` custom properties correctly in Chromium. Before, it used the theme defaults.
- #### Icon
  - An icon that renders through a reference stayed blank when you registered the target icon later, because the component reacted only to registrations that match its own `name` and `collection` and not to the resolved target. It now resolves again on each change of the registry.
  - `igc-icon` declares `role="img"` only when it has an accessible name: the `<title>` of the icon, or an `aria-label` or `aria-labelledby` on the host. Before, a decorative icon appeared in the accessibility tree as an image without a name.
- #### Rating
  - Keyboard input, `stepUp()` and `stepDown()` produced values such as `0.30000000000000004` with a fractional `step`. The value, the `igcChange` payload and `aria-valuenow` now hold the exact value. `stepUp(n)` and `stepDown(n)` also move by `n` steps, and not to the next step above the result.
  - `aria-valuetext` reported a value rounded up to the next step, thus it disagreed with `aria-valuenow` for a fractional value such as `2.5` with `step` of `1`.
  - A non-numeric `max` or `step` attribute produced `NaN`: the component rendered no symbols and announced `NaN of 5`. Both now fall back to a valid number.
  - The slider had no accessible name without a `label`. The component now forwards the `aria-label` of the host, and sets `aria-labelledby` only when it renders a label.
  - The component now exposes its `readonly` and `disabled` state through `aria-readonly` and `aria-disabled`.
  - A change of the `aria-label` of the host after the first render left the accessible name of the slider as it was.
  - `igcHover` did not fire when the pointer left the component, and then entered again over the same symbol.
- #### Select
  - `ArrowUp` on a closed select that had a selection cleared the selection and showed the placeholder, instead of a move to the previous item. The component set the item that keyboard navigation moves from only through its own selection path. Thus a selection through the `value` property, or through a `selected` attribute on an item, left that item unset, and a backward step from "no item" went off the start of the list. Navigation now always starts from the current selection. If there is no item to move to, the selection does not change.
  - Type-ahead threw a `TypeError` on the first character that you type, on a select that had a selection.
  - Type-ahead no longer swallows keyboard shortcuts. The component used a printable key with `Ctrl`, `Cmd` or `Alt` as a search character and prevented its default. Thus `Ctrl + C` and similar shortcuts did not reach the browser.
  - Selection of the item that is already selected from the open list - by click, `Enter` or type-ahead - kept the list open. The list now closes and the focus returns, as for any other selection. The component still emits no `igcChange`, because the selection does not change.
  - The component no longer discards a `value` that you set before the matching item exists. Frameworks frequently render items asynchronously, and a value that matched nothing at the first render became `undefined`. The component now keeps the value and resolves it when you add the item, also into an existing `igc-select-group`. Removal of the selected item also drops the selection, but keeps the value.
  - `clearSelection()`, and a `value` that matches no item, kept an internal reference to the item that was selected before, from which the next keyboard navigation then moved.
  - The text in the input now comes only from the main content of the selected item. Before, it also held the content of the `prefix` and `suffix` slots of the item, and the comment markers that the templating engine left among its children.
  - `navigateTo()` no longer tries to focus and to scroll the list while the list is closed and inert.
- #### Tabs
  - See-through scroll buttons in the Indigo theme. The buttons are sticky and the tab headers scroll below them, but the theme keeps the buttons and the tabs strip transparent, thus the scrolled headers were visible through the buttons. The buttons now paint an opaque surface backdrop below their themed background. [#1955](https://github.com/IgniteUI/igniteui-webcomponents/issues/1955)
  - The component did not emit `igcChange` when `activation` is `manual` and you activate a tab with `Enter` or `Space`. Thus the selection changed without an event.
  - The selection now stays in agreement with the DOM in conditions that made the component inconsistent:
    - `selected` set to `false` on the active tab hid its panel, but the tab stayed active internally. Thus you could not select it again.
    - Removal of the last tab left a dangling reference that `selected` continued to report.
    - `select()`, the `selected` attribute and the initial selection could each activate a disabled tab, which a click always refused. A tab with `selected` and `disabled` showed its panel together with the selected panel.
    - A disabled active tab kept its panel visible below a greyed-out header. The selection now moves to the first enabled tab, or clears if all tabs are disabled.
  - The start scroll button stayed enabled at the start of the strip under browser zoom or a non-integer device pixel ratio, where the scroll offset is fractional.
  - A click on a partially visible tab header scrolled the strip two times.
  - Less rendering work: a scroll of the strip no longer schedules an update per scroll event, and a change of the selection no longer causes an unnecessary layout pass.
- #### Tooltip
  - `show()` and `hide()` did not cancel a queued transition in the opposite direction. Thus a tooltip could open immediately after a call to hide it, and close immediately after a call to show it.
  - A pointer that moved back over the anchor during the hide animation closed the tooltip and kept it closed, although the pointer never left the anchor.
  - Interaction with the original anchor, while a tooltip from `show(target)` was open, desynchronized the component: it reported `open === false` while it stayed on screen, and you could no longer close it.
  - `with-arrow` set at runtime did not give the arrow element to the popover. Thus the arrow had no position and no styles until an unrelated re-render corrected it.
  - Delayed show and hide transitions returned a promise that never settled.
  - A close with `Escape` emitted `igcClosed` even when there was nothing to close.
- #### Tree
  - Large or deeply nested trees are much faster:
    - A read of `path` on a tree item, and each operation built on it such as the activation of a nested item, cost `2^depth` and not `depth`, because the component walked the ancestor chain two times per level. One read at depth 20 took ~23ms; it now takes less than a microsecond at any depth.
    - Keyboard navigation is approximately 5 times faster (~1.24ms to ~0.24ms per keypress on a tree with 1554 items). A lazy walk that prunes the collapsed branches now supplies the navigable set. Before, the component materialized all items and filtered them through the ancestors of each item.
    - Removal of a subtree while items are selected is approximately 2 times faster (~134ms to ~71ms for 259 items in `cascade` mode). Before, each removed item ran the full cascade reconciliation again, although the topmost removed item covers its full subtree.
    - `tree.items`, `select()` over a full `cascade` tree, and the expansion or the collapse of all items are each 25-45% faster.

## [7.2.4] - 2026-06-29
### Added
- #### Form associated custom elements with external labels
  - External `<label>` associations are now resolved to the underlying native input of form-associated controls. Associating a label with `IgcInput`, `IgcMaskInput`, `IgcTextarea`, `IgcDateTimeInput`, `IgcSelect`, `IgcCombo`, `IgcDatePicker`, or `IgcDateRangePicker` — either through the `for`/`id` IDREF mechanism or by nesting the component inside the `<label>` — now correctly exposes the label to assistive technologies and focuses the inner input on label activation. [#2263](https://github.com/IgniteUI/igniteui-webcomponents/pull/2263)

### Changed
- #### AI-Assisted Development
  - Improved grid related skills [#2250](https://github.com/IgniteUI/igniteui-webcomponents/pull/2250)

### Fixed
- #### Tabs
  - Prevent selected tab header from scrolling into view on initial render [#2268](https://github.com/IgniteUI/igniteui-webcomponents/pull/2268)

## [7.2.3] - 2026-06-18
### Fixed
- #### Popover based components
  - Popover reposition jitter in `position: sticky` ancestors [#2256](https://github.com/IgniteUI/igniteui-webcomponents/pull/2256)
- #### Tile Manager
  - Text selection in Safari during drag operations [#2257](https://github.com/IgniteUI/igniteui-webcomponents/pull/2257)
  - Tile manager height collapse when a spanning tile is maximized [#2257](https://github.com/IgniteUI/igniteui-webcomponents/pull/2257)

## [7.2.2] - 2026-06-15
### Changed
- #### AI-Assisted Development
  - Decreased token consumption of skills and improved migration skill from grid lite to premium offering [#2243](https://github.com/IgniteUI/igniteui-webcomponents/pull/2243) [#2239](https://github.com/IgniteUI/igniteui-webcomponents/pull/2239)
- #### Snackbar, Toast
  - Abstracted container positioning property into a new type `NotificationPositioning` [#2251](https://github.com/IgniteUI/igniteui-webcomponents/pull/2251)

### Fixed
- #### Expansion Panel
  - Line height for title and sub-title slots [#2237](https://github.com/IgniteUI/igniteui-webcomponents/pull/2237)

## [7.2.1] - 2026-05-27
### Fixed
- Internal library metadata issue

## [7.2.0] - 2026-05-27
### Added
- #### Date Range Picker
  - Added support for editing the date range value directly via a single input field. [#1733](https://github.com/IgniteUI/igniteui-webcomponents/pull/1733)
- #### Nav Drawer
  - The drawer for non-relative positions are now implemented using the native Popover API, providing built-in modal semantics, focus trapping, and accessibility support. [#2194](https://github.com/IgniteUI/igniteui-webcomponents/pull/2194)
  - Added `keepOpenOnEscape` property — prevents the drawer from closing when the user presses the **Escape** key (non-relative positions only). [#2194](https://github.com/IgniteUI/igniteui-webcomponents/pull/2194)
  - Added `igcClosing` event — emitted just before the drawer is closed by user interaction. Cancelable. [#2194](https://github.com/IgniteUI/igniteui-webcomponents/pull/2194)
  - Added `igcClosed` event — emitted just after the drawer is closed by user interaction. [#2194](https://github.com/IgniteUI/igniteui-webcomponents/pull/2194)
- #### Invoker Commands API
  - `igc-button` and `igc-icon-button` now support `command` and `commandfor` properties, enabling declarative control of target components without JavaScript. [#2225](https://github.com/IgniteUI/igniteui-webcomponents/pull/2225)
  - `igc-banner`, `igc-dialog`, `igc-nav-drawer`, `igc-snackbar`, and `igc-toast` now respond to `--show`, `--hide`, and `--toggle` commands dispatched by an invoker button. [#2225](https://github.com/IgniteUI/igniteui-webcomponents/pull/2225)
- #### Snackbar
  - Added `positioning` property (`viewport` | `container`). The component now renders as a popover in the browser top layer. Setting `positioning` to `container` anchors the component to its nearest visible ancestor instead of the viewport. [#2203](https://github.com/IgniteUI/igniteui-webcomponents/pull/2203)
- #### Toast
  - Added `positioning` property (`viewport` | `container`). The component now renders as a popover in the browser top layer. Setting `positioning` to `container` anchors the component to its nearest visible ancestor instead of the viewport. [#2203](https://github.com/IgniteUI/igniteui-webcomponents/pull/2203)

### Changed
- #### AI-Assisted Development
  - Updated and enhanced the library provided skills [#2232](https://github.com/IgniteUI/igniteui-webcomponents/pull/2232)
- #### Form controls
  - `IgcInput`, `IgcMaskInput`, `IgcDateTimeInput`, `IgcCheckbox`, `IgcRadio`, `IgcSwitch`, `IgcDatePicker`, and `IgcDateRangePicker` now submit their associated form on **Enter** key press, matching native browser behavior. [#2213](https://github.com/IgniteUI/igniteui-webcomponents/pull/2213)
- #### Input
  - Added theming support for `date`, `time`, `datetime-local`, `week`, and `month` input types, ensuring consistent styles and floating label behavior across all supported themes. [#2223](https://github.com/IgniteUI/igniteui-webcomponents/pull/2223)
- #### Nav Drawer
  - The `overlay` CSS part has been removed. Users of the component can target the `base` part's `::backdrop` pseudo-element, the
    `--ig-overlay-background-color` variable or use the theming package. [#2194](https://github.com/IgniteUI/igniteui-webcomponents/pull/2194)

### Deprecated
- #### Localization
  - The old resource string interfaces for `Calendar`, `Chat`, `Date Picker`, and `Date Range Picker` are deprecated. Components now use the new `igniteui-i18n` resource keys. Setting individual `resourceStrings` properties directly is no longer supported; provide a complete resource strings object instead. [#2169](https://github.com/IgniteUI/igniteui-webcomponents/pull/2169)

### Fixed
- #### Button Group
  - Selected state border color mismatch in focused and hover states. [#2219](https://github.com/IgniteUI/igniteui-webcomponents/pull/2219)
- #### Combo
  - Display value not restored correctly when tabbing out in single-select mode with a partial search text. [#2224](https://github.com/IgniteUI/igniteui-webcomponents/pull/2224)
- #### Stepper
  - Step components connected to the DOM before their parent stepper now correctly receive context after being adopted by a stepper. [#2228](https://github.com/IgniteUI/igniteui-webcomponents/pull/2228)

## [7.1.3] - 2026-04-28
### Changed
- #### AI-Assisted Development
  - Updated and enhanced the library provided skills [#2207](https://github.com/IgniteUI/igniteui-webcomponents/pull/2207)

### Fixed
- #### Stepper
  - In horizontal orientation, the content area height can now driven by the active step's content instead of always being sized to the tallest step. A new `--body-grid-rows` CSS custom property controls the internal row sizing of each step body — its default value of `1fr` expands the body to fit its content, while setting it to `0fr` collapses the body to zero height, enabling fully variable step heights. [#2209](https://github.com/IgniteUI/igniteui-webcomponents/issues/2209)

## [7.1.2] - 2026-04-22
### Changed
- #### AI-Assisted Development
  - Updated and enhanced the library provided skills [#2189](https://github.com/IgniteUI/igniteui-webcomponents/pull/2189) [#2195](https://github.com/IgniteUI/igniteui-webcomponents/pull/2195) [#2198](https://github.com/IgniteUI/igniteui-webcomponents/pull/2198)
- #### Button group
  - Themes colors alignment [#2182](https://github.com/IgniteUI/igniteui-webcomponents/pull/2182)
- #### Circular progressbar
  - Unified track color CSS variable between progress bars [#2185](https://github.com/IgniteUI/igniteui-webcomponents/pull/2185)
- #### Chip
  - Wrap content inside a new part container and update styles [#2190](https://github.com/IgniteUI/igniteui-webcomponents/pull/2190)

### Fixed
- #### Dropdown
  - Selected item styles [#2168](https://github.com/IgniteUI/igniteui-webcomponents/pull/2168)
- #### Linear progressbar
  - Unified display size across platforms [#2184](https://github.com/IgniteUI/igniteui-webcomponents/pull/2184)
- #### Tree
  - Background style discrepancies [#2173](https://github.com/IgniteUI/igniteui-webcomponents/pull/2173)

## [7.1.1] - 2026-03-25
### Changed
- #### Checkbox
  - Updated disabled and indeterminate styles [#2158](https://github.com/IgniteUI/igniteui-webcomponents/pull/2158)

## [7.1.0] - 2026-03-19
### Added
- Splitter component
- Highlight container component

### Fixed
- #### Combo
  - Use focus color for clear button background #[2140](https://github.com/IgniteUI/igniteui-webcomponents/pull/2140)
- #### Stepper
  - Box shadow values for step indicators #[2133](https://github.com/IgniteUI/igniteui-webcomponents/pull/2133)
- #### Tabs
  - Scrolling behavior for tabs content #[2149](https://github.com/IgniteUI/igniteui-webcomponents/pull/2149)

## [7.0.1] - 2026-03-06
### Fixed
- #### Icon service
  - Browser Safari: Use a plain Map instance for synchronizing state between actors [#2128](https://github.com/IgniteUI/igniteui-webcomponents/pull/2128)

## [7.0.0] - 2026-02-25
### Added
- #### AI-Assisted Development - Copilot Skills
  - Four end-user skills are now shipped with the package under the `skills/` directory. They provide step-by-step guidance to GitHub Copilot and other LLM agents for common tasks:
    - **igniteui-wc-choose-components** - Identify the right component for a given UI pattern.
    - **igniteui-wc-integrate-with-framework** - Set up and use components in React, Angular, Vue, or vanilla JS.
    - **igniteui-wc-customize-component-theme** - Apply custom styles via CSS custom properties, parts, and the theming system.
    - **igniteui-wc-optimize-bundle-size** - Reduce production bundle size through selective imports and lazy loading.

  To enable the skills in your project, copy the skill folders into your repository's `.github/skills/` directory so Copilot can automatically discover them:

  **Unix/macOS:**
  ```sh
  cp -r node_modules/igniteui-webcomponents/skills/* .github/skills/
  ```

  **Windows (PowerShell):**
  ```powershell
  Copy-Item -Recurse node_modules\igniteui-webcomponents\skills\* .github\skills\
  ```

  **Windows (Command Prompt):**
  ```cmd
  xcopy /E /I node_modules\igniteui-webcomponents\skills .github\skills
  ```
  Copilot supports project skills stored in `.github/skills` or `.claude/skills` in your repository, and personal skills stored in `~/.copilot/skills` or `~/.claude/skills` (shared across projects; Copilot coding agent and GitHub Copilot CLI only).
- #### Chat
  - **adoptRootStyles** can now be toggled on/off at runtime. [#2093](https://github.com/IgniteUI/igniteui-webcomponents/pull/2093)

### Changed
- #### Library
  - Minimum Node version required is now >= 22.
- #### Themes - **Breaking change**
  - Changed global prefixes for CSS custom properties for component themes to align with other Ignite UI component libraries.

### Removed
- #### Chat
  - Removed the **typingIndicator** template renderer. Users can use the **typing-indicator** slot instead.
- #### Tooltip
  - Removed the **disableArrow** deprecated property.

### Fixed
- #### Carousel
  - Context instantiation in Blazor. [#2033](https://github.com/IgniteUI/igniteui-webcomponents/pull/2033)
- #### Combo
  - Correct cursor style over non input parts. [#2085](https://github.com/IgniteUI/igniteui-webcomponents/pull/2085)
- #### Textarea
  - Correct cursor style over non input parts. [#2085](https://github.com/IgniteUI/igniteui-webcomponents/pull/2085)

## [6.5.1] - 2026-02-04
### Fixed
- #### Calendar
  - aria-hidden state for weeks outside of the current month [#2079](https://github.com/IgniteUI/igniteui-webcomponents/pull/2079)
- #### Date picker
  - CSS border for slotted actions in dialog mode [#2078](https://github.com/IgniteUI/igniteui-webcomponents/pull/2078)
- #### Input
  - Placeholder color on focus [#2068](https://github.com/IgniteUI/igniteui-webcomponents/pull/2068)
  - CSS border when suffix slot content is present [#2073](https://github.com/IgniteUI/igniteui-webcomponents/pull/2073)
- #### Textarea
  - Align bottom padding to the design system [#2069](https://github.com/IgniteUI/igniteui-webcomponents/pull/2069)
- #### Validation
  - Slotted validation text follows the current theme [#2063](https://github.com/IgniteUI/igniteui-webcomponents/pull/2063)

## [6.5.0] - 2026-01-20
### Added
- Added theming scoping container [#2056](https://github.com/IgniteUI/igniteui-webcomponents/pull/2056)
  - The `igc-theme-provider` component allows you to scope themes to specific parts of your page using Lit's context API. This enables having multiple different themes on the same page.
  - Works both in Shadow and Light DOM.
  - **Shadow DOM Usage**: When building custom web components with Shadow DOM, you can apply scoped themes by importing the theme CSS and wrapping your content with `igc-theme-provider`:
    ```typescript
    import { LitElement, html } from 'lit';
    import { styles as materialDark } from 'igniteui-webcomponents/themes/dark/material.css.js';

    class MyComponent extends LitElement {
      static styles = [materialDark];

      render() {
        return html`
          <style>
            /* Additional component-specific styles */
          </style>
          <igc-theme-provider theme="material" variant="dark">
            <igc-button>Scoped Material Dark Button</igc-button>
            <igc-input label="Scoped Input"></igc-input>
          </igc-theme-provider>
        `;
      }
    }
    ```
  - **Light DOM with @scope**: For Light DOM usage, you can leverage CSS `@scope` to apply themes to specific page sections:
    ```html
    <style>
      @scope (#fluent-section) {
        @import 'node_modules/igniteui-webcomponents/themes/light/fluent.css';
      }

      @scope (#material-section) {
        @import 'node_modules/igniteui-webcomponents/themes/dark/material.css';
      }
    </style>

    <div id="fluent-section">
      <igc-theme-provider theme="fluent" variant="light">
        <igc-button>Fluent Light Button</igc-button>
        <igc-card>
          <igc-card-header>Fluent Theme Card</igc-card-header>
        </igc-card>
      </igc-theme-provider>
    </div>

    <div id="material-section">
      <igc-theme-provider theme="material" variant="dark">
        <igc-button>Material Dark Button</igc-button>
        <igc-input label="Material Input"></igc-input>
      </igc-theme-provider>
    </div>
    ```

### Fixed
- #### Tile manager
  - Header is hidden only when there is no content and maximize/fullscreen are disabled [#2059](https://github.com/IgniteUI/igniteui-webcomponents/pull/2059)
- #### Theming
  - Resolve initial theme based on document computed styles rather than stylesheets [#2061](https://github.com/IgniteUI/igniteui-webcomponents/pull/2061)

## [6.4.0] - 2025-12-15
### Added
- #### Localization
  - New localization implementation. Now you can set global localization for all localized Ignite UI components using the `registerI18n` and `setCurrentI18n` methods.
  - Calendar, Date Input, Date Picker and Date Range Picker components now implement the new localization for formatting as well, which internally uses new implementation of the Intl.
  - Added localization for Carousel, Chip, Combo, File Input and Tree. They now have `locale` and `resourceStrings` properties as well, which you can set to customize them individually.
- #### Badge
  - New **dot** type, improved outline implementation following WCAG AA accessibility standards and theme based sizing. [#1889](https://github.com/IgniteUI/igniteui-webcomponents/pull/1889)
- #### Checkbox
  - New `--tick-width` CSS property. [#1897](https://github.com/IgniteUI/igniteui-webcomponents/pull/1897)
- #### Combo
  - New `disableClear` property which disables the clear button of the combo component. [#1896](https://github.com/IgniteUI/igniteui-webcomponents/pull/1896)
- #### Mask input
  - Transform unicode digit code points to ASCII numbers for numeric patterns. [#1907](https://github.com/IgniteUI/igniteui-webcomponents/pull/1907)

### Changed
- **License Update**: The project license has been updated to the MIT License, providing greater flexibility and openness for the community. This change reflects our commitment to fostering an inclusive and collaborative development environment while maintaining the high-quality standards you expect from Ignite UI Web Components.
- #### Accessibility
  - Accessibility color adjustments. [#1959](https://github.com/IgniteUI/igniteui-webcomponents/pull/1959)
- #### Button
  - Updated and aligned styles with the design kit. [#1996](https://github.com/IgniteUI/igniteui-webcomponents/pull/1996)
- #### Calendar
  - Updated and aligned styles with the design kit. [#1899](https://github.com/IgniteUI/igniteui-webcomponents/pull/1899)
- #### Carousel
  - Updated and aligned styles with the design kit. [#1883](https://github.com/IgniteUI/igniteui-webcomponents/pull/1883)
- #### Chat
  - `adoptRootStyles` now also affects the input area custom renderers. [#1945](https://github.com/IgniteUI/igniteui-webcomponents/pull/1945)
  - Renamed `input-container` part to `input-area`. [#1954](https://github.com/IgniteUI/igniteui-webcomponents/pull/1954)
- #### Combo
  - Use the native `Map.groupBy` for grouping. [#1802](https://github.com/IgniteUI/igniteui-webcomponents/pull/1802)
  - Improved the keyboard navigation experience. [#1529](https://github.com/IgniteUI/igniteui-webcomponents/pull/1529)
  - Updated and aligned styles with the design kit. [#1870](https://github.com/IgniteUI/igniteui-webcomponents/pull/1870)
- #### Date picker
  - Updated and aligned styles with the design kit. [#1870](https://github.com/IgniteUI/igniteui-webcomponents/pull/1870)
- #### Date range picker
  - Updated and aligned styles with the design kit. [#1870](https://github.com/IgniteUI/igniteui-webcomponents/pull/1870)
- #### Input
  - Updated and aligned styles with the design kit. [#1870](https://github.com/IgniteUI/igniteui-webcomponents/pull/1870)
- #### Select
  - Updated and aligned styles with the design kit. [#1870](https://github.com/IgniteUI/igniteui-webcomponents/pull/1870)
- #### Textarea
  - Updated and aligned styles with the design kit. [#1870](https://github.com/IgniteUI/igniteui-webcomponents/pull/1870)

### Fixed
- #### Sass theme support
  - Components can be styled using the Sass tools from the theming package. [#1909](https://github.com/IgniteUI/igniteui-webcomponents/issues/1909) [#1926](https://github.com/IgniteUI/igniteui-webcomponents/issues/1926) [#1920](https://github.com/IgniteUI/igniteui-webcomponents/issues/1920) [#1933](https://github.com/IgniteUI/igniteui-webcomponents/issues/1933) [#1966](https://github.com/IgniteUI/igniteui-webcomponents/issues/1966) [#1972](https://github.com/IgniteUI/igniteui-webcomponents/issues/1972) [#1929](https://github.com/IgniteUI/igniteui-webcomponents/issues/1929) [#1935](https://github.com/IgniteUI/igniteui-webcomponents/issues/1935) [#1980](https://github.com/IgniteUI/igniteui-webcomponents/issues/1980) [#1991](https://github.com/IgniteUI/igniteui-webcomponents/issues/1991) [#2015](https://github.com/IgniteUI/igniteui-webcomponents/issues/2015)
- #### Calendar
  - Focus styles for month/year views. [#2030](https://github.com/IgniteUI/igniteui-webcomponents/issues/2030)
- #### Combo
  - Notch border styles. [#1965](https://github.com/IgniteUI/igniteui-webcomponents/issues/1965)
- #### Chat
  - Suggestions rendered at the wrong location when no header is present. [#1908](https://github.com/IgniteUI/igniteui-webcomponents/pull/1908)
  - Correct sequence and type for chat user typing events. [#1906](https://github.com/IgniteUI/igniteui-webcomponents/pull/1906)
  - `adoptRootStyles` correctly skips `@import` CSS rules from the page stylesheets. [#1931](https://github.com/IgniteUI/igniteui-webcomponents/pull/1931)
  - `adoptRootStyles` is correctly re-applied on theme swap. [#1950](https://github.com/IgniteUI/igniteui-webcomponents/pull/1950)
  - Replaced hardcoded `ig-size` style variable. [#1975](https://github.com/IgniteUI/igniteui-webcomponents/pull/1975)
- #### Checkbox & Switch
  - Internal ripple opacity when hovering over slotted content in the **helper-text** slot. [#1964](https://github.com/IgniteUI/igniteui-webcomponents/issues/1964)
- #### Date input, Date picker, Date range picker
  - Default display format now follows strictly locale format as per specification without leading zeros.
- #### Dialog
  - Underlying dialog element now has `display: contents` and won't participate in DOM layout. [#1947](https://github.com/IgniteUI/igniteui-webcomponents/issues/1947)
  - `keepOpenOnEscape` not preventing the dialog from closing when **Escape** is pressed. [#1986](https://github.com/IgniteUI/igniteui-webcomponents/issues/1986)
  - Base styles and theming. [#1997](https://github.com/IgniteUI/igniteui-webcomponents/issues/1997)
- #### List & List item
  - Added missing styles for slotted **igc-icon** in the list item. [#1985](https://github.com/IgniteUI/igniteui-webcomponents/issues/1985)
  - Icon and icon button sizes for the Indigo theme. [#2010](https://github.com/IgniteUI/igniteui-webcomponents/issues/2010)
- #### Mask input
  - Auto-fill behavior for mask patterns with literals. [#2006](https://github.com/IgniteUI/igniteui-webcomponents/issues/2006)
- #### Navbar
  - Icon and icon button sizes. [#1956](https://github.com/IgniteUI/igniteui-webcomponents/issues/1956)
- #### Select
  - Color for outlined type. [#1957](https://github.com/IgniteUI/igniteui-webcomponents/issues/1957)
- #### Tabs
  - Add active pseudo-elements backgrounds for the active tab in Material theme. [#1998](https://github.com/IgniteUI/igniteui-webcomponents/issues/1998)
  - Take scale factor when positioning the active tab indicator. [#2008](https://github.com/IgniteUI/igniteui-webcomponents/issues/2008)
  - Selected indicator alignment [#2028](https://github.com/IgniteUI/igniteui-webcomponents/issues/2028)
- #### Tooltip
  - Do not show the tooltip when the tooltip target is clicked. [#1828](https://github.com/IgniteUI/igniteui-webcomponents/issues/1828)
  - Removed the **max-width** constraint for slotted content. [#1936](https://github.com/IgniteUI/igniteui-webcomponents/issues/1936)

## [6.3.6] - 2025-11-14
### Fixed
- #### Date picker
  - Value not committed on browser auto-fill behavior [#1932](https://github.com/IgniteUI/igniteui-webcomponents/pull/1932)

## [6.3.5] - 2025-11-13
### Changed
- **License Update**: The project license has been updated to the MIT License, providing greater flexibility and openness for the community. This change reflects our commitment to fostering an inclusive and collaborative development environment while maintaining the high-quality standards you expect from Ignite UI Web Components.

## [6.3.4] - 2025-10-22
### Fixed
- #### Date picker
  - Issues when clearing the value and notch border in Material theme [#1894](https://github.com/IgniteUI/igniteui-webcomponents/pull/1894)
- #### Textarea
  - Stale internal input reference when switching between themes

## [6.3.3] - 2025-10-14
### Fixed
- #### Chat
  - Message actions not rendered after last message [#1882](https://github.com/IgniteUI/igniteui-webcomponents/pull/1882)
- #### Date picker
  - Change event not emitted for non-editable input configuration [#1885](https://github.com/IgniteUI/igniteui-webcomponents/pull/1885)

## [6.3.2] - 2025-10-07
### Added
- #### Chat
  - Updated markdown renderer code styles to integrate with the package theming [#1868](https://github.com/IgniteUI/igniteui-webcomponents/pull/1868)

### Fixed
- #### Card
  - Consume colors from themes [#1871](https://github.com/IgniteUI/igniteui-webcomponents/pull/1871)
  - Avatar size in card header [#1873](https://github.com/IgniteUI/igniteui-webcomponents/pull/1873)

## [6.3.1] - 2025-09-18
### Fixed
- peerDependencies versions

## [6.3.0] - 2025-09-18
### Added
- Chat component

### Fixed
- #### List
  - removed duplicated CSS variables across list components and themes [#1853](https://github.com/IgniteUI/igniteui-webcomponents/pull/1853)

## [6.2.2] - 2025-09-16
### Fixed
- Minor bug fixes around styles

## [6.2.1] - 2025-09-01
### Added
- #### Date picker
  - set picker calendar's active date on user input [#1819](https://github.com/IgniteUI/igniteui-webcomponents/pull/1819)

### Fixed
- #### Calendar
  - Navigation styling [#1831](https://github.com/IgniteUI/igniteui-webcomponents/pull/1831)
- #### Card
  - Slotted `igc-avatar` size styles in supported themes [#1833](https://github.com/IgniteUI/igniteui-webcomponents/pull/1833)
- #### Combo
  - Dropdown initial height [#1826](https://github.com/IgniteUI/igniteui-webcomponents/pull/1826)
  - Icon sizes styles for Indigo theme [#1827](https://github.com/IgniteUI/igniteui-webcomponents/pull/1827)
- #### Date picker, Date range picker
  - Disabled styles [#1834](https://github.com/IgniteUI/igniteui-webcomponents/pull/1834)
- #### Input
  - Prefix and suffix slot styles for Bootstrap theme [#1820](https://github.com/IgniteUI/igniteui-webcomponents/pull/1820)
  - Label and border styles for Material theme [#1824](https://github.com/IgniteUI/igniteui-webcomponents/pull/1824)
  - Removed overridden tabindex property [#1836](https://github.com/IgniteUI/igniteui-webcomponents/pull/1836)
- #### Select
  - Icon sizes styles for Indigo theme [#1827](https://github.com/IgniteUI/igniteui-webcomponents/pull/1827)
- #### Switch
  - Use the new thumb hover property [#1809](https://github.com/IgniteUI/igniteui-webcomponents/pull/1809)
- #### Tile manager
  - Incorrect escape of internal regex [#1837](https://github.com/IgniteUI/igniteui-webcomponents/pull/1837)

## [6.2.0] - 2025-08-04
### Added
- Form associated custom elements now expose the **ig-invalid** custom state for styling with the `:state()` CSS selector.
  [See here for additional information](https://developer.mozilla.org/en-US/docs/Web/CSS/:state)

### Changed
- Form associated custom elements validity behavior. Now elements will try to mimic `:user-invalid`, and won't apply invalid
  styles unless interacted through the UI or through a form `requestSubmit()/reset()` invocation.

### Fixed
- #### All igc-input based components
  - Invalid state in **readonly** mode [#1786](https://github.com/IgniteUI/igniteui-webcomponents/pull/1786)
  - Cannot style **helper-text** parts [#1786](https://github.com/IgniteUI/igniteui-webcomponents/pull/1786)
- #### Card
  - Slotted igc-avatar in Indigo theme [#1795](https://github.com/IgniteUI/igniteui-webcomponents/pull/1795)
- #### Combo
  - Border overlaps label text in invalid state [#1786](https://github.com/IgniteUI/igniteui-webcomponents/pull/1786)
- #### Date picker
  - Indigo elevation styles [#1799](https://github.com/IgniteUI/igniteui-webcomponents/pull/1799)
- #### Date range picker
  - Return focus to main input on keyboard interactions [#1783](https://github.com/IgniteUI/igniteui-webcomponents/pull/1783)
- #### Input
  - Placeholder and label alignment in Material theme [#1792](https://github.com/IgniteUI/igniteui-webcomponents/pull/1792)
- #### Navigation drawer
  - Update *relative* positions styles and animation [#1806](https://github.com/IgniteUI/igniteui-webcomponents/pull/1806)
- #### Select
  - Invalid state theming issues [#1786](https://github.com/IgniteUI/igniteui-webcomponents/pull/1786)
- #### Textarea
  - Material theme interaction issues [#1797](https://github.com/IgniteUI/igniteui-webcomponents/pull/1797)
  - Resizing behavior with suffix part [#1797](https://github.com/IgniteUI/igniteui-webcomponents/pull/1797)

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

[7.4.1]: https://github.com/IgniteUI/igniteui-webcomponents/compare/7.4.0...7.4.1
[7.4.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/7.3.2...7.4.0
[7.3.2]: https://github.com/IgniteUI/igniteui-webcomponents/compare/7.3.1...7.3.2
[7.3.1]: https://github.com/IgniteUI/igniteui-webcomponents/compare/7.3.0...7.3.1
[7.3.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/7.2.4...7.3.0
[7.2.4]: https://github.com/IgniteUI/igniteui-webcomponents/compare/7.2.3...7.2.4
[7.2.3]: https://github.com/IgniteUI/igniteui-webcomponents/compare/7.2.2...7.2.3
[7.2.2]: https://github.com/IgniteUI/igniteui-webcomponents/compare/7.2.1...7.2.2
[7.2.1]: https://github.com/IgniteUI/igniteui-webcomponents/compare/7.2.0...7.2.1
[7.2.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/7.1.3...7.2.0
[7.1.3]: https://github.com/IgniteUI/igniteui-webcomponents/compare/7.1.2...7.1.3
[7.1.2]: https://github.com/IgniteUI/igniteui-webcomponents/compare/7.1.1...7.1.2
[7.1.1]: https://github.com/IgniteUI/igniteui-webcomponents/compare/7.1.0...7.1.1
[7.1.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/7.0.1...7.1.0
[7.0.1]: https://github.com/IgniteUI/igniteui-webcomponents/compare/7.0.0...7.0.1
[7.0.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/6.5.1...7.0.0
[6.5.1]: https://github.com/IgniteUI/igniteui-webcomponents/compare/6.5.0...6.5.1
[6.5.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/6.4.0...6.5.0
[6.4.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/6.3.6...6.4.0
[6.3.6]: https://github.com/IgniteUI/igniteui-webcomponents/compare/6.3.5...6.3.6
[6.3.5]: https://github.com/IgniteUI/igniteui-webcomponents/compare/6.3.4...6.3.5
[6.3.4]: https://github.com/IgniteUI/igniteui-webcomponents/compare/6.3.3...6.3.4
[6.3.3]: https://github.com/IgniteUI/igniteui-webcomponents/compare/6.3.2...6.3.3
[6.3.2]: https://github.com/IgniteUI/igniteui-webcomponents/compare/6.3.1...6.3.2
[6.3.1]: https://github.com/IgniteUI/igniteui-webcomponents/compare/6.3.0...6.3.1
[6.3.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/6.2.2...6.3.0
[6.2.2]: https://github.com/IgniteUI/igniteui-webcomponents/compare/6.2.1...6.2.2
[6.2.1]: https://github.com/IgniteUI/igniteui-webcomponents/compare/6.2.0...6.2.1
[6.2.0]: https://github.com/IgniteUI/igniteui-webcomponents/compare/6.1.2...6.2.0
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

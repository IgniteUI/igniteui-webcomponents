# Date range picker: relative ranges and the picked range (#2534)

Status: Phases 1-3 done 2026-11-17, uncommitted (sections 13-15). Release waits for the i18n packages. Base: master 1123aca1. Issue:
https://github.com/IgniteUI/igniteui-webcomponents/issues/2534

## 1. Request

The use case is date filters in an embedded dashboard viewer. A filter holds a named period ("Last quarter") and the
app saves, reloads and shares it by that name. The issue lists four gaps:

| #   | Gap                                                                                       | Issue proposal                                       |
| --- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| G1  | A custom range holds fixed dates, so a relative period goes stale after midnight.         | `dateRange` also takes `() => DateRangeValue`        |
| G2  | The app cannot tell which chip the user clicked. `igcChange` carries only `{start, end}`. | `key` on ranges + `igcRangeSelect {key,label,value}` |
| G3  | No chip shows as selected when the picker opens again.                                    | `selectedRange` (read/write key)                     |
| G4  | The four built-in ranges are all or none, fixed order, no Yesterday/Last month/quarter.   | `predefinedRanges: string[]` + 9 new built-in keys   |

## 2. Decisions

| #   | Decision                                                                                          |
| --- | ------------------------------------------------------------------------------------------------- |
| D1  | G1: a separate `getDateRange` member (not a union on `dateRange`).                                 |
| D2  | G2: both a `selectedRange` property and a public event with the key, for two-way binding.          |
| D3  | G4: in this change (`predefinedRanges` + new built-in keys). Release waits for the i18n packages.  |
| D4  | Chips whose range fails `min`/`max`/`disabledDates` show as disabled, phase 2.                     |
| D5  | Midnight: the chip stays selected with the old dates until the app sets the key again (default, not asked). |

## 3. Current state on master

- [predefined-ranges-area.ts](src/components/date-range-picker/predefined-ranges-area.ts): the module table
  `PREDEFINED_RANGES` holds `{ resourceKey, getDateRange(today) }`. A built-in chip computes its range on click
  (#2528). A custom chip returns the `dateRange` object it got.
- The area emits an internal `igcRangeSelect` (not bubbling, not composed) with the `DateRangeValue` only.
- [date-range-picker.ts:674](src/components/date-range-picker/date-range-picker.ts#L674) `_handleRangeSelect`: sets
  `_value`; in dropdown mode emits `igcChange` (always, also for the same dates) and closes. In dialog mode Done
  commits through `_emitChangeIfDirty`, Cancel/Escape revert to `_oldValue`.
- The value changes through these paths: `value` setter (code), chip, calendar draw, editor commit, `clear()`,
  revert (dialog), form reset. Each one must set or clear the range key.
- The chip has `selectable` + `selected` (check icon + `aria-pressed`). A click on a selectable chip toggles
  `selected` itself and emits `igcSelect`.
- `CalendarDay.add` supports `'quarter'`. The picker has `weekStart` (locale default when not set).
- The I18nMixin puts `defaultEN` under all overrides, so a key that a locale lacks shows in English.

## 4. Constraints

- **`igcChange` detail stays `DateRangeValue`.** It is typed in the event map and is the two-way binding source of
  `value`.
- **Blazor.** `CustomDateRange` is a `jsonAPIPlainObject`. A function cannot cross the JSON boundary. A member can
  carry `/* blazorSuppress */` (precedent: `ChatInputRenderContext.attachments`). So G1 is not available in Blazor,
  and Blazor users get relative periods only from built-in keys (G4).
- **Two-way binding paths.** `@tsTwoWayProperty` takes nested paths (`detail.value`, `detail.checked`), so the key
  event can carry an object and bind `selectedRange` through `detail.key`.
- **React.** `@lit/react` sets every property on each render. A same-value write must be a no-op. A new
  `customRanges` or `predefinedRanges` array per render must not recompute the value.
- **Events only for user interaction** (coding guidelines).
- **Property set order.** Attributes, React props and Angular bindings set properties in an order the component does
  not control. `selectedRange` can arrive before `customRanges`.
- **i18n.** New labels go into `IDateRangePickerResourceStrings` in `IgniteUI/igniteui-i18n` (core EN + resources,
  19 locale files carry the current four). The deprecated `IgcDateRangePickerResourceStrings` and its key map get no
  new keys.
- **Angular parity.** `igx-predefined-ranges-area` has the same model and gaps (and still the `-7` bug of #2528).
  Its internal key type is `'last7Days' | 'currentMonth' | 'last30Days' | 'yearToDate'`.

## 5. Prior art

- MUI X shortcuts: `{ label, getValue({ isValid }) }`, a separate function member. A shortcut whose value fails
  validation shows as disabled. `onChange(value, context)` carries the picked shortcut. No selected state.
- Ant Design `presets`: `value` takes a value or a callback (since 5.8.0), a union on one member.

## 6. API

```ts
/* jsonAPIPlainObject */
export interface CustomDateRange {
  /** The text of the chip. */
  label: string;
  /** The fixed range of the chip. */
  dateRange?: DateRangeValue;
  /** A stable id for the range, reported by `selectedRange`. Default is the label. */
  key?: string;
  /* blazorSuppress */
  /** Returns the range when the user picks the chip. Use it for periods relative to today. */
  getDateRange?: () => DateRangeValue;
}

/** The keys of the built-in ranges. */
export type PredefinedRangeKey =
  | 'today' | 'yesterday'
  | 'last7Days' | 'last30Days'
  | 'lastWeek'
  | 'currentMonth' | 'lastMonth'
  | 'currentQuarter' | 'lastQuarter' | 'quarterToDate'
  | 'currentYear' | 'lastYear' | 'yearToDate';

/* jsonAPIPlainObject */
export interface IgcSelectedRangeChangeEventArgs {
  /** The key of the range, or `null` after the user types, draws or clears a range. */
  key: string | null;
  /** The label of the range, or `null` with a `null` key. */
  label: string | null;
  /** The committed value. */
  value: DateRangeValue | null;
}

// IgcDateRangePickerComponent
/** Which built-in ranges show, in this order, while `usePredefinedRanges` is set. */
predefinedRanges: PredefinedRangeKey[]; // default: last7Days, currentMonth, last30Days, yearToDate

/* @tsTwoWayProperty(true, "igcSelectedRangeChange", "detail.key", false) */
/** The key of the range that set the value. @attr selected-range */
selectedRange: string | null;

// @fires igcSelectedRangeChange - Emitted before `igcChange` when a user commit changes `selectedRange`.
```

Notes:

- `getDateRange` takes no arguments and wins over `dateRange`. The picker calls it on the click, when it resolves
  `selectedRange`, and (phase 2) when it renders the chips.
- `predefinedRanges` has no attribute (array). `use-predefined-ranges` stays the switch; its default list is the four
  ranges of today, so the change is backward compatible. Alternative not taken: a non-empty list shows without the
  switch.
- The event name follows `igcActiveDateChange` (calendar, property `activeDate`). The issue name `igcRangeSelect` is
  the inner event of the area, and "select" with a `null` key reads wrong.
- Naming to agree with the Angular team before release: `selectedRange` reads like the selected dates
  (alternatives: `selectedPreset`, `rangeKey`); `current*` follows the existing `currentMonth` (the issue wrote
  `thisQuarter`, `thisYear`).

## 7. Built-in ranges (new keys)

| Key              | Range (calendar periods, `weekStart` for weeks) | Label (EN)      |
| ---------------- | ----------------------------------------------- | --------------- |
| `today`          | today - today                                    | Today           |
| `yesterday`      | today-1 - today-1                                | Yesterday       |
| `lastWeek`       | the full week before this week                   | Last Week       |
| `lastMonth`      | first - last day of the previous month           | Last Month      |
| `currentQuarter` | first - last day of this quarter                 | Current Quarter |
| `lastQuarter`    | first - last day of the previous quarter         | Last Quarter    |
| `quarterToDate`  | first day of this quarter - today                | Quarter to Date |
| `currentYear`    | Jan 1 - Dec 31 of this year                      | Current Year    |
| `lastYear`       | Jan 1 - Dec 31 of last year                      | Last Year       |

- Quarters are calendar quarters (Q1 = January-March). Fiscal periods stay custom ranges.
- `lastWeek` uses the picker `weekStart`, so the chip matches the weeks the calendar shows.
- `currentQuarter` and `currentYear` include future days, as `currentMonth` does today.
- Not included (each key costs 19 translations): `currentWeek`, `weekToDate`, `monthToDate`, `last90Days`,
  `last12Months`.
- i18n path: PR to `IgniteUI/igniteui-i18n` (9 keys, EN + 18 locales). Until it ships, the EN labels go into
  `dateRangeI18nConfig.defaultEN` here, so other locales show English. Swap to the package when it ships; the release
  waits for it (D3).

## 8. Value and key rules

| Action                                   | `value`                   | `selectedRange`                        | Events                                         |
| ---------------------------------------- | ------------------------- | -------------------------------------- | ---------------------------------------------- |
| Chip click, dropdown                     | range of the chip         | chip key                               | key event if the key changed, `igcChange`, close |
| Chip click, dialog                       | range of the chip (draft) | chip key (draft)                       | none until Done                                |
| Dialog Done                              | commit                    | commit                                 | key event if the key changed, `igcChange` if the value changed |
| Dialog Cancel / Escape / dismiss         | revert                    | revert                                 | none                                           |
| Type in an editor, draw in the calendar  | new dates                 | `null`                                 | key event (if it was set) before `igcChange`   |
| `clear()`                                | `null` range              | `null`                                 | as `igcChange` does today                      |
| `value` / `select()` from code, other dates | new dates              | `null`                                 | none                                           |
| `value` from code, same dates            | no-op                     | kept                                   | none                                           |
| `selectedRange` from code                | computed now (or pending) | key                                    | none                                           |
| Form reset                               | default                   | `null` for other dates, else kept      | none                                           |

- `igcChange` keeps its meaning (the value changed). A key-only change in dialog mode ("This quarter" then
  "Quarter to date" on the last day of a quarter) emits only the key event.
- Set `selectedRange`: resolves at once against built-in keys (shown or not) and `customRanges`. An unknown key stays
  pending and resolves when `customRanges` changes. Once resolved, a new array does not recompute.
- A set of the same key recomputes; the value write is equality-gated, so it is a no-op on the same day (React-safe)
  and moves the dates after midnight. This is the documented way to refresh a relative period (D5).
- Keys must be unique; the first match in chip order wins (built-in chips render first). A custom range without
  `key` reports its `label`.
- Both `value` and `selectedRange` bound: the last write wins. The docs say "bind one of them".
- Selected chip: all chips `selectable`, `.selected=${live(key === selectedRange)}` (the chip toggles itself on
  click, `live` sets it again), `igcSelect` ignored. `aria-pressed` comes from the chip.

## 9. Phases

1. **Core** (G1, G2, G3): `getDateRange`, `key`, `selectedRange`, `igcSelectedRangeChange`, commit/revert of the
   key, selected chip, read-only fix (section 11). Internal: the area takes the selected key; its event detail gains
   the key. Keep `_handleRangeSelect(range, key)`, so the spy on its first argument in the common spec still holds.
2. **Validation-aware chips** (D4): a chip whose range fails `min`/`max`/`disabledDates` is disabled. The area
   computes the ranges at render, on each open. Read-only disables all chips.
3. **Built-in ranges** (G4): `predefinedRanges`, `PredefinedRangeKey`, the 9 ranges in the module table, EN bridge.
   In parallel: the `IgniteUI/igniteui-i18n` PR; swap the bridge when it ships.

## 10. Tests

- Fixed fake `Date` clock (the #2528 helper); a midnight rollover with `getDateRange` and with a same-key set.
- Key after a chip click (built-in, custom with key, custom without key); `null` after type/draw/clear/code value;
  kept on a same-value code write.
- Key event: order before `igcChange`, detail, not emitted for the same key, `null` after typing; dialog emits on
  Done only, nothing on Cancel/Escape, key-only change emits the key event without `igcChange`.
- `selected-range` before `customRanges` (pending), unknown key, a new `customRanges` array does not recompute.
- React-style re-sets: the same key, value and arrays on each "render": no events, no value change.
- Selected chip + `aria-pressed`, a click on the selected chip keeps it selected, axe audit.
- Read-only picker opened from code: chips are disabled.
- Phase 2: chips disabled for `min`, `max`, `disabledDates`; a relative range that becomes valid after midnight.
- Phase 3: each key over fixed dates, including year and quarter boundaries, `weekStart` 0/1/6 for `lastWeek`, a
  leap year; `predefinedRanges` order and subset; unknown keys ignored.
- SSR smoke: `selected-range` computes on the server clock. Risk: the server and the client can disagree on "today"
  across time zones at hydration.

## 11. Side findings (from reading the code, not reproduced)

- `_handleRangeSelect` has no `readOnly` check. The calendar path restores the selection when read-only. A read-only
  picker that opens from code (`show()`, `open`) takes a chip click and changes the value. Fixed in phase 1/2.
- The ranges wrapper has no group role or name. Not in scope (it needs a new string).
- igniteui-angular still selects 8 days for Last 7 Days (`add('day', -7)`).

## 12. Docs and release

spec.md (new revision, "Predefined and custom ranges" section, API table, resource strings table, scenarios),
CHANGELOG Added under Date range picker, a story with a saved-filter scenario, `npm run public-api:update`. Tell the
Angular team the final names, and file the i18n PR. Release after the i18n packages ship.

## 13. Phase 1 result (2026-11-17, uncommitted)

Built as section 6 and 8, with these differences:

- Form reset: no own rule. The reset writes the default value, and other dates clear the key as any value change
  does. The idea of the `selected-range` attribute as a reset default was dropped: re-selecting after the reset made
  the control non-pristine.
- The inner `igcRangeSelect` keeps `detail` = range (the area specs deep-compare it); the key rides on the event
  object (`Object.assign`, type `RangeSelectEvent`). The analyzer no longer saw the event, so the area has
  `@fires {CustomEvent} igcRangeSelect`, which keeps its `public-api.json` entry unchanged.
- The area takes the key through a `selectedRange` property. Chips are
  `selectable`, `.selected=${live(...)}`, `@igcSelect=${stopPropagation}` (the inner-event guard flags it otherwise),
  and the area renders again after a click, because the chip toggles itself on a click of its button.
- `findRangeChip(source, key)` in the area module: with `usePredefinedRanges`, built-in first, else custom first.
- The common spec helper `getEventArgs()` now finds the `igcChange` call (user approved): the key event comes first.
- Read-only: the picker ignores the chip click (no disabled chips yet; phase 2 can disable them).
- Mutation-checked: each guard (requestUpdate after a click, read-only, equality gate, key commit in
  `_emitChangeIfDirty`, pending resolve, revert restore, open snapshot, value-setter sync, `_value` clear,
  key precedence, `igcSelect` stop) fails at least one spec when removed.
- Story: the SalesReport story uses `getDateRange` + keys, `selected-range="last7Days"`, and shows the period name
  from `igcSelectedRangeChange`.

## 14. Phase 2 result (2026-11-17, uncommitted)

- The area gets two properties: `dateConstraints` (the picker `_dateConstraints`: `min` as
  Before, `max` as After, plus `disabledDates`) and `disabled` (the picker `readOnly`). A chip is disabled when
  `disabled` is set or a day of its range is in `dateConstraints`. The click listener is dropped on a disabled chip
  (`bindIf`), because a click on the chip outside its button still reaches the host.
- `rangeAvoids(range, ranges)` in validators.ts, shared with the `badInput` validator (which now stops at the first
  disabled day instead of building the full day list). A range with one end checks that end.
- Without constraints the area does not call `getDateRange` at render.
- The picker requests an update of the area in `update()` when it opens, so relative ranges are checked against the
  current day.
- The picker's own `readOnly` guard in `_handleRangeSelect` was removed: disabled chips made it unreachable.
- Spec gotcha: `simulateClick` dispatches a synthetic click, which runs the listeners of a disabled button (the chip
  toggled itself). Use the native `button.click()`, which a disabled button ignores.
- Mutation-checked: re-render on open, constraint disable, `bindIf`, empty shortcut, read-only binding, one-ended
  ranges, `rangeAvoids` (also caught by the existing badInput spec).

## 15. Phase 3 result (2026-11-17, uncommitted)

- `PredefinedRangeKey` (13 keys) and `predefinedRanges` (no attribute, default the four) on the picker. The area takes
  `predefinedRanges` and `weekStart` as properties. `usePredefinedRanges` stays the switch.
- The built-in table is a `Map` (a plain object would match `constructor` and other prototype keys). Unknown keys
  and repeats are skipped. `lastWeek` uses the picker `weekStart`; quarters are calendar quarters.
- `findRangeChip`: a built-in key wins over a custom range with that key only while it shows (in `predefinedRanges`
  with `usePredefinedRanges`).
- An empty `predefinedRanges` without custom ranges renders no ranges area.
- i18n bridge: `PredefinedRangeResourceStringsEN` in i18n.ts, spread into `defaultEN`. The controller takes a core
  string over `defaultEN` per key, so registered translations apply as soon as the core has the keys. No public
  type change: an override of a new label needs a cast until the core interface has the keys. When the i18n
  packages ship: bump both, drop the bridge, update the spec.md note under the resource strings table.
- i18n repo (`~/work/igniteui-i18n`, master, uncommitted): the nine keys in the core interface and EN, translations
  in all 18 locales (matched to the wording of the existing four labels in each locale), CHANGELOG Unreleased.
  `tsc`, `biome check` and 92 vitest tests pass. The translations need a native review (BG can be checked here).
- The SalesReport story uses `predefinedRanges` (with `lastMonth`, `quarterToDate`, `lastQuarter`) and keeps one
  custom `getDateRange` range, "Last 12 months".
- Mutation-checked: dedupe, picker `weekStart` binding, the shown-list check in `findRangeChip`, the empty-list
  check, the week offset (`+ 7`), the EN bridge.

## 16. /simplify, comment trim and code review (2026-11-17, uncommitted)

- Simplify: base `_markCommitted()` hook (open, `_emitChange`, `clear()`, both pickers' value setters), which also
  fixed a `clear()` gap (Cancel after `clear()` lost the key); `_revertValue` is two lines; the area gets the
  constraints only while open (`noConstraints` while closed), so no `_rangesArea` query and no checks while closed;
  the chip self-toggle is undone in its `igcSelect` handler (no `live`, no re-render per click); `isSpanInRanges`
  in calendar helpers checks a range per descriptor, not per day (badInput validator too); `weekStartOf` shared with
  `generateMonth`; `Record` table with resource keys derived as `date_range_picker_${key}`.
- Review fixes: a key from code is resolved again on the first update (attribute order of `week-start`, same-task
  `customRanges`); a write of the committed key (or null) keeps a dialog draft; a value write of the committed dates
  over a draft brings back the committed key; a `null` custom key falls back to the label; a disabled picker
  disables the chips; `predefinedRanges` default written as a literal (the analyzer ignores `@default`).
- Kept by decision: same-key re-set after midnight moves the dates (documented, frameworks re-set on render);
  `aria-pressed` toggle chips (no chip change).
- Skipped: optional month-end via `set` clamping; base min/max new `_dateConstraints` per React render (pre-existing,
  outside the diff); cancelable chip `igcSelect` (public chip change); `RangeSelectEvent` class; typed bridge keys
  (release waits for the core types); nesting the spec block into the old 'Predefined ranges' block (double spy);
  dropping `PredefinedRange`/`fromPredefined` (an old area spec reads `_predefinedRanges.getDateRange(today)`);
  dropdown same-dates `igcChange` (kept as for a calendar selection; spec text fixed).

- 2026-11-17: the user removed the `@hidden @internal` tags from the area properties (the area is internal anyway, and
  its other properties are listed). The manifest and `public-api.json` now list `selectedRange`, `predefinedRanges`,
  `weekStart`, `dateConstraints` and `disabled` on `igc-predefined-ranges-area`.

/**
 * Whether the next `data` of each combo holds new results, from a binder that
 * knows it, such as `bindComboDataSource()`. The combo then does not guess.
 * `ComboDataRequests` reads and clears the entry. The module has no imports,
 * so a binder can use it without the combo code.
 */
export const newResultsHints = new WeakMap<object, boolean>();

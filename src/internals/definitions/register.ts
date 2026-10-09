export type IgniteComponent = CustomElementConstructor & {
  tagName: string;
  register: () => void;
};

/** The tags already reported as owned by another class. */
const reportedClashes = new Set<string>();

export function registerComponent(
  component: IgniteComponent,
  ...dependencies: IgniteComponent[]
): void {
  for (const dependency of dependencies) {
    dependency.register();
  }

  const defined = customElements.get(component.tagName);

  if (!defined) {
    customElements.define(component.tagName, component);
  } else if (defined !== component && !reportedClashes.has(component.tagName)) {
    // Another copy or version of the library, or another element, owns the tag.
    reportedClashes.add(component.tagName);
    // oxlint-disable-next-line no-console -- the only signal of a lost definition
    console.warn(
      `<${component.tagName}> is already defined by another class, so this copy of igniteui-webcomponents does not define it.`
    );
  }
}

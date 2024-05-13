export type IgniteComponent = CustomElementConstructor & {
  tagName: string;
  register: () => void;
};

export function registerComponent(
  component: IgniteComponent,
  ...dependencies: IgniteComponent[]
) {
  for (const dependency of dependencies) {
    dependency.register();
  }

  if (!customElements.get(component.tagName)) {
    customElements.define(component.tagName, component);
  }
}

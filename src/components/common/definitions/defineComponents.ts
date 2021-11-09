export const defineComponents = (...components: CustomElementConstructor[]) => {
  for (const component of components) {
    const tagName = (component as any).tagName;

    if (tagName && !window.customElements.get(tagName)) {
      window.customElements.define(tagName, component);
    }
  }
};

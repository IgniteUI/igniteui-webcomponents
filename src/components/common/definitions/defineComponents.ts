import type { IgniteComponent } from '../types';

export const defineComponents = (...components: IgniteComponent[]) => {
  for (const component of components) {
    component.register();
  }
};

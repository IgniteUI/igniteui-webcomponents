import type { IgniteComponent } from './register.js';

export function defineComponents(...components: IgniteComponent[]) {
  for (const component of components) {
    component.register();
  }
}

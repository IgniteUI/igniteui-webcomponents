// const iconsRegistry = new Map<string, Map<string, string>>();

export class IconsRegistry {
  private static _instance: IconsRegistry;

  static instance() {
    if (!IconsRegistry._instance) {
      IconsRegistry._instance = new IconsRegistry();
    }

    return IconsRegistry._instance;
  }

  private iconsRegistry = new Map<string, Map<string, string>>();
  private callbacks = new Set<(name: string, set: string) => void>();

  subscribe(callback: (name: string, set: string) => void) {
    this.callbacks.add(callback);
  }

  unsubscribe(callback: (name: string, set: string) => void) {
    this.callbacks.delete(callback);
  }

  registerIcon(name: string, iconText: string, set = 'default') {
    const div = document.createElement('div');
    div.innerHTML = iconText;
    const svg = div.querySelector('svg') as SVGElement;

    if (svg) {
      svg.setAttribute('fit', '');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      svg.removeAttribute('width');
      svg.removeAttribute('height');
      const svgText = svg.outerHTML;

      const setRegistry = this.getOrCreateIconSet(set);
      setRegistry.set(name, svgText);
      this.callbacks.forEach((c) => c(name, set));
    } else {
      throw new Error('SVG element not found.');
    }
  }

  getIcon(name: string, set = 'default') {
    if (this.iconsRegistry.has(set) && this.iconsRegistry.get(set)?.has(name)) {
      return this.iconsRegistry.get(set)?.get(name);
    }

    return undefined;
  }

  private getOrCreateIconSet(name: string) {
    let set: Map<string, string>;

    if (this.iconsRegistry.has(name)) {
      set = this.iconsRegistry.get(name) as Map<string, string>;
    } else {
      set = new Map<string, string>();
      this.iconsRegistry.set(name, set);
    }

    return set;
  }
}

export const registerIcon = async (
  name: string,
  url: string,
  set = 'default'
) => {
  const response = await fetch(url);

  if (response.ok) {
    const value = await response.text();
    IconsRegistry.instance().registerIcon(name, value, set);
  } else {
    throw new Error(`Icon request failed. Status: ${response.status}.`);
  }
};

export const registerIconFromText = (
  name: string,
  iconText: string,
  set = 'default'
) => {
  IconsRegistry.instance().registerIcon(name, iconText, set);
};

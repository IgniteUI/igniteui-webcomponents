export class IconsRegistry {
  private static _instance: IconsRegistry;

  public static instance() {
    if (!IconsRegistry._instance) {
      IconsRegistry._instance = new IconsRegistry();
    }

    return IconsRegistry._instance;
  }

  private iconsRegistry = new Map<string, Map<string, string>>();
  private callbacks = new Set<(name: string, collection: string) => void>();

  public subscribe(callback: (name: string, collection: string) => void) {
    this.callbacks.add(callback);
  }

  public unsubscribe(callback: (name: string, collection: string) => void) {
    this.callbacks.delete(callback);
  }

  public registerIcon(name: string, iconText: string, collection = 'default') {
    const div = document.createElement('div');
    div.innerHTML = iconText;
    const svg = div.querySelector('svg') as SVGElement;

    if (svg) {
      svg.setAttribute('fit', '');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      const svgText = svg.outerHTML;

      const collectionRegistry = this.getOrCreateIconCollection(collection);
      collectionRegistry.set(name, svgText);
      this.callbacks.forEach((c) => c(name, collection));
    } else {
      throw new Error('SVG element not found.');
    }
  }

  public getIcon(name: string, collection = 'default') {
    if (
      this.iconsRegistry.has(collection) &&
      this.iconsRegistry.get(collection)?.has(name)
    ) {
      return this.iconsRegistry.get(collection)?.get(name);
    }

    return undefined;
  }

  private getOrCreateIconCollection(name: string) {
    let collection: Map<string, string>;

    if (this.iconsRegistry.has(name)) {
      collection = this.iconsRegistry.get(name) as Map<string, string>;
    } else {
      collection = new Map<string, string>();
      this.iconsRegistry.set(name, collection);
    }

    return collection;
  }
}

export const registerIcon = async (
  name: string,
  url: string,
  collection = 'default'
) => {
  const response = await fetch(url);

  if (response.ok) {
    const value = await response.text();
    IconsRegistry.instance().registerIcon(name, value, collection);
  } else {
    throw new Error(`Icon request failed. Status: ${response.status}.`);
  }
};

export const registerIconFromText = (
  name: string,
  iconText: string,
  collection = 'default'
) => {
  IconsRegistry.instance().registerIcon(name, iconText, collection);
};

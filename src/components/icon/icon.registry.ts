interface IconCollection {
  [name: string]: string;
}

export class IconsRegistry {
  private static _instance: IconsRegistry;

  static instance() {
    if (!IconsRegistry._instance) {
      IconsRegistry._instance = new IconsRegistry();
    }

    return IconsRegistry._instance;
  }

  private iconsRegistry = new Map<string, IconCollection>();
  private callbacks = new Set<(name: string, collection: string) => void>();

  constructor() {
    this.iconsRegistry.set('internal', internalIcons);
  }

  subscribe(callback: (name: string, collection: string) => void) {
    this.callbacks.add(callback);
  }

  unsubscribe(callback: (name: string, collection: string) => void) {
    this.callbacks.delete(callback);
  }

  registerIcon(name: string, iconText: string, collection = 'default') {
    const div = document.createElement('div');
    div.innerHTML = iconText;
    const svg = div.querySelector('svg') as SVGElement;

    if (svg) {
      svg.setAttribute('fit', '');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      const svgText = svg.outerHTML;

      const collectionRegistry = this.getOrCreateIconCollection(collection);
      collectionRegistry[name] = svgText;
      this.callbacks.forEach((c) => c(name, collection));
    } else {
      throw new Error('SVG element not found.');
    }
  }

  getIcon(name: string, collection = 'default') {
    if (this.iconsRegistry.has(collection)) {
      return this.iconsRegistry.get(collection)![name];
    }

    return undefined;
  }

  private getOrCreateIconCollection(name: string) {
    let collection: IconCollection;

    if (this.iconsRegistry.has(name)) {
      collection = this.iconsRegistry.get(name)!;
    } else {
      collection = {};
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

const internalIcons: IconCollection = {
  navigate_before: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M15.61 7.41L14.2 6l-6 6 6 6 1.41-1.41L11.03 12l4.58-4.59z"/></svg>`,
  navigate_next: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M10.02 6L8.61 7.41 13.19 12l-4.58 4.59L10.02 18l6-6-6-6z"/></svg>`,
};

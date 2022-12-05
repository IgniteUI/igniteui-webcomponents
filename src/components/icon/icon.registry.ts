interface IconCollection {
  [name: string]: string;
}

export class IconsRegistry {
  private static _instance: IconsRegistry;

  public static instance() {
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
      collectionRegistry[name] = svgText;
      this.callbacks.forEach((c) => c(name, collection));
    } else {
      throw new Error('SVG element not found.');
    }
  }

  public getIcon(name: string, collection = 'default') {
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
  keyboard_arrow_up: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>`,
  keyboard_arrow_down: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>`,
  keyboard_arrow_right: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>`,
  chip_cancel: `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>`,
  chip_select: `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`,
  star: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px"><path d="M0 0h24v24H0z" fill="none"/><path d="M0 0h24v24H0z" fill="none"/><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`,
  star_border: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px"><path d="M0 0h24v24H0z" fill="none"/><path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/></svg>`,
  case_sensitive: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path d="M21.2 16.5c0-.2-.1-.5-.1-.7v-4.4c0-.4-.1-.8-.3-1.2-.2-.3-.5-.6-.8-.7-.3-.2-.7-.3-1.1-.3-.4-.1-.8-.1-1.2-.1-.5 0-.9 0-1.4.1-.4.1-.8.3-1.2.5-.3.2-.6.5-.8.9s-.3.9-.3 1.3h1.4c0-.5.2-1 .7-1.3.5-.2 1-.4 1.5-.3.2 0 .5 0 .7.1.2 0 .4.1.6.2.2.1.3.2.5.4.1.2.2.5.2.7s-.1.4-.2.6c-.2.2-.4.3-.6.3-.3.1-.6.1-.9.2-.4 0-.7.1-1.1.2-.4.1-.7.1-1.1.2-.3.1-.7.2-1 .4s-.5.5-.7.8c-.2.4-.3.8-.3 1.2s.1.8.2 1.1c.1.3.4.5.6.7.3.2.6.3.9.4.9.2 1.9.2 2.8-.2.5-.2 1-.6 1.4-1 0 .4.1.7.3 1 .2.2.6.3.9.3.4 0 .7-.1 1-.2v-1.1c-.1 0-.3.1-.4.1-.1.1-.2 0-.2-.2zm-1.5-1.7c0 .2-.1.4-.2.6-.1.2-.3.5-.5.6-.2.2-.5.4-.8.5-.4.1-.8.2-1.2.2-.2 0-.4 0-.6-.1-.2 0-.4-.1-.5-.2-.2-.1-.3-.2-.4-.4-.1-.2-.2-.4-.1-.6 0-.3.1-.6.2-.8.2-.2.4-.4.6-.5.3-.1.6-.2.9-.2s.7-.1 1-.1.6-.1.9-.1.5-.1.7-.3v1.4zm-9.6-.4l1.3 3.6h1.8L8.5 6H6.7L2 18h1.7L5 14.4h5.1zm-2.5-7l2.1 5.5H5.5l2.1-5.5z"></path></svg>`,
  clear: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
  arrow_drop_up: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M7 14l5-5 5 5z"/></svg>`,
  arrow_drop_down: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M7 10l5 5 5-5z"/></svg>`,
};

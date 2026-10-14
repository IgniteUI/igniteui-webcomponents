import { ContextConsumer } from '@lit/context';
import type { LitElement } from 'lit';
import { chatContext } from '#internals/context.js';
import {
  type AdoptedStylesController,
  addAdoptedStylesController,
} from '#internals/controllers/adopt-styles.js';
import type { ChatState } from './chat-state.js';

/**
 * Gives a part of the chat the state of its chat, and adopts the page styles
 * into the part while the `adoptRootStyles` option is set.
 */
class ChatStateConsumer {
  private readonly _host: LitElement;
  private readonly _adoptedStyles: AdoptedStylesController;
  private readonly _consumer: ContextConsumer<typeof chatContext, LitElement>;

  private _adoptRootStyles = false;

  /** Undefined until the context resolves. */
  public get state(): ChatState | undefined {
    return this._consumer.value;
  }

  constructor(host: LitElement) {
    this._host = host;
    this._adoptedStyles = addAdoptedStylesController(host);
    this._consumer = new ContextConsumer(host, {
      context: chatContext,
      callback: () => this._handleStateChange(),
      subscribe: true,
    });
  }

  /** Clones the page styles again, for a change the tracker cannot see. */
  public refreshStyles(): void {
    this._adoptedStyles.invalidateCache(this._host.ownerDocument);
    this._adoptedStyles.shouldAdoptStyles(this._adoptRootStyles);
  }

  private _handleStateChange(): void {
    const adopt = Boolean(this.state?.options?.adoptRootStyles);

    // The chat publishes on each state change, not only on an option change.
    if (adopt !== this._adoptRootStyles) {
      this._adoptRootStyles = adopt;
      this._adoptedStyles.shouldAdoptStyles(adopt);
    }
  }
}

/** Creates a {@link ChatStateConsumer} for the given host. */
export function addChatStateConsumer(host: LitElement): ChatStateConsumer {
  return new ChatStateConsumer(host);
}

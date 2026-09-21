import { ChatResourceStringsEN } from 'igniteui-i18n-core';
import { chatResourcesMap, convertToIgcResource } from '../utils.js';

/* blazorSuppress */
/**
 * @deprecated since 7.2.0. Use the newly provided `IChatResourceStrings`
 * interface, or set global resource strings with the `registerI18n` method.
 */
export interface IgcChatResourceStrings {
  suggestionsHeader?: string;
  reactionCopy?: string;
  reactionLike?: string;
  reactionDislike?: string;
  reactionRegenerate?: string;
  attachmentLabel?: string;
  attachmentsListLabel?: string;
  messageCopied?: string;
}

/**
 * @deprecated since 7.2.0. Use the newly provided resources from the
 * igniteui-i18n-resources package.
 */
export const IgcChatResourceStringEN: IgcChatResourceStrings =
  convertToIgcResource(ChatResourceStringsEN, chatResourcesMap);

/* blazorSuppress */
/** @deprecated Please use the newly provided IChatResourceStrings interfaces from or set global resource strings using `registerI18n` method. */
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

/** @deprecated Please use the newly provided resources from the igniteui-i18n-resources package. */
export const IgcChatResourceStringEN: IgcChatResourceStrings = {
  suggestionsHeader: 'Suggestions',
  reactionCopy: 'Copy',
  reactionLike: 'Like',
  reactionDislike: 'Dislike',
  reactionRegenerate: 'Regenerate',
  attachmentLabel: 'Attachment',
  attachmentsListLabel: 'Attachments',
  messageCopied: 'Message copied to clipboard',
};

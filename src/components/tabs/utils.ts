export const observerConfig: MutationObserverInit = {
  attributes: true,
  attributeFilter: ['selected'],
  childList: true,
  subtree: true,
};

function isMatchingTag(node: Node, ...tags: string[]) {
  return tags ? tags.includes(node.nodeName.toLowerCase()) : true;
}

/**
 * Returns all targets with attribute mutations matching `tags`
 */
export function getAttributesForTags<T extends Element>(
  records: MutationRecord[],
  ...tags: string[]
) {
  return records
    .filter(
      ({ type, target }) =>
        type === 'attributes' && isMatchingTag(target, ...tags)
    )
    .map(({ target }) => target as T);
}

/**
 * Returns all targets with childList mutations matching tags.
 * If `root` is specified, returns only targets that are direct children
 * of `root`.
 */
export function getNodesForTags<T extends Element>(
  records: MutationRecord[],
  root?: Element,
  ...tags: string[]
) {
  const collected: {
    addedNodes: T[];
    removedNodes: T[];
  } = { addedNodes: [], removedNodes: [] };

  return records
    .filter(
      ({ type, target }) =>
        type === 'childList' && (root ? target.isSameNode(root) : true)
    )
    .reduce((prev, curr) => {
      prev.addedNodes = prev.addedNodes.concat(
        Array.from(curr.addedNodes)
          .filter((node) => isMatchingTag(node, ...tags))
          .map((node) => node as T)
      );
      prev.removedNodes = prev.removedNodes.concat(
        Array.from(curr.removedNodes)
          .filter((node) => isMatchingTag(node, ...tags))
          .map((node) => node as T)
      );
      return prev;
    }, collected);
}

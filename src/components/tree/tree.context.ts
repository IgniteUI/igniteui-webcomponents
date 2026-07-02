import { createContext } from '@lit/context';
import type IgcTreeComponent from './tree.js';

/**
 * Provides the owning `igc-tree` instance to descendant `igc-tree-item`s.
 */
export const treeContext = createContext<IgcTreeComponent | undefined>(
  Symbol('igc-tree-context')
);

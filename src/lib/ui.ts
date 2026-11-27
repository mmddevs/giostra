'use client';

import { useSyncExternalStore } from 'react';

/** Which overlay is open. Shared by the hero buttons, the top bar and the dialogs. */
export type Panel = 'menu' | 'cart' | null;

let panel: Panel = null;
const listeners = new Set<() => void>();

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => void listeners.delete(fn);
};

export const setPanel = (next: Panel): void => {
  panel = next;
  listeners.forEach((fn) => fn());
};

export const usePanel = (): Panel => useSyncExternalStore(subscribe, () => panel, () => null);
export const subscribePanel = (fn: (open: boolean) => void) => subscribe(() => fn(panel !== null));

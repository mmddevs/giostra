'use client';

import { useSyncExternalStore } from 'react';

export interface CartLine {
  id: string;
  title: string;
  detail: string;
  price: number;
  qty: number;
  img: string;
}

const KEY = 'giostra-cart';
const EMPTY: CartLine[] = [];
const listeners = new Set<() => void>();
let lines: CartLine[] | null = null;

const read = (): CartLine[] => {
  if (lines) return lines;
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    lines = Array.isArray(raw) ? (raw as CartLine[]) : [];
  } catch {
    lines = [];
  }
  return lines;
};

const write = (next: CartLine[]): void => {
  lines = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private window: the cart lives for this visit only */
  }
  listeners.forEach((fn) => fn());
};

export const cart = {
  add(line: Omit<CartLine, 'qty'>): void {
    const all = read();
    write(
      all.some((l) => l.id === line.id)
        ? all.map((l) => (l.id === line.id ? { ...l, qty: l.qty + 1 } : l))
        : [...all, { ...line, qty: 1 }],
    );
  },
  change(id: string, delta: number): void {
    write(read().map((l) => (l.id === id ? { ...l, qty: l.qty + delta } : l)).filter((l) => l.qty > 0));
  },
};

export const useCart = () => {
  const all = useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => void listeners.delete(fn);
    },
    read,
    () => EMPTY,
  );
  return {
    lines: all,
    count: all.reduce((n, l) => n + l.qty, 0),
    total: all.reduce((n, l) => n + l.qty * l.price, 0),
  };
};

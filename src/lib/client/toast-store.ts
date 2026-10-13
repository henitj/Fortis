"use client";

import { useSyncExternalStore } from "react";

export interface Toast {
  id: number;
  title: string;
  description?: string;
  tone?: "default" | "success" | "error";
}

let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const EMPTY: Toast[] = [];

function emit() {
  for (const l of listeners) l();
}

export function toast(input: Omit<Toast, "id">, durationMs = 4500): void {
  const id = nextId++;
  toasts = [...toasts.slice(-2), { ...input, id }];
  emit();
  window.setTimeout(() => dismissToast(id), durationMs);
}

export function dismissToast(id: number): void {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function useToasts(): Toast[] {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    () => toasts,
    () => EMPTY,
  );
}

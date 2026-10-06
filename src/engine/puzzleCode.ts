import type { CategoryValue, RequiredCategorySlot } from './types';

interface EncodedPuzzle {
  s: number;
  t: number;
  r: { c: RequiredCategorySlot['categoryId']; v: CategoryValue }[];
}

export function encodePuzzleCode(start: number, target: number, required: RequiredCategorySlot[]): string {
  const payload: EncodedPuzzle = {
    s: start,
    t: target,
    r: required.map((slot) => ({ c: slot.categoryId, v: slot.value })),
  };
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodePuzzleCode(
  code: string,
): { start: number; target: number; required: RequiredCategorySlot[] } | null {
  try {
    const base64 = code.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json) as EncodedPuzzle;

    if (typeof parsed.s !== 'number' || typeof parsed.t !== 'number' || !Array.isArray(parsed.r)) {
      return null;
    }

    const required: RequiredCategorySlot[] = parsed.r.map((entry) => ({
      categoryId: entry.c,
      value: entry.v,
    }));

    return { start: parsed.s, target: parsed.t, required };
  } catch {
    return null;
  }
}

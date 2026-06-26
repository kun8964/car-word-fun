import type { VehicleColor, VehicleCategory } from './vehicleData';

export type StorageV2 = {
  colorOverrides: Record<string, VehicleColor>;
  categoryOverrides: Record<string, VehicleCategory>;
  lockedColors: Record<string, boolean>;
  lockedCategories: Record<string, boolean>;
  collectedCards: string[];
  streak: number;
};

export const DEFAULT_V2: StorageV2 = {
  colorOverrides: {},
  categoryOverrides: {},
  lockedColors: {},
  lockedCategories: {},
  collectedCards: [],
  streak: 0,
};

const KEY_V2 = 'car-car-adventure-tags-v2';
const KEY_V1 = 'car-car-adventure-color-tags-v1';

export function readV2(): StorageV2 {
  try {
    const raw = localStorage.getItem(KEY_V2);
    if (!raw) return { ...DEFAULT_V2 };
    return { ...DEFAULT_V2, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_V2 };
  }
}

export function writeV2(data: StorageV2): void {
  localStorage.setItem(KEY_V2, JSON.stringify(data));
}

export function migrateV1toV2(): void {
  try {
    const raw = localStorage.getItem(KEY_V1);
    if (!raw) return;
    const v1ColorOverrides = JSON.parse(raw) as Record<string, VehicleColor>;
    const existing = readV2();
    if (Object.keys(existing.colorOverrides).length > 0) return;
    writeV2({ ...existing, colorOverrides: v1ColorOverrides });
  } catch {
    /* v1 data corrupt, silently use defaults */
  }
}

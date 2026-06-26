import { describe, it, expect, beforeEach } from 'vitest';
import { readV2, writeV2, migrateV1toV2, DEFAULT_V2 } from '../storage';

describe('storage', () => {
  beforeEach(() => localStorage.clear());

  it('should return default empty state when nothing stored', () => {
    expect(readV2()).toEqual(DEFAULT_V2);
  });

  it('should persist and read colorOverrides', () => {
    const data = { ...DEFAULT_V2, colorOverrides: { '458': 'red' } };
    writeV2(data);
    expect(readV2().colorOverrides).toEqual({ '458': 'red' });
  });

  it('should persist and read collectedCards', () => {
    const data = { ...DEFAULT_V2, collectedCards: ['458', 'g63'] };
    writeV2(data);
    expect(readV2().collectedCards).toEqual(['458', 'g63']);
  });

  it('should migrate v1 data to v2', () => {
    localStorage.setItem('car-car-adventure-color-tags-v1', JSON.stringify({ '458': 'red', 'g63': 'black' }));
    migrateV1toV2();
    const v2 = readV2();
    expect(v2.colorOverrides).toEqual({ '458': 'red', 'g63': 'black' });
    expect(v2.categoryOverrides).toEqual({});
    expect(v2.collectedCards).toEqual([]);
  });

  it('should not overwrite existing v2 colorOverrides during migration', () => {
    writeV2({ ...DEFAULT_V2, colorOverrides: { 'a4': 'blue' } });
    localStorage.setItem('car-car-adventure-color-tags-v1', JSON.stringify({ '458': 'red' }));
    migrateV1toV2();
    expect(readV2().colorOverrides).toEqual({ 'a4': 'blue' });
  });

  it('should handle corrupt data gracefully', () => {
    localStorage.setItem('car-car-adventure-tags-v2', 'not-json{');
    expect(readV2()).toEqual(DEFAULT_V2);
  });
});

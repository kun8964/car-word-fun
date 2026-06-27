import { describe, it, expect } from 'vitest';
import { VEHICLES, VALID_COLORS, Vehicle } from '../vehicleData';

describe('vehicleData', () => {
  it('should have 52 vehicles', () => {
    expect(VEHICLES).toHaveLength(52);
  });

  it('should have valid color and category for every vehicle', () => {
    VEHICLES.forEach((v: Vehicle) => {
      expect(v.id).toBeTruthy();
      expect(v.name).toBeTruthy();
      expect(v.image).toBeTruthy();
      expect(VALID_COLORS).toContain(v.color);
      expect(v.category).toBeTruthy();
    });
  });

  it('should have unique vehicle IDs', () => {
    const ids = VEHICLES.map((v: Vehicle) => v.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

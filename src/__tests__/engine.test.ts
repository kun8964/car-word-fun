import { describe, it, expect } from 'vitest';
import { VEHICLES, VehicleColor, VehicleCategory } from '../vehicleData';
import { createRound, evaluatePick, formatRoundLabel, sample, shuffle } from '../game/engine';
import type { RoundGenParams } from '../game/engine';

describe('sample', () => {
  it('returns correct number of items', () => {
    const items = [1, 2, 3, 4, 5];
    expect(sample(items, 3)).toHaveLength(3);
  });

  it('returns all items when count equals length', () => {
    const items = [1, 2, 3];
    expect(sample(items, 3)).toHaveLength(3);
  });

  it('returns empty when count is 0', () => {
    expect(sample([1, 2, 3], 0)).toHaveLength(0);
  });
});

describe('shuffle', () => {
  it('returns same length', () => {
    const items = [1, 2, 3, 4, 5];
    expect(shuffle(items)).toHaveLength(5);
  });

  it('contains all original elements', () => {
    const items = [1, 2, 3, 4, 5];
    expect(shuffle(items).sort()).toEqual([1, 2, 3, 4, 5]);
  });
});

function makeParams(overrides: Partial<RoundGenParams> = {}): RoundGenParams {
  const markedVehicles = VEHICLES.filter((v) => v.color !== 'unknown');
  const colorCounts = new Map<VehicleColor, number>();
  markedVehicles.forEach((v) => {
    colorCounts.set(v.color, (colorCounts.get(v.color) || 0) + 1);
  });

  return {
    colorCounts,
    markedVehicles,
    categoryForVehicle: (v) => v.category,
    colorForVehicle: (v) => v.color,
    collectedCards: ['458', 'g63', 'f40', 'ae86', 'r8'],
    language: 'zh',
    colorLabel: (c: VehicleColor) => c,
    ...overrides,
  };
}

describe('createRound', () => {
  it('generates a valid round with options', () => {
    const round = createRound(makeParams());
    expect(round.questionType).toBeDefined();
    if (round.questionType === 'math') {
      expect(round.mathQuestion).toBeTruthy();
      expect(round.mathChoices?.length).toBeGreaterThan(0);
    } else {
      expect(round.options.length).toBeGreaterThan(0);
    }
    expect(round.targetCount).toBeGreaterThan(0);
    expect(round.result).toBe('idle');
    expect(round.selectedIds).toEqual([]);
  });

  it('generates color round when available', () => {
    const params = makeParams();
    params.markedVehicles = VEHICLES.filter((v) => v.color !== 'unknown');
    params.colorCounts = new Map();
    params.markedVehicles.forEach((v) => {
      params.colorCounts.set(v.color, (params.colorCounts.get(v.color) || 0) + 1);
    });

    for (let i = 0; i < 10; i++) {
      const round = createRound(params);
      if (round.questionType === 'math') {
        // Math rounds have empty options — valid
        expect(round.mathChoices).toBeTruthy();
        continue;
      }
      expect(round.options.length).toBeGreaterThan(0);
      expect(round.targetCount).toBeGreaterThan(0);
      if (round.questionType === 'color') {
        expect(round.targetColor).toBeDefined();
      }
    }
  });

  it('generates math round when collectedCards >= 3', () => {
    const params = makeParams({ collectedCards: ['458', 'g63', 'f40', 'ae86'] });
    let mathCount = 0;
    for (let i = 0; i < 30; i++) {
      const round = createRound(params);
      if (round.questionType === 'math') {
        mathCount++;
        expect(round.mathQuestion).toBeTruthy();
        expect(round.mathChoices).toHaveLength(4);
        expect(round.mathChoices).toContain(round.targetCount);
      }
    }
    // At least some math rounds should appear
    expect(mathCount).toBeGreaterThan(0);
  });

  it('options are shuffled (not in original order)', () => {
    const params = makeParams();
    let sameOrder = 0;
    for (let i = 0; i < 10; i++) {
      const round = createRound(params);
      if (round.questionType === 'color' && round.options.length >= 2) {
        // Check if shuffled by comparing with VEHICLES order
        const ids = round.options.map((v) => v.id);
        const sorted = [...ids].sort();
        if (ids.join(',') === sorted.join(',')) sameOrder++;
      }
    }
    // Most rounds should be shuffled
    expect(sameOrder).toBeLessThan(8);
  });
});

describe('evaluatePick', () => {
  it('detects correct color pick', () => {
    const params = makeParams();
    // Force a color round with specific target
    const round = createRound(params);
    if (round.questionType !== 'color' || !round.targetColor) return;

    const correctVehicle = round.options.find((v) => v.color === round.targetColor);
    if (!correctVehicle) return;

    const result = evaluatePick({
      vehicle: correctVehicle,
      round,
      colorForVehicle: (v) => v.color,
      categoryForVehicle: (v) => v.category,
    });
    expect(result.correct).toBe(true);
    expect(result.selectedIds).toContain(correctVehicle.id);
  });

  it('detects wrong pick', () => {
    const params = makeParams();
    const round = createRound(params);
    if (round.questionType !== 'color' || !round.targetColor) return;

    const wrongVehicle = round.options.find((v) => v.color !== round.targetColor);
    if (!wrongVehicle) return;

    const result = evaluatePick({
      vehicle: wrongVehicle,
      round,
      colorForVehicle: (v) => v.color,
      categoryForVehicle: (v) => v.category,
    });
    expect(result.correct).toBe(false);
    expect(result.result).toBe('wrong');
  });

  it('ignores already selected vehicle', () => {
    const params = makeParams();
    const round = createRound(params);
    if (round.questionType !== 'color' || !round.targetColor) return;

    const correctVehicle = round.options.find((v) => v.color === round.targetColor);
    if (!correctVehicle) return;

    // First pick
    const r1 = { ...round, selectedIds: [correctVehicle.id] };
    const result = evaluatePick({
      vehicle: correctVehicle,
      round: r1,
      colorForVehicle: (v) => v.color,
      categoryForVehicle: (v) => v.category,
    });
    expect(result.correct).toBe(false);
    expect(result.selectedIds).toEqual([correctVehicle.id]); // unchanged
  });
});

describe('formatRoundLabel', () => {
  const zhParams = makeParams({ language: 'zh' });
  const enParams = makeParams({ language: 'en' });

  it('formats color round label', () => {
    const round = createRound(zhParams);
    if (round.questionType !== 'color') return;
    const label = formatRoundLabel(round, 'zh', (c) => c);
    expect(label).toBeTruthy();
  });

  it('formats category round label', () => {
    // Force category round
    const params = makeParams();
    const catVehicles = VEHICLES.filter((v) => v.category === 'car' && v.color !== 'unknown');
    params.markedVehicles = catVehicles;
    params.colorCounts = new Map();
    catVehicles.forEach((v) => params.colorCounts.set(v.color, (params.colorCounts.get(v.color) || 0) + 1));

    const round = createRound(params);
    if (round.questionType !== 'category') return;
    const label = formatRoundLabel(round, 'zh', (c) => c);
    expect(label).toBeTruthy();
    expect(typeof label).toBe('string');
  });
});

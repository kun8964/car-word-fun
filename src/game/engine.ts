import { VEHICLES, Vehicle, VehicleColor, VehicleCategory } from '../vehicleData';
import {
  CATEGORY_OPTIONS, CATEGORY_LABELS, GAME_COLORS,
  Language, MixedTarget, Round,
} from '../constants';

// ── helpers ──────────────────────────────────────────────

export function sample<T>(items: T[], count: number) {
  const pool = [...items];
  const picked: T[] = [];
  while (pool.length && picked.length < count) {
    const index = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(index, 1)[0]);
  }
  return picked;
}

export function shuffle<T>(items: T[]) {
  return sample(items, items.length);
}

// ── round generator ──────────────────────────────────────

export interface RoundGenParams {
  colorCounts: Map<VehicleColor, number>;
  markedVehicles: Vehicle[];
  categoryForVehicle: (v: Vehicle) => VehicleCategory;
  colorForVehicle: (v: Vehicle) => VehicleColor;
  collectedCards: string[];
  language: Language;
  colorLabel: (c: VehicleColor) => string;
}

export function createRound(params: RoundGenParams): Round {
  const {
    colorCounts, markedVehicles, categoryForVehicle, colorForVehicle,
    collectedCards, language, colorLabel,
  } = params;

  const availableColors = GAME_COLORS.filter((c) => (colorCounts.get(c) || 0) > 0);
  const categoriesWithCounts = CATEGORY_OPTIONS.filter((cat) => {
    const count = markedVehicles.filter((v) => categoryForVehicle(v) === cat).length;
    return count > 0;
  });
  const canDoColor = availableColors.length > 0;
  const canDoCategory = categoriesWithCounts.length > 0;
  const canDoMixed = canDoColor && canDoCategory;
  const canDoMath = collectedCards.length >= 3;
  const roll = Math.random();
  const useMath = canDoMath && roll < 0.15;
  const useMixed = !useMath && canDoMixed && roll < 0.30;
  const useCategory = !useMath && !useMixed && canDoCategory && (!canDoColor || Math.random() < 0.4);

  if (useMath) return buildMathRound(colorForVehicle, language, colorLabel, collectedCards);
  if (useMixed) return buildMixedRound(colorForVehicle, categoryForVehicle, availableColors, markedVehicles);
  if (useCategory) return buildCategoryRound(categoryForVehicle, categoriesWithCounts, markedVehicles);
  return buildColorRound(colorForVehicle, availableColors, markedVehicles);
}

function buildColorRound(
  colorForVehicle: (v: Vehicle) => VehicleColor,
  availableColors: VehicleColor[],
  markedVehicles: Vehicle[],
): Round {
  const targetColor = availableColors[Math.floor(Math.random() * availableColors.length)] || 'red';
  const targetPool = markedVehicles.filter((v) => colorForVehicle(v) === targetColor);
  const distractorPool = markedVehicles.filter((v) => colorForVehicle(v) !== targetColor);
  const maxTargetCount = Math.min(targetPool.length, 5);
  const targetCount = Math.floor(Math.random() * maxTargetCount) + 1;
  const targetVehicles = sample(targetPool, targetCount);
  const distractors = sample(distractorPool, Math.max(0, 8 - targetVehicles.length));

  return {
    questionType: 'color', targetColor, targetCount: targetVehicles.length,
    options: shuffle([...targetVehicles, ...distractors]).slice(0, 8),
    selectedIds: [], matchedTargets: [], lastSelectedId: null, result: 'idle',
  };
}

function buildCategoryRound(
  categoryForVehicle: (v: Vehicle) => VehicleCategory,
  categoriesWithCounts: VehicleCategory[],
  markedVehicles: Vehicle[],
): Round {
  const targetCategory = categoriesWithCounts[Math.floor(Math.random() * categoriesWithCounts.length)];
  const targetPool = markedVehicles.filter((v) => categoryForVehicle(v) === targetCategory);
  const distractorPool = markedVehicles.filter((v) => categoryForVehicle(v) !== targetCategory);
  const maxTargetCount = Math.min(targetPool.length, 5);
  const targetCount = Math.floor(Math.random() * maxTargetCount) + 1;
  const targetVehicles = sample(targetPool, targetCount);
  const distractors = sample(distractorPool, Math.max(0, 8 - targetVehicles.length));

  return {
    questionType: 'category', targetCategory, targetCount: targetVehicles.length,
    options: shuffle([...targetVehicles, ...distractors]).slice(0, 8),
    selectedIds: [], matchedTargets: [], lastSelectedId: null, result: 'idle',
  };
}

function buildMixedRound(
  colorForVehicle: (v: Vehicle) => VehicleColor,
  categoryForVehicle: (v: Vehicle) => VehicleCategory,
  availableColors: VehicleColor[],
  markedVehicles: Vehicle[],
): Round {
  const isCrossType = Math.random() < 0.5;

  if (isCrossType) {
    const targetColor = availableColors[Math.floor(Math.random() * availableColors.length)];
    const crossPool = markedVehicles.filter((v) => colorForVehicle(v) === targetColor);
    const availableCatsForColor = CATEGORY_OPTIONS.filter((cat) =>
      crossPool.some((v) => categoryForVehicle(v) === cat),
    );
    if (availableCatsForColor.length === 0) {
      return buildColorRound(colorForVehicle, availableColors, markedVehicles);
    }
    const targetCategory = availableCatsForColor[Math.floor(Math.random() * availableCatsForColor.length)];
    const matchPool = crossPool.filter((v) => categoryForVehicle(v) === targetCategory);
    const maxCount = Math.min(matchPool.length, 3);
    const targetCount = Math.floor(Math.random() * maxCount) + 1;
    return buildMixedWithTargets(
      [{ color: targetColor, category: targetCategory, count: targetCount }],
      markedVehicles, colorForVehicle, categoryForVehicle,
    );
  }

  // Multi-color type
  const shuffled = shuffle([...availableColors]);
  const c1 = shuffled[0];
  const c2 = shuffled.length > 1 ? shuffled[1] : c1;
  const pool1 = markedVehicles.filter((v) => colorForVehicle(v) === c1);
  const pool2 = markedVehicles.filter((v) => colorForVehicle(v) === c2 && v.id !== pool1[0]?.id);
  const cnt1 = Math.min(pool1.length, 2);
  const cnt2 = Math.min(pool2.length, 2);
  const mixedTargets: MixedTarget[] = [
    { color: c1, count: Math.max(1, cnt1) },
    { color: c2, count: Math.max(1, cnt2) },
  ];
  return buildMixedWithTargets(mixedTargets, markedVehicles, colorForVehicle, categoryForVehicle);
}

function buildMixedWithTargets(
  targets: MixedTarget[],
  markedVehicles: Vehicle[],
  colorForVehicle: (v: Vehicle) => VehicleColor,
  categoryForVehicle: (v: Vehicle) => VehicleCategory,
): Round {
  const totalTargetCount = targets.reduce((sum, t) => sum + t.count, 0);
  const actualTargets: Vehicle[] = [];
  const usedIds = new Set<string>();
  targets.forEach((t) => {
    const matching = markedVehicles.filter((v) => {
      if (usedIds.has(v.id)) return false;
      if (t.color && t.category) return colorForVehicle(v) === t.color && categoryForVehicle(v) === t.category;
      if (t.color) return colorForVehicle(v) === t.color;
      return false;
    });
    const picked = sample(matching, t.count);
    picked.forEach((v) => usedIds.add(v.id));
    actualTargets.push(...picked);
  });
  const distractorPool = markedVehicles.filter((v) => !usedIds.has(v.id));
  const distractors = sample(distractorPool, Math.max(0, 8 - actualTargets.length));

  return {
    questionType: 'mixed', mixedTargets: targets, targetCount: totalTargetCount,
    options: shuffle([...actualTargets, ...distractors]).slice(0, 8),
    selectedIds: [], matchedTargets: [], lastSelectedId: null, result: 'idle',
  };
}

function buildMathRound(
  colorForVehicle: (v: Vehicle) => VehicleColor,
  language: Language,
  colorLabel: (c: VehicleColor) => string,
  collectedCards: string[],
): Round {
  const collectedVehicles = VEHICLES.filter((v) => collectedCards.includes(v.id));
  const collectedByColor = new Map<VehicleColor, Vehicle[]>();
  collectedVehicles.forEach((v) => {
    const c = colorForVehicle(v);
    if (!collectedByColor.has(c)) collectedByColor.set(c, []);
    collectedByColor.get(c)!.push(v);
  });
  const colorEntries = Array.from(collectedByColor.entries()).filter(([, vs]) => vs.length >= 1);

  let a: number, b: number, answer: number;
  let questionText: string;
  const isAddition = Math.random() < 0.6;

  if (isAddition && colorEntries.length >= 2) {
    const [c1, v1] = colorEntries[Math.floor(Math.random() * colorEntries.length)];
    const remaining = colorEntries.filter(([c]) => c !== c1);
    const [c2, v2] = remaining[Math.floor(Math.random() * remaining.length)];
    a = Math.min(v1.length, 5);
    b = Math.min(v2.length, 3);
    answer = a + b;
    questionText = language === 'zh'
      ? `${a}辆${colorLabel(c1)} + ${b}辆${colorLabel(c2)} = ?`
      : `${a} ${colorLabel(c1)} + ${b} ${colorLabel(c2)} = ?`;
  } else {
    const [c1, v1] = colorEntries[Math.floor(Math.random() * colorEntries.length)];
    a = Math.min(v1.length, 8);
    b = Math.floor(Math.random() * Math.min(a, 3)) + 1;
    answer = a - b;
    questionText = language === 'zh'
      ? `${a}辆${colorLabel(c1)}，开走${b}辆 = ?`
      : `${a} ${colorLabel(c1)}, ${b} leave = ?`;
  }

  const choices = new Set<number>([answer]);
  let attempts = 0;
  while (choices.size < 4 && attempts < 100) {
    const offset = Math.floor(Math.random() * 5) - 2;
    const c = answer + offset;
    if (c >= 0 && c <= 10) choices.add(c);
    attempts++;
  }
  // Fallback: fill with sequential numbers if random didn't produce enough
  for (let n = 0; n <= 10 && choices.size < 4; n++) {
    choices.add(n);
  }

  return {
    questionType: 'math', targetCount: answer,
    mathQuestion: questionText, mathChoices: shuffle(Array.from(choices)),
    options: [], selectedIds: [], matchedTargets: [], lastSelectedId: null, result: 'idle',
  };
}

// ── pick evaluator ───────────────────────────────────────

export interface PickEvalParams {
  vehicle: Vehicle;
  round: Round;
  colorForVehicle: (v: Vehicle) => VehicleColor;
  categoryForVehicle: (v: Vehicle) => VehicleCategory;
}

export interface PickResult {
  selectedIds: string[];
  matchedTargets: number[];
  lastSelectedId: string;
  result: 'progress' | 'correct' | 'wrong';
  correct: boolean;
}

export function evaluatePick(params: PickEvalParams): PickResult {
  const { vehicle, round, colorForVehicle, categoryForVehicle } = params;

  const isCorrect = round.questionType === 'mixed'
    ? (() => {
        if (!round.mixedTargets) return false;
        for (let i = 0; i < round.mixedTargets.length; i++) {
          const t = round.mixedTargets[i];
          const alreadyMatched = round.matchedTargets.filter((m) => m === i).length;
          if (alreadyMatched >= t.count) continue;
          if (t.color && t.category) {
            if (colorForVehicle(vehicle) === t.color && categoryForVehicle(vehicle) === t.category) return true;
          } else if (t.color) {
            if (colorForVehicle(vehicle) === t.color) return true;
          }
        }
        return false;
      })()
    : round.questionType === 'category'
      ? categoryForVehicle(vehicle) === round.targetCategory
      : colorForVehicle(vehicle) === round.targetColor;

  if (isCorrect && round.selectedIds.includes(vehicle.id)) {
    return {
      selectedIds: round.selectedIds,
      matchedTargets: round.matchedTargets,
      lastSelectedId: round.lastSelectedId ?? '',
      result: round.result !== 'correct' ? round.result as 'progress' | 'wrong' : 'correct',
      correct: false,
    };
  }

  const selectedIds = isCorrect ? [...round.selectedIds, vehicle.id] : round.selectedIds;
  let matchedTargetIndex = -1;
  if (isCorrect && round.questionType === 'mixed' && round.mixedTargets) {
    for (let i = 0; i < round.mixedTargets.length; i++) {
      const t = round.mixedTargets[i];
      const alreadyMatched = round.matchedTargets.filter((m) => m === i).length;
      if (alreadyMatched >= t.count) continue;
      if (t.color && t.category) {
        if (colorForVehicle(vehicle) === t.color && categoryForVehicle(vehicle) === t.category) { matchedTargetIndex = i; break; }
      } else if (t.color) {
        if (colorForVehicle(vehicle) === t.color) { matchedTargetIndex = i; break; }
      }
    }
  }
  const newMatchedTargets = matchedTargetIndex >= 0
    ? [...round.matchedTargets, matchedTargetIndex]
    : round.matchedTargets;

  const result = !isCorrect
    ? 'wrong'
    : selectedIds.length >= round.targetCount
      ? 'correct'
      : 'progress';

  return { selectedIds, matchedTargets: newMatchedTargets, lastSelectedId: vehicle.id, result, correct: isCorrect };
}

// ── prompt formatters ────────────────────────────────────

export function formatRoundLabel(
  roundData: Round,
  language: Language,
  colorLabel: (c: VehicleColor) => string,
): string {
  if (roundData.questionType === 'mixed' && roundData.mixedTargets) {
    const parts = roundData.mixedTargets.map((t) => {
      let label = '';
      if (t.color) label += colorLabel(t.color);
      if (t.category) label += (label ? ' ' : '') + CATEGORY_LABELS[language][t.category];
      return `${t.count} ${label}`;
    });
    return parts.join(' + ');
  }
  if (roundData.questionType === 'category' && roundData.targetCategory) {
    return CATEGORY_LABELS[language][roundData.targetCategory];
  }
  return roundData.targetColor ? colorLabel(roundData.targetColor) : '';
}

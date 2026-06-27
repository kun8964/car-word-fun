import { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { VEHICLES, VehicleColor, VehicleCategory } from '../vehicleData';
import { DEFAULT_V2, migrateV1toV2, readV2, writeV2, type StorageV2 } from '../storage';
import {
  View, Language, Round, COLOR_LABELS,
  CATEGORY_OPTIONS, COLOR_OPTIONS,
} from '../constants';
import { createRound, evaluatePick, type RoundGenParams } from '../game/engine';
import { logger } from '../logger';

interface GameContextValue {
  // navigation
  view: View;
  openView: (v: View) => void;
  language: Language;
  setLanguage: (l: Language) => void;

  // storage
  storage: StorageV2;
  setStorage: React.Dispatch<React.SetStateAction<StorageV2>>;
  colorForVehicle: (v: { id: string; color: VehicleColor }) => VehicleColor;
  categoryForVehicle: (v: { id: string; category: VehicleCategory }) => VehicleCategory;
  markedVehicles: typeof VEHICLES;
  colorCounts: Map<VehicleColor, number>;

  // game
  round: Round | null;
  setRound: React.Dispatch<React.SetStateAction<Round | null>>;
  score: number;

  // modals
  showReward: string | null;
  setShowReward: (v: string | null) => void;
  showAllCollected: boolean;
  setShowAllCollected: (v: boolean) => void;
  zoomedCard: string | null;
  setZoomedCard: (v: string | null) => void;
  zoomAnimating: boolean;
  setZoomAnimating: (v: boolean) => void;

  // parent filter
  parentFilter: 'all' | VehicleColor | VehicleCategory;
  setParentFilter: (v: 'all' | VehicleColor | VehicleCategory) => void;

  // helpers
  colorLabel: (c: VehicleColor) => string;

  // game actions
  generateRound: () => void;
  handlePick: (vehicle: { id: string; color: VehicleColor; category: VehicleCategory }) => void;
  handleMathPick: (n: number) => void;
  resetTags: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<View>('home');
  const [language, setLanguage] = useState<Language>('en');
  const [storage, setStorage] = useState<StorageV2>(() => {
    migrateV1toV2();
    const data = readV2();
    logger.info('storage', 'init', { streak: data.streak, collectedCards: data.collectedCards.length, overrides: Object.keys(data.colorOverrides).length });
    return data;
  });
  const [round, setRound] = useState<Round | null>(null);
  const [score, setScore] = useState(0);
  const [showReward, setShowReward] = useState<string | null>(null);
  const [showAllCollected, setShowAllCollected] = useState(false);
  const [zoomedCard, setZoomedCard] = useState<string | null>(null);
  const [zoomAnimating, setZoomAnimating] = useState(false);
  const [parentFilter, setParentFilter] = useState<'all' | VehicleColor | VehicleCategory>('all');

  const colorForVehicle = useCallback(
    (vehicle: { id: string; color: VehicleColor }) =>
      storage.colorOverrides[vehicle.id] || vehicle.color,
    [storage.colorOverrides],
  );

  const categoryForVehicle = useCallback(
    (vehicle: { id: string; category: VehicleCategory }) =>
      storage.categoryOverrides[vehicle.id] || vehicle.category,
    [storage.categoryOverrides],
  );

  const markedVehicles = useMemo(
    () => VEHICLES.filter((v) => colorForVehicle(v) !== 'unknown'),
    [colorForVehicle],
  );

  const colorCounts = useMemo(() => {
    const counts = new Map<VehicleColor, number>();
    markedVehicles.forEach((v) => {
      const c = colorForVehicle(v);
      counts.set(c, (counts.get(c) || 0) + 1);
    });
    return counts;
  }, [colorForVehicle, markedVehicles]);

  const colorLabel = useCallback(
    (color: VehicleColor) => COLOR_LABELS[language][color],
    [language],
  );

  // persist storage
  useEffect(() => {
    writeV2(storage);
  }, [storage]);

  const generateRound = useCallback(() => {
    logger.debug('game', 'generateRound', { collectedCards: storage.collectedCards.length, markedVehicles: markedVehicles.length });
    const params: RoundGenParams = {
      colorCounts,
      markedVehicles,
      categoryForVehicle,
      colorForVehicle,
      collectedCards: storage.collectedCards,
      language,
      colorLabel,
    };
    const newRound = createRound(params);
    logger.info('game', `round:${newRound.questionType}`, {
      target: newRound.questionType === 'math' ? newRound.mathQuestion : newRound.questionType === 'color' ? newRound.targetColor : newRound.questionType === 'category' ? newRound.targetCategory : 'mixed',
      count: newRound.targetCount, options: newRound.options.length,
    });
    setRound(newRound);
  }, [colorCounts, markedVehicles, categoryForVehicle, colorForVehicle, storage.collectedCards, language, colorLabel]);

  const handlePick = useCallback(
    (vehicle: { id: string; color: VehicleColor; category: VehicleCategory }) => {
      if (!round || round.result === 'correct') return;

      const result = evaluatePick({
        vehicle: { id: vehicle.id, name: '', image: '', color: vehicle.color, category: vehicle.category },
        round,
        colorForVehicle,
        categoryForVehicle,
      });

      if (!result.correct && result.result === 'wrong') {
        logger.debug('game', 'pick:wrong', { picked: vehicle.id, color: vehicle.color });
        setRound({ ...round, ...result, result: 'wrong' });
        setStorage((prev) => ({ ...prev, streak: 0 }));
        return;
      }

      if (result.correct && !round.selectedIds.includes(vehicle.id)) {
        setRound({ ...round, ...result });
      }

      if (result.result === 'correct') {
        setScore((v) => v + 1);
        const newStreak = storage.streak + 1;
        setStorage((prev) => ({ ...prev, streak: newStreak }));
        if (newStreak % 5 === 0) {
          const uncollected = markedVehicles
            .filter((v) => !storage.collectedCards.includes(v.id))
            .map((v) => v.id);
          if (uncollected.length > 0) {
            const rewardId = uncollected[Math.floor(Math.random() * uncollected.length)];
            logger.info('game', 'reward:card', { rewardId, streak: newStreak, totalCollected: storage.collectedCards.length + 1 });
            setShowReward(rewardId);
            setStorage((prev) => ({ ...prev, collectedCards: [...prev.collectedCards, rewardId] }));
          } else {
            setShowAllCollected(true);
          }
        }
      }
    },
    [round, colorForVehicle, categoryForVehicle, storage, markedVehicles],
  );

  const handleMathPick = useCallback((n: number) => {
    if (!round || round.result === 'correct') return;
    const correct = n === round.targetCount;
    setRound({ ...round, lastSelectedId: String(n), result: correct ? 'correct' : 'wrong' });
    if (correct) {
      setScore((v) => v + 1);
      const newStreak = storage.streak + 1;
      setStorage((prev) => ({ ...prev, streak: newStreak }));
      if (newStreak % 5 === 0) {
        const collectedIds = new Set(storage.collectedCards);
        const uncollected = markedVehicles.filter((v) => !collectedIds.has(v.id)).map((v) => v.id);
        if (uncollected.length > 0) {
          const rewardId = uncollected[Math.floor(Math.random() * uncollected.length)];
          setShowReward(rewardId);
          setStorage((prev) => ({ ...prev, collectedCards: [...prev.collectedCards, rewardId] }));
        } else {
          setShowAllCollected(true);
        }
      }
    } else {
      setStorage((prev) => ({ ...prev, streak: 0 }));
    }
  }, [round, storage, markedVehicles]);

  const openView = useCallback(
    (nextView: View) => {
      logger.info('nav', `view:${nextView}`);
      setView(nextView);
      if (nextView === 'play') {
        generateRound();
      }
    },
    [generateRound],
  );

  const resetTags = useCallback(() => {
    setStorage({ ...DEFAULT_V2 });
  }, []);

  const value: GameContextValue = {
    view, openView, language, setLanguage,
    storage, setStorage, colorForVehicle, categoryForVehicle, markedVehicles, colorCounts,
    round, setRound, score,
    showReward, setShowReward, showAllCollected, setShowAllCollected,
    zoomedCard, setZoomedCard, zoomAnimating, setZoomAnimating,
    parentFilter, setParentFilter,
    colorLabel,
    generateRound, handlePick, handleMathPick, resetTags,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

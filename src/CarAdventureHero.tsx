import {
  ArrowLeft,
  ArrowRight,
  Check,
  Menu,
  RotateCcw,
  Settings2,
  X,
} from 'lucide-react';
import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { VEHICLES, Vehicle, VehicleColor } from './vehicleData';

type View = 'home' | 'play' | 'garage' | 'parents';
type Direction = 'next' | 'prev';
type CardRole = 'center' | 'left' | 'right' | 'back' | 'hidden';
type Language = 'en' | 'zh';
type NavLabel = 'Start' | 'Games' | 'Garage' | 'Colors' | 'Parents';

type HeroSlide = {
  vehicleId: string;
  title: string;
  label: string;
  ghostText: string;
  description: string;
  cta: string;
};

type Round = {
  targetColor: VehicleColor;
  targetCount: number;
  options: Vehicle[];
  selectedIds: string[];
  lastSelectedId: string | null;
  result: 'idle' | 'progress' | 'correct' | 'wrong';
};

const COLOR_LABELS: Record<Language, Record<VehicleColor, string>> = {
  en: {
    red: 'Red',
    blue: 'Blue',
    yellow: 'Yellow',
    green: 'Green',
    white: 'White',
    black: 'Black',
    silver: 'Silver',
    orange: 'Orange',
    gray: 'Gray',
    brown: 'Brown',
    unknown: 'Unmarked',
  },
  zh: {
    red: '红色',
    blue: '蓝色',
    yellow: '黄色',
    green: '绿色',
    white: '白色',
    black: '黑色',
    silver: '银色',
    orange: '橙色',
    gray: '灰色',
    brown: '棕色',
    unknown: '未标记',
  },
};

const UI_TEXT = {
  en: {
    languageToggle: '中文',
    nav: {
      Start: 'Start',
      Games: 'Games',
      Garage: 'Garage',
      Colors: 'Colors',
      Parents: 'Parents',
    },
    heroSlides: [
      {
        title: 'Color Hunt',
        label: 'FIND RED CARS',
        description: 'Start a gentle color game with real toy vehicle pictures.',
        cta: 'START GAME',
      },
      {
        title: 'City Colors',
        label: 'SPOT THE CITY CAR',
        description: 'Look at each vehicle, name its color, and tap carefully.',
        cta: 'START GAME',
      },
      {
        title: 'Find the Bus',
        label: 'TAP THE BUS',
        description: 'Buses, cars, race cars, diggers, and planes can all appear.',
        cta: 'START GAME',
      },
      {
        title: 'Garage Star',
        label: 'COLLECT VEHICLES',
        description: 'Every marked vehicle can become part of the learning set.',
        cta: 'MY GARAGE',
      },
    ],
    play: {
      kicker: 'Color game',
      find: 'Find',
      fallbackColor: 'a color',
      instruction: 'Look at the vehicles below. Tap every vehicle that matches the target color, then count them.',
      score: 'Score',
      newRound: 'New round',
      idlePrefix: 'Tap a',
      idleSuffix: 'vehicle.',
      progressPrefix: 'Found',
      progressMiddle: 'of',
      progressSuffix: 'Keep looking.',
      correctPrefix: 'Correct. There are',
      correctSuffix: 'matching vehicles here.',
      wrong: 'Try again. Look for another vehicle with the target color.',
    },
    garage: {
      kicker: 'Collection garage',
      markedVehicles: 'marked vehicles',
      editColors: 'Edit colors',
    },
    parents: {
      kicker: 'Parent controls',
      title: 'Mark vehicle colors',
      description:
        'This is the lightweight data layer: color tags are saved in this browser with localStorage. No account, no server, easy to revise.',
      reset: 'Reset tags',
      all: 'All',
      mainColor: 'Main color',
    },
    aria: {
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      previous: 'Previous game mode',
      next: 'Next game mode',
      switchLanguage: 'Switch language',
    },
  },
  zh: {
    languageToggle: 'EN',
    nav: {
      Start: '开始',
      Games: '游戏',
      Garage: '车库',
      Colors: '颜色',
      Parents: '家长',
    },
    heroSlides: [
      {
        title: '颜色找找看',
        label: '找到红色车',
        description: '用真实玩具车图片开始一局温和的颜色小游戏。',
        cta: '开始游戏',
      },
      {
        title: '城市颜色',
        label: '找到城市小车',
        description: '观察每一辆车，说出颜色，再轻轻点选。',
        cta: '开始游戏',
      },
      {
        title: '找到巴士',
        label: '点击巴士',
        description: '巴士、小汽车、赛车、工程车和飞机都可能出现。',
        cta: '开始游戏',
      },
      {
        title: '收藏车库',
        label: '收集车辆',
        description: '每辆已标记颜色的车，都可以进入孩子的学习素材库。',
        cta: '我的车库',
      },
    ],
    play: {
      kicker: '颜色游戏',
      find: '找到',
      fallbackColor: '一种颜色',
      instruction: '看看下面的车辆，把所有符合目标颜色的车都点出来，然后数一数一共有几辆。',
      score: '得分',
      newRound: '换一题',
      idlePrefix: '请点击一辆',
      idleSuffix: '的车。',
      progressPrefix: '已经找到',
      progressMiddle: '辆，共',
      progressSuffix: '辆，继续找。',
      correctPrefix: '答对啦！这里有',
      correctSuffix: '辆这种颜色的车。',
      wrong: '再试一次，找找另一辆目标颜色的车。',
    },
    garage: {
      kicker: '收藏车库',
      markedVehicles: '辆已标记车辆',
      editColors: '编辑颜色',
    },
    parents: {
      kicker: '家长控制',
      title: '标记车辆颜色',
      description:
        '这是轻量数据层：颜色标签保存在当前浏览器的 localStorage 中。无需账号、无需服务器，随时可以修改。',
      reset: '重置标签',
      all: '全部',
      mainColor: '主颜色',
    },
    aria: {
      openMenu: '打开菜单',
      closeMenu: '关闭菜单',
      previous: '上一个游戏模式',
      next: '下一个游戏模式',
      switchLanguage: '切换语言',
    },
  },
} satisfies Record<Language, {
  languageToggle: string;
  nav: Record<NavLabel, string>;
  heroSlides: Array<{ title: string; label: string; description: string; cta: string }>;
  play: Record<string, string>;
  garage: Record<string, string>;
  parents: Record<string, string>;
  aria: Record<string, string>;
}>;

const HERO_SLIDES: HeroSlide[] = [
  {
    vehicleId: '458',
    title: 'Color Hunt',
    label: 'FIND RED CARS',
    ghostText: 'COLOR HUNT',
    description: 'Start a gentle color game with real toy vehicle pictures.',
    cta: 'START GAME',
  },
  {
    vehicleId: 'a4',
    title: 'City Colors',
    label: 'SPOT THE CITY CAR',
    ghostText: 'CITY CAR',
    description: 'Look at each vehicle, name its color, and tap carefully.',
    cta: 'START GAME',
  },
  {
    vehicleId: 'vehicle-34',
    title: 'Find the Bus',
    label: 'TAP THE BUS',
    ghostText: 'BIG BUS',
    description: 'Buses, cars, race cars, diggers, and planes can all appear.',
    cta: 'START GAME',
  },
  {
    vehicleId: 'rb7',
    title: 'Garage Star',
    label: 'COLLECT VEHICLES',
    ghostText: 'GARAGE',
    description: 'Every marked vehicle can become part of the learning set.',
    cta: 'MY GARAGE',
  },
];

const HERO_VEHICLE_IDS = [
  '458',
  'a4',
  'vehicle-34',
  'rb7',
  'countach',
  '777',
  'd11',
  'g63',
  'ae86',
  'v4',
  'cat-797',
  'f40',
];

const NAV_ITEMS: Array<{ label: NavLabel; view: View }> = [
  { label: 'Start', view: 'play' },
  { label: 'Games', view: 'play' },
  { label: 'Garage', view: 'garage' },
  { label: 'Colors', view: 'play' },
  { label: 'Parents', view: 'parents' },
];

const COLOR_OPTIONS: VehicleColor[] = [
  'red',
  'blue',
  'yellow',
  'green',
  'white',
  'black',
  'silver',
  'orange',
  'gray',
  'brown',
];
const GAME_COLORS: VehicleColor[] = ['red', 'blue', 'yellow', 'green', 'white', 'black'];
const TARGET_MATCH_COUNT = 3;

const STORAGE_KEY = 'car-car-adventure-color-tags-v1';

const CARD_TRANSITION =
  'transform 650ms cubic-bezier(0.4,0,0.2,1), filter 650ms cubic-bezier(0.4,0,0.2,1), opacity 650ms cubic-bezier(0.4,0,0.2,1), left 650ms cubic-bezier(0.4,0,0.2,1), bottom 650ms cubic-bezier(0.4,0,0.2,1), width 650ms cubic-bezier(0.4,0,0.2,1)';

const NOISE_BACKGROUND =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.16'/%3E%3C/svg%3E\")";

function getVehicleByHint(hint: string) {
  const normalizedHint = hint.toLowerCase();
  return VEHICLES.find((vehicle) => vehicle.id.toLowerCase() === normalizedHint) || VEHICLES.find(
    (vehicle) =>
      vehicle.id.toLowerCase().includes(normalizedHint) ||
      vehicle.name.toLowerCase().includes(normalizedHint),
  );
}

function assetUrl(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
}

const HERO_VEHICLES = HERO_VEHICLE_IDS.map((vehicleId) => getVehicleByHint(vehicleId)).filter(
  Boolean,
) as Vehicle[];

function getVehicleImageStyle(role: CardRole): CSSProperties {
  const transform =
    role === 'center'
      ? 'scale(0.92)'
      : role === 'left' || role === 'right'
        ? 'translateY(-30%) scale(0.86)'
        : 'scale(0.86)';

  return {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    userSelect: 'none',
    transform,
    transformOrigin: 'center center',
  };
}

function getCardStyle(role: CardRole, isMobile: boolean): CSSProperties {
  const base: CSSProperties = {
    position: 'absolute',
    aspectRatio: '16 / 10',
    overflow: 'visible',
    transition: CARD_TRANSITION,
    willChange: 'transform, filter, opacity, left, bottom, width',
  };

  if (role === 'center') {
    return {
      ...base,
      left: '50%',
      bottom: isMobile ? '27%' : 'max(11%, 126px)',
      width: isMobile ? '81%' : 'min(60.72%, calc((100vh - 190px) * 1.75))',
      transform: 'translateX(-50%) scale(1)',
      filter: 'none',
      opacity: 1,
      zIndex: 20,
    };
  }

  if (role === 'left') {
    return {
      ...base,
      left: isMobile ? '18%' : '13.5%',
      bottom: isMobile ? '20%' : '16%',
      width: isMobile ? '22%' : '18.5%',
      transform: 'translateX(-50%) scale(1)',
      filter: 'blur(0.4px)',
      opacity: 0.52,
      zIndex: 6,
    };
  }

  if (role === 'right') {
    return {
      ...base,
      left: isMobile ? '82%' : '86.5%',
      bottom: isMobile ? '20%' : '16%',
      width: isMobile ? '22%' : '18.5%',
      transform: 'translateX(-50%) scale(1)',
      filter: 'blur(0.4px)',
      opacity: 0.52,
      zIndex: 6,
    };
  }

  if (role === 'back') {
    return {
      ...base,
      left: '50%',
      bottom: isMobile ? '25%' : '17%',
      width: isMobile ? '18%' : '14%',
      transform: 'translate(-50%, 18%) scale(0.7)',
      filter: 'blur(2px)',
      opacity: 0,
      zIndex: 1,
    };
  }

  return {
    ...base,
    left: '50%',
    bottom: isMobile ? '27%' : '21%',
    width: isMobile ? '32%' : '20%',
    transform: 'translateX(-50%) scale(0.58)',
    filter: 'blur(5px)',
    opacity: 0,
    zIndex: 1,
  };
}

function readStoredColorTags(): Record<string, VehicleColor> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, VehicleColor>;
  } catch {
    return {};
  }
}

function sample<T>(items: T[], count: number) {
  const pool = [...items];
  const picked: T[] = [];
  while (pool.length && picked.length < count) {
    const index = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(index, 1)[0]);
  }
  return picked;
}

function shuffle<T>(items: T[]) {
  return sample(items, items.length);
}

export function CarAdventureHero() {
  const [view, setView] = useState<View>('home');
  const [language, setLanguage] = useState<Language>('en');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [colorOverrides, setColorOverrides] = useState<Record<string, VehicleColor>>(() =>
    readStoredColorTags(),
  );
  const [round, setRound] = useState<Round | null>(null);
  const [score, setScore] = useState(0);
  const [parentFilter, setParentFilter] = useState<VehicleColor | 'all'>('all');
  const animationTimer = useRef<number | null>(null);
  const autoPausedUntil = useRef(0);
  const isAnimatingRef = useRef(false);

  const activeSlide = HERO_SLIDES[activeIndex % HERO_SLIDES.length] || HERO_SLIDES[0];
  const t = UI_TEXT[language];
  const activeSlideText =
    t.heroSlides[activeIndex % t.heroSlides.length] || t.heroSlides[0];
  const activeHeroVehicle = HERO_VEHICLES[activeIndex] || VEHICLES[0];
  const totalHeroItems = HERO_VEHICLES.length;
  const colorLabel = useCallback(
    (color: VehicleColor) => COLOR_LABELS[language][color],
    [language],
  );

  const colorForVehicle = useCallback(
    (vehicle: Vehicle): VehicleColor => colorOverrides[vehicle.id] || vehicle.color,
    [colorOverrides],
  );

  const markedVehicles = useMemo(
    () => VEHICLES.filter((vehicle) => colorForVehicle(vehicle) !== 'unknown'),
    [colorForVehicle],
  );

  const colorCounts = useMemo(() => {
    const counts = new Map<VehicleColor, number>();
    markedVehicles.forEach((vehicle) => {
      const color = colorForVehicle(vehicle);
      counts.set(color, (counts.get(color) || 0) + 1);
    });
    return counts;
  }, [colorForVehicle, markedVehicles]);

  const positions = useMemo(
    () => ({
      center: activeIndex,
      left: (activeIndex + totalHeroItems - 1) % totalHeroItems,
      right: (activeIndex + 1) % totalHeroItems,
      back: (activeIndex + 2) % totalHeroItems,
    }),
    [activeIndex, totalHeroItems],
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const preloadedImages = VEHICLES.map((vehicle) => {
      const image = new Image();
      image.src = assetUrl(vehicle.image);
      return image;
    });

    return () => {
      preloadedImages.forEach((image) => {
        image.src = '';
      });
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(colorOverrides));
  }, [colorOverrides]);

  useEffect(() => {
    return () => {
      if (animationTimer.current) {
        window.clearTimeout(animationTimer.current);
      }
      isAnimatingRef.current = false;
    };
  }, []);

  const releaseAnimationLock = useCallback(() => {
    if (animationTimer.current) {
      window.clearTimeout(animationTimer.current);
    }

    animationTimer.current = window.setTimeout(() => {
      isAnimatingRef.current = false;
      setIsAnimating(false);
    }, 650);
  }, []);

  const pauseAutoRotation = useCallback(() => {
    autoPausedUntil.current = Date.now() + 6000;
  }, []);

  const navigateHero = useCallback(
    (direction: Direction, userInitiated = true) => {
      if (isAnimatingRef.current) return;
      if (userInitiated) pauseAutoRotation();

      isAnimatingRef.current = true;
      setIsAnimating(true);
      setActiveIndex((previous) =>
        direction === 'next'
          ? (previous + 1) % totalHeroItems
          : (previous + totalHeroItems - 1) % totalHeroItems,
      );
      releaseAnimationLock();
    },
    [pauseAutoRotation, releaseAnimationLock, totalHeroItems],
  );

  useEffect(() => {
    if (view !== 'home') return undefined;

    const autoTimer = window.setInterval(() => {
      if (Date.now() < autoPausedUntil.current) return;
      navigateHero('next', false);
    }, 2000);

    return () => window.clearInterval(autoTimer);
  }, [navigateHero, view]);

  const createRound = useCallback(
    (preferredColor?: VehicleColor) => {
      const availableColors = GAME_COLORS.filter((color) => (colorCounts.get(color) || 0) > 0);
      const targetColor =
        preferredColor && availableColors.includes(preferredColor)
          ? preferredColor
          : availableColors[Math.floor(Math.random() * availableColors.length)] || 'red';
      const targetPool = markedVehicles.filter((vehicle) => colorForVehicle(vehicle) === targetColor);
      const distractorPool = markedVehicles.filter(
        (vehicle) => colorForVehicle(vehicle) !== targetColor,
      );
      const targetVehicles = sample(targetPool, Math.min(targetPool.length, TARGET_MATCH_COUNT));
      const distractors = sample(distractorPool, Math.max(0, 8 - targetVehicles.length));
      const options = shuffle([...targetVehicles, ...distractors]).slice(0, 8);

      setRound({
        targetColor,
        targetCount: targetVehicles.length,
        options,
        selectedIds: [],
        lastSelectedId: null,
        result: 'idle',
      });
    },
    [colorCounts, colorForVehicle, markedVehicles],
  );

  const openView = useCallback(
    (nextView: View) => {
      pauseAutoRotation();
      setIsMenuOpen(false);
      setView(nextView);
      if (nextView === 'play') {
        createRound(nextView === 'play' ? undefined : 'red');
      }
    },
    [createRound, pauseAutoRotation],
  );

  const handleVehiclePick = useCallback(
    (vehicle: Vehicle) => {
      if (!round || round.result === 'correct') return;

      const isCorrect = colorForVehicle(vehicle) === round.targetColor;
      if (isCorrect && round.selectedIds.includes(vehicle.id)) {
        return;
      }

      const selectedIds = isCorrect ? [...round.selectedIds, vehicle.id] : round.selectedIds;
      const result = !isCorrect
        ? 'wrong'
        : selectedIds.length >= round.targetCount
          ? 'correct'
          : 'progress';

      setRound({
        ...round,
        selectedIds,
        lastSelectedId: vehicle.id,
        result,
      });

      if (result === 'correct') {
        setScore((value) => value + 1);
      }
    },
    [colorForVehicle, round],
  );

  const updateVehicleColor = useCallback((vehicleId: string, color: VehicleColor) => {
    setColorOverrides((previous) => ({
      ...previous,
      [vehicleId]: color,
    }));
  }, []);

  const roleForIndex = (index: number): CardRole => {
    if (index === positions.center) return 'center';
    if (index === positions.left) return 'left';
    if (index === positions.right) return 'right';
    if (index === positions.back) return 'back';
    return 'hidden';
  };

  const parentVehicles = useMemo(() => {
    if (parentFilter === 'all') return VEHICLES;
    return VEHICLES.filter((vehicle) => colorForVehicle(vehicle) === parentFilter);
  }, [colorForVehicle, parentFilter]);

  const formatFindPrompt = (color?: VehicleColor) => {
    if (!color) return `${t.play.find} ${t.play.fallbackColor}`;
    return language === 'zh'
      ? `${t.play.find}${colorLabel(color)}`
      : `${t.play.find} ${colorLabel(color)}`;
  };

  const formatIdlePrompt = (color: VehicleColor) =>
    language === 'zh'
      ? `${t.play.idlePrefix}${colorLabel(color)}${t.play.idleSuffix}`
      : `${t.play.idlePrefix} ${colorLabel(color)} ${t.play.idleSuffix}`;

  const formatCorrectPrompt = (roundData: Round) =>
    language === 'zh'
      ? `${t.play.correctPrefix}${roundData.targetCount}辆${colorLabel(roundData.targetColor)}车。`
      : `${t.play.correctPrefix} ${roundData.targetCount} ${colorLabel(
          roundData.targetColor,
        ).toLowerCase()} ${t.play.correctSuffix}`;

  const formatProgressPrompt = (roundData: Round) =>
    language === 'zh'
      ? `${t.play.progressPrefix}${roundData.selectedIds.length}${t.play.progressMiddle}${roundData.targetCount}${t.play.progressSuffix}`
      : `${t.play.progressPrefix} ${roundData.selectedIds.length} ${t.play.progressMiddle} ${roundData.targetCount}. ${t.play.progressSuffix}`;

  return (
    <div className="min-h-[100dvh] bg-[#F8F4F4] font-sans text-[#202A36]">
      <div className="pointer-events-none fixed inset-0 z-[1] opacity-20 mix-blend-soft-light">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: NOISE_BACKGROUND,
            backgroundSize: '200px 200px',
            backgroundRepeat: 'repeat',
          }}
        />
      </div>

      <header className="fixed left-0 right-0 top-0 z-[90] px-4 py-5 sm:px-8">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6">
          <button
            className="text-left text-xs font-extrabold uppercase tracking-[0.16em] opacity-90 outline-none transition-opacity focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[#202A36]/30 sm:text-sm"
            type="button"
            onClick={() => openView('home')}
          >
            CAR CAR ADVENTURE
          </button>

          <div className="flex items-center gap-3 md:gap-8">
            <nav className="hidden gap-8 md:flex" aria-label="Desktop menu">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className={`text-sm font-bold uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#202A36]/30 ${
                    view === item.view ? 'text-[#202A36]' : 'text-[#202A36]/62 hover:text-[#202A36]'
                  }`}
                  onClick={() => openView(item.view)}
                >
                  {t.nav[item.label]}
                </button>
              ))}
            </nav>

            <button
              className="rounded-full border border-[#202A36]/15 bg-white/55 px-3 py-2 text-xs font-extrabold uppercase tracking-[0.14em] backdrop-blur transition-transform active:scale-95"
              type="button"
              aria-label={t.aria.switchLanguage}
              onClick={() => setLanguage((current) => (current === 'en' ? 'zh' : 'en'))}
            >
              {t.languageToggle}
            </button>

            <button
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#202A36]/15 bg-white/60 backdrop-blur transition-transform active:scale-95 md:hidden"
              type="button"
              aria-label={isMenuOpen ? t.aria.closeMenu : t.aria.openMenu}
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              {isMenuOpen ? <X size={24} strokeWidth={2.25} /> : <Menu size={24} strokeWidth={2.25} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <nav
            className="mx-auto mt-4 flex max-w-[1440px] flex-col gap-3 rounded-3xl border border-[#202A36]/10 bg-[#F8F4F4]/95 p-5 backdrop-blur-md md:hidden"
            aria-label="Mobile menu"
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                type="button"
                className="rounded-2xl px-4 py-3 text-left text-base font-extrabold uppercase tracking-[0.14em] transition-colors hover:bg-white/60"
                onClick={() => openView(item.view)}
              >
                {t.nav[item.label]}
              </button>
            ))}
            <button
              type="button"
              className="rounded-2xl border border-[#202A36]/15 bg-white/45 px-4 py-3 text-left text-base font-extrabold uppercase tracking-[0.14em]"
              onClick={() => setLanguage((current) => (current === 'en' ? 'zh' : 'en'))}
            >
              {t.aria.switchLanguage}: {t.languageToggle}
            </button>
          </nav>
        )}
      </header>

      {view === 'home' && (
        <main className="relative min-h-[100dvh] overflow-hidden">
          <div
            className="pointer-events-none absolute inset-x-0 flex select-none items-center justify-center"
            data-hero-ghost
            style={{
              zIndex: 2,
              top: isMobile ? '8%' : '5%',
              fontFamily: "'Anton', sans-serif",
              fontSize: 'clamp(42px, 10.8vw, 168px)',
              fontWeight: 400,
              lineHeight: 1,
              textTransform: 'uppercase',
              letterSpacing: 0,
              whiteSpace: 'nowrap',
            }}
          >
            <span
              style={{
                color: '#202A36',
                opacity: 0.12,
                textShadow: '0 14px 34px rgba(32,42,54,0.14)',
              }}
            >
              HELLO! MY BABY
            </span>
            <span
              className="ml-[0.08em] -rotate-3"
              style={{
                color: '#54E84D',
                fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                fontSize: '1.04em',
                fontWeight: 900,
                opacity: 0.28,
                textShadow: '0 10px 28px rgba(84,232,77,0.22)',
                textTransform: 'none',
              }}
            >
              Anpu
            </span>
          </div>

          <div className="absolute inset-0 z-[3]" aria-label="Vehicle cutout carousel">
            {HERO_VEHICLES.map((vehicle, index) => {
              const role = roleForIndex(index);

              return (
                <article
                  key={vehicle.id}
                  data-hero-role={role}
                  data-vehicle-id={vehicle.id}
                  aria-hidden={role !== 'center'}
                  className="flex items-center justify-center"
                  style={getCardStyle(role, isMobile)}
                >
                  <img
                    alt={vehicle.name}
                    draggable={false}
                    loading={index < 4 ? 'eager' : 'lazy'}
                    style={getVehicleImageStyle(role)}
                    src={assetUrl(vehicle.image)}
                  />
                </article>
              );
            })}
          </div>

          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-[30] w-[12vw]"
            style={{
              background: 'linear-gradient(to right, rgba(248,244,244,0.98), rgba(248,244,244,0))',
            }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-[30] w-[12vw]"
            style={{
              background: 'linear-gradient(to left, rgba(248,244,244,0.98), rgba(248,244,244,0))',
            }}
          />

          <section className="absolute bottom-4 left-4 z-[60] max-w-[360px] sm:bottom-10 sm:left-24">
            <h1 className="mb-2 text-base font-extrabold uppercase tracking-widest opacity-95 sm:text-[24px]">
              {activeSlideText.title}
            </h1>
            <p className="mb-5 hidden text-xs leading-[1.65] opacity-70 sm:block sm:text-sm">
              {activeSlideText.description}
            </p>

            <div className="mb-4 flex items-center gap-2">
              {HERO_SLIDES.map((slide, index) => (
                <span
                  key={slide.title}
                  className="h-2 rounded-full transition-all duration-[650ms]"
                  style={{
                    width: index === activeIndex % HERO_SLIDES.length ? '32px' : '8px',
                    backgroundColor: '#202A36',
                    opacity: index === activeIndex % HERO_SLIDES.length ? 0.9 : 0.24,
                  }}
                />
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#202A36]/75 bg-white/45 backdrop-blur transition-[transform,background-color] duration-150 hover:scale-[1.08] hover:bg-white/80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#202A36]/30 sm:h-16 sm:w-16"
                type="button"
                aria-label={t.aria.previous}
                onClick={() => navigateHero('prev')}
              >
                <ArrowLeft size={26} strokeWidth={2.25} />
              </button>
              <button
                className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#202A36]/75 bg-white/45 backdrop-blur transition-[transform,background-color] duration-150 hover:scale-[1.08] hover:bg-white/80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#202A36]/30 sm:h-16 sm:w-16"
                type="button"
                aria-label={t.aria.next}
                onClick={() => navigateHero('next')}
              >
                <ArrowRight size={26} strokeWidth={2.25} />
              </button>
            </div>
          </section>

          <button
            className="absolute bottom-4 right-4 z-[60] flex items-center gap-2 font-display uppercase leading-none opacity-95 transition-opacity duration-200 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#202A36]/30 sm:bottom-10 sm:right-10 sm:gap-3"
            type="button"
            onClick={() => openView(activeSlide.cta === 'MY GARAGE' ? 'garage' : 'play')}
            style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: 'clamp(22px, 4vw, 58px)',
              fontWeight: 400,
              letterSpacing: 0,
            }}
          >
            <span>{activeSlideText.cta}</span>
            <ArrowRight className="h-5 w-5 sm:h-8 sm:w-8" strokeWidth={2.25} />
          </button>

          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 z-[40] h-36"
            style={{
              background: 'linear-gradient(to top, rgba(248,244,244,0.96), rgba(248,244,244,0))',
            }}
          />
        </main>
      )}

      {view === 'play' && (
        <main className="relative z-[5] mx-auto min-h-[100dvh] max-w-[1440px] px-4 pb-10 pt-28 sm:px-8">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] opacity-55">
                {t.play.kicker}
              </p>
              <h1 className="text-4xl font-extrabold uppercase tracking-[0.08em] sm:text-6xl">
                {formatFindPrompt(round?.targetColor)}
              </h1>
              <p className="mt-3 max-w-[580px] text-sm leading-6 opacity-70">
                {t.play.instruction}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-full border border-[#202A36]/15 bg-white/45 px-4 py-2 text-sm font-extrabold uppercase tracking-[0.12em]">
                {t.play.score} {score}
              </span>
              <button
                className="inline-flex items-center gap-2 rounded-full border border-[#202A36]/20 bg-white/55 px-4 py-2 text-sm font-extrabold uppercase tracking-[0.12em] transition-transform active:scale-95"
                type="button"
                onClick={() => createRound()}
              >
                <RotateCcw size={16} strokeWidth={2.25} />
                {t.play.newRound}
              </button>
            </div>
          </div>

          {round && (
            <>
              <div
	                className={`mb-5 rounded-[28px] border px-5 py-4 text-sm font-bold ${
	                  round.result === 'correct'
	                    ? 'border-green-700/20 bg-green-100/55 text-green-900'
	                    : round.result === 'progress'
	                      ? 'border-green-700/15 bg-green-50/55 text-green-900'
	                    : round.result === 'wrong'
	                      ? 'border-red-700/20 bg-red-100/55 text-red-900'
                      : 'border-[#202A36]/10 bg-white/35'
                }`}
                aria-live="polite"
              >
                {round.result === 'correct' ? (
                  <div className="flex items-center gap-4">
                    <span
                      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-green-700 text-[42px] leading-none text-white"
                      style={{ fontFamily: "'Anton', sans-serif" }}
                    >
                      {round.targetCount}
                    </span>
                    <div>
                      <strong className="block text-base">{formatCorrectPrompt(round)}</strong>
                      <span className="mt-1 block text-xs uppercase tracking-[0.14em] opacity-65">
                        {language === 'zh' ? `数字 ${round.targetCount}` : `Number ${round.targetCount}`}
                      </span>
                    </div>
                  </div>
	                ) : round.result === 'progress' ? (
	                  <div className="flex items-center gap-4">
	                    <span
	                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-green-700 text-[36px] leading-none text-white"
	                      style={{ fontFamily: "'Anton', sans-serif" }}
	                    >
	                      {round.selectedIds.length}
	                    </span>
	                    <div>
	                      <strong className="block text-base">{formatProgressPrompt(round)}</strong>
	                      <span className="mt-1 block text-xs uppercase tracking-[0.14em] opacity-65">
	                        {language === 'zh'
	                          ? `目标 ${round.targetCount} 辆`
	                          : `Target ${round.targetCount} vehicles`}
	                      </span>
	                    </div>
	                  </div>
	                ) : round.result === 'wrong' ? (
	                  t.play.wrong
	                ) : (
                  formatIdlePrompt(round.targetColor)
                )}
              </div>

	              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
	                {round.options.map((vehicle) => {
	                  const selected = round.selectedIds.includes(vehicle.id);
	                  const wrongSelected =
	                    round.lastSelectedId === vehicle.id && round.result === 'wrong';
	                  const correct = colorForVehicle(vehicle) === round.targetColor;

                  return (
                    <button
                      key={vehicle.id}
                      className={`group relative flex aspect-[4/3] flex-col items-center justify-center overflow-hidden rounded-[28px] border bg-white/35 p-3 transition-transform active:scale-[0.98] ${
	                        selected
	                          ? 'border-green-700/45'
	                          : wrongSelected
	                            ? 'border-red-700/45'
	                          : 'border-[#202A36]/10 hover:border-[#202A36]/28'
	                      }`}
                      type="button"
                      onClick={() => handleVehiclePick(vehicle)}
                    >
                      <img
                        className="h-[76%] w-full object-contain transition-transform duration-200 group-hover:scale-[1.03]"
                        src={assetUrl(vehicle.image)}
                        alt={vehicle.name}
                      />
                      <span className="mt-1 max-w-full truncate text-xs font-bold opacity-70">
                        {vehicle.name}
                      </span>
	                      {selected && correct && (
                        <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-green-700 text-white">
                          <Check size={17} strokeWidth={2.4} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </main>
      )}

      {view === 'garage' && (
        <main className="relative z-[5] mx-auto min-h-[100dvh] max-w-[1440px] px-4 pb-10 pt-28 sm:px-8">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] opacity-55">
                {t.garage.kicker}
              </p>
              <h1 className="text-4xl font-extrabold uppercase tracking-[0.08em] sm:text-6xl">
                {markedVehicles.length} {t.garage.markedVehicles}
              </h1>
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-full border border-[#202A36]/20 bg-white/55 px-4 py-2 text-sm font-extrabold uppercase tracking-[0.12em]"
              type="button"
              onClick={() => openView('parents')}
            >
              <Settings2 size={16} strokeWidth={2.25} />
              {t.garage.editColors}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {markedVehicles.map((vehicle) => (
              <article
                key={vehicle.id}
                className="flex aspect-[4/3] flex-col items-center justify-center rounded-[28px] border border-[#202A36]/10 bg-white/35 p-3"
              >
                <img className="h-[72%] w-full object-contain" src={assetUrl(vehicle.image)} alt={vehicle.name} />
                <strong className="mt-1 max-w-full truncate text-xs">{vehicle.name}</strong>
                <span className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] opacity-55">
                  {colorLabel(colorForVehicle(vehicle))}
                </span>
              </article>
            ))}
          </div>
        </main>
      )}

      {view === 'parents' && (
        <main className="relative z-[5] mx-auto min-h-[100dvh] max-w-[1440px] px-4 pb-10 pt-28 sm:px-8">
          <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] opacity-55">
                {t.parents.kicker}
              </p>
              <h1 className="text-4xl font-extrabold uppercase tracking-[0.08em] sm:text-6xl">
                {t.parents.title}
              </h1>
              <p className="mt-3 max-w-[680px] text-sm leading-6 opacity-70">
                {t.parents.description}
              </p>
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-full border border-[#202A36]/20 bg-white/55 px-4 py-2 text-sm font-extrabold uppercase tracking-[0.12em]"
              type="button"
              onClick={() => setColorOverrides({})}
            >
              {t.parents.reset}
            </button>
          </div>

          <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
            <button
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] ${
                parentFilter === 'all'
                  ? 'border-[#202A36] bg-[#202A36] text-white'
                  : 'border-[#202A36]/20 bg-white/45'
              }`}
              type="button"
              onClick={() => setParentFilter('all')}
            >
              {t.parents.all} {VEHICLES.length}
            </button>
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] ${
                  parentFilter === color
                    ? 'border-[#202A36] bg-[#202A36] text-white'
                    : 'border-[#202A36]/20 bg-white/45'
                }`}
                type="button"
                onClick={() => setParentFilter(color)}
              >
                {colorLabel(color)} {colorCounts.get(color) || 0}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {parentVehicles.map((vehicle) => {
              const currentColor = colorForVehicle(vehicle);

              return (
                <article
                  key={vehicle.id}
                  className="grid grid-cols-[112px_1fr] gap-4 rounded-[28px] border border-[#202A36]/10 bg-white/35 p-3"
                >
                  <div className="flex aspect-[4/3] items-center justify-center rounded-3xl bg-white/35">
                    <img className="h-full w-full object-contain" src={assetUrl(vehicle.image)} alt={vehicle.name} />
                  </div>
                  <div className="min-w-0">
                    <strong className="block truncate text-sm">{vehicle.name}</strong>
                    <span className="mt-1 block text-xs font-bold uppercase tracking-[0.12em] opacity-55">
                      {vehicle.category}
                    </span>
                    <label className="mt-3 block text-xs font-extrabold uppercase tracking-[0.12em] opacity-60">
                      {t.parents.mainColor}
                    </label>
                    <select
                      className="mt-2 w-full rounded-2xl border border-[#202A36]/15 bg-[#F8F4F4] px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-[#202A36]/20"
                      value={currentColor}
                      onChange={(event) =>
                        updateVehicleColor(vehicle.id, event.target.value as VehicleColor)
                      }
                    >
                      <option value="unknown">{colorLabel('unknown')}</option>
                      {COLOR_OPTIONS.map((color) => (
                        <option key={color} value={color}>
                          {colorLabel(color)}
                        </option>
                      ))}
                    </select>
                  </div>
                </article>
              );
            })}
          </div>
        </main>
      )}
    </div>
  );
}

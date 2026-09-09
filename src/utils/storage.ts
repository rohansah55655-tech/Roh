import { CarSpecs, GameMode, TrackEnvironment } from '../types';
import { INITIAL_CARS } from '../data/cars';

const STORAGE_KEY = 'turbo_circuit_racing_save_v1';

export interface SaveData {
  highScores: Record<GameMode, number>;
  totalCoins: number;
  unlockedCars: Record<string, boolean>;
  carUpgrades: Record<string, CarSpecs['upgrades']>;
  selectedCarId: string;
  selectedTrack: TrackEnvironment;
  soundEnabled: boolean;
  musicEnabled: boolean;
  language: 'hi' | 'en';
  controlType: 'buttons' | 'tilt';
}

const DEFAULT_SAVE: SaveData = {
  highScores: {
    endless: 0,
    time_trial: 0,
    police_chase: 0,
  },
  totalCoins: 250, // Starting bonus
  unlockedCars: {
    red_lightning: true,
  },
  carUpgrades: {},
  selectedCarId: 'red_lightning',
  selectedTrack: 'coastal_highway',
  soundEnabled: true,
  musicEnabled: true,
  language: 'hi',
  controlType: 'buttons',
};

export function loadSaveData(): SaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SAVE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SAVE,
      ...parsed,
      highScores: { ...DEFAULT_SAVE.highScores, ...(parsed.highScores || {}) },
      unlockedCars: { ...DEFAULT_SAVE.unlockedCars, ...(parsed.unlockedCars || {}) },
      carUpgrades: { ...DEFAULT_SAVE.carUpgrades, ...(parsed.carUpgrades || {}) },
    };
  } catch {
    return DEFAULT_SAVE;
  }
}

export function saveGameData(data: SaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors
  }
}

export function mergeCarsWithSave(cars: CarSpecs[], save: SaveData): CarSpecs[] {
  return cars.map((car) => {
    const isUnlocked = !!save.unlockedCars[car.id] || car.price === 0;
    const upgrades = save.carUpgrades[car.id] || car.upgrades;
    return {
      ...car,
      unlocked: isUnlocked,
      upgrades,
    };
  });
}

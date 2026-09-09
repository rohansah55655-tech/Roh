export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'GARAGE' | 'HOWTOPLAY';

export type GameMode = 'endless' | 'time_trial' | 'police_chase';

export type TrackEnvironment = 'cyber_neon' | 'sunset_desert' | 'coastal_highway';

export interface CarSpecs {
  id: string;
  name: string;
  hindiName: string;
  description: string;
  hindiDescription: string;
  baseTopSpeed: number; // in km/h: 180 - 320
  baseAcceleration: number; // 1 - 5
  baseHandling: number; // 1 - 5
  baseMaxHealth: number; // 100
  color: string;
  secondaryColor: string;
  price: number;
  unlocked: boolean;
  type: 'sports' | 'formula' | 'cyber' | 'muscle' | 'hyper';
  upgrades: {
    speedLevel: number; // 0 to 4
    accelLevel: number;
    handlingLevel: number;
    nitroLevel: number;
  };
}

export interface PlayerControls {
  steerLeft: boolean;
  steerRight: boolean;
  accelerate: boolean;
  brake: boolean;
  nitro: boolean;
  horn: boolean;
}

export type PowerupType = 'coin' | 'nitro' | 'repair' | 'shield' | 'magnet';

export interface CollectibleItem {
  id: number;
  x: number;
  y: number; // in world road coordinates
  lane: number;
  type: PowerupType;
  value: number;
  radius: number;
  rotation: number;
  collected?: boolean;
}

export interface TrafficVehicle {
  id: number;
  lane: number;
  x: number; // relative to road center (-1 to 1)
  y: number; // road world Y position
  targetLane: number;
  speed: number;
  baseSpeed: number;
  type: 'sedan' | 'sports' | 'truck' | 'police' | 'taxi' | 'bus';
  color: string;
  width: number;
  length: number;
  changeLaneTimer: number;
  turnSignal: 'left' | 'right' | 'none';
  sirenTime?: number;
  health: number;
  markedNearMiss?: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'smoke' | 'fire' | 'spark' | 'debris' | 'speedline' | 'water' | 'text';
  text?: string;
}

export interface SkidMark {
  leftX: number;
  leftY: number;
  rightX: number;
  rightY: number;
  alpha: number;
}

export interface GameStats {
  score: number;
  distanceKm: number;
  coinsEarned: number;
  nearMisses: number;
  maxSpeed: number;
  timeRemaining: number;
  heatLevel: number;
  combo: number;
  comboTimer: number;
}

export interface ActivePowerup {
  type: 'shield' | 'magnet';
  duration: number; // in ms
  maxDuration: number;
}

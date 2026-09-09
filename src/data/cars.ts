import { CarSpecs, TrackEnvironment } from '../types';

export const INITIAL_CARS: CarSpecs[] = [
  {
    id: 'red_lightning',
    name: 'Red Lightning',
    hindiName: 'रेड लाइटनिंग (लाल बिजली)',
    description: 'A nimble, high-revving sports coupe with excellent cornering balance.',
    hindiDescription: 'एक फुर्तीली स्पोर्ट्स कूपे जो शानदार हैंडलिंग और बैलेंस देती है।',
    baseTopSpeed: 210,
    baseAcceleration: 3,
    baseHandling: 4,
    baseMaxHealth: 100,
    color: '#ef4444', // Red
    secondaryColor: '#ffffff',
    price: 0,
    unlocked: true,
    type: 'sports',
    upgrades: {
      speedLevel: 0,
      accelLevel: 0,
      handlingLevel: 0,
      nitroLevel: 0,
    },
  },
  {
    id: 'midnight_muscle',
    name: 'Midnight Muscle',
    hindiName: 'मिडनाइट मस्कल',
    description: 'Heavy V8 engine muscle car with steel chassis. Bumps traffic with minimal damage!',
    hindiDescription: 'मजबूत V8 इंजन वाली भारी कार। ट्रैफिक से टकराने पर भी कम नुकसान होता है!',
    baseTopSpeed: 230,
    baseAcceleration: 4,
    baseHandling: 2,
    baseMaxHealth: 150,
    color: '#1e293b', // Midnight slate
    secondaryColor: '#f59e0b', // Amber racing stripes
    price: 800,
    unlocked: false,
    type: 'muscle',
    upgrades: {
      speedLevel: 0,
      accelLevel: 0,
      handlingLevel: 0,
      nitroLevel: 0,
    },
  },
  {
    id: 'cyber_phantom',
    name: 'Cyber Phantom',
    hindiName: 'साइबर फैंटम (नियॉन)',
    description: 'Futuristic hyper-tech racer equipped with dual nitro tanks and magnetic drift.',
    hindiDescription: 'डबल नाइट्रो टैंक और नियॉन चमक वाली भविष्य की सबसे तेज हाइपर कार।',
    baseTopSpeed: 260,
    baseAcceleration: 4,
    baseHandling: 4,
    baseMaxHealth: 110,
    color: '#06b6d4', // Cyan
    secondaryColor: '#a855f7', // Purple
    price: 2000,
    unlocked: false,
    type: 'cyber',
    upgrades: {
      speedLevel: 0,
      accelLevel: 0,
      handlingLevel: 0,
      nitroLevel: 0,
    },
  },
  {
    id: 'apex_f1',
    name: 'Apex F1 Rocket',
    hindiName: 'एपेक्स F1 रॉकेट',
    description: 'Extreme open-wheel Formula racer designed for blinding top speeds and razor precision.',
    hindiDescription: 'फॉर्मूला 1 स्टाइल की ओपन-व्हील कार जो बिजली जैसी रफ्तार पकड़ती है।',
    baseTopSpeed: 300,
    baseAcceleration: 5,
    baseHandling: 5,
    baseMaxHealth: 90,
    color: '#eab308', // Racing Gold
    secondaryColor: '#000000',
    price: 4500,
    unlocked: false,
    type: 'formula',
    upgrades: {
      speedLevel: 0,
      accelLevel: 0,
      handlingLevel: 0,
      nitroLevel: 0,
    },
  },
  {
    id: 'hyper_titan',
    name: 'Hyper Titan X',
    hindiName: 'हाइपर टाइटन X',
    description: 'The pinnacle of racing engineering with indestructible carbon-titanium body.',
    hindiDescription: 'अल्ट्रा टाइटेनियम बॉडी वाली अपराजेय सुपरकार जो हर रिकॉर्ड तोड़ देगी।',
    baseTopSpeed: 330,
    baseAcceleration: 5,
    baseHandling: 5,
    baseMaxHealth: 140,
    color: '#10b981', // Emerald
    secondaryColor: '#fbbf24',
    price: 8000,
    unlocked: false,
    type: 'hyper',
    upgrades: {
      speedLevel: 0,
      accelLevel: 0,
      handlingLevel: 0,
      nitroLevel: 0,
    },
  },
];

export interface TrackTheme {
  id: TrackEnvironment;
  name: string;
  hindiName: string;
  skyGradient: [string, string];
  horizonColor: string;
  roadColor: string;
  laneColor: string;
  curbColorA: string;
  curbColorB: string;
  barrierColor: string;
  sceneryType: 'city' | 'desert' | 'coast';
}

export const TRACK_THEMES: Record<TrackEnvironment, TrackTheme> = {
  coastal_highway: {
    id: 'coastal_highway',
    name: 'Coastal Alpine Highway',
    hindiName: 'कोस्टल हाईवे (समुद्र तट)',
    skyGradient: ['#38bdf8', '#bae6fd'],
    horizonColor: '#0284c7',
    roadColor: '#334155',
    laneColor: '#f8fafc',
    curbColorA: '#ef4444',
    curbColorB: '#ffffff',
    barrierColor: '#64748b',
    sceneryType: 'coast',
  },
  sunset_desert: {
    id: 'sunset_desert',
    name: 'Sunset Desert Canyon',
    hindiName: 'डेजर्ट सनसेट (रेगिस्तान)',
    skyGradient: ['#ea580c', '#fdba74'],
    horizonColor: '#b45309',
    roadColor: '#3f3f46',
    laneColor: '#fef08a',
    curbColorA: '#f97316',
    curbColorB: '#ffffff',
    barrierColor: '#78716c',
    sceneryType: 'desert',
  },
  cyber_neon: {
    id: 'cyber_neon',
    name: 'Neon Cyber City (Night)',
    hindiName: 'नियॉन साइबर सिटी (रात)',
    skyGradient: ['#0f172a', '#3b0764'],
    horizonColor: '#581c87',
    roadColor: '#18181b',
    laneColor: '#38bdf8',
    curbColorA: '#ec4899',
    curbColorB: '#06b6d4',
    barrierColor: '#8b5cf6',
    sceneryType: 'city',
  },
};

export const UPGRADE_PRICES = {
  speed: [200, 500, 1000, 2000],
  accel: [180, 450, 900, 1800],
  handling: [150, 400, 800, 1600],
  nitro: [250, 600, 1200, 2500],
};

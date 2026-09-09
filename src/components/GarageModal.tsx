import React, { useState } from 'react';
import { X, Wrench, Zap, Gauge, Shield, Check, Lock, ChevronLeft, ChevronRight, Palette } from 'lucide-react';
import { CarSpecs } from '../types';
import { UPGRADE_PRICES } from '../data/cars';
import { sound } from '../utils/audio';

interface GarageModalProps {
  cars: CarSpecs[];
  selectedCarId: string;
  totalCoins: number;
  language: 'hi' | 'en';
  onSelectCar: (carId: string) => void;
  onUnlockCar: (carId: string, cost: number) => void;
  onUpgradeCar: (carId: string, stat: 'speed' | 'accel' | 'handling' | 'nitro', cost: number) => void;
  onChangeCarColor: (carId: string, color: string) => void;
  onClose: () => void;
}

const COLOR_PALETTE = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#a855f7', // Purple
  '#06b6d4', // Cyan
  '#f43f5e', // Rose
  '#1e293b', // Midnight Dark
];

export const GarageModal: React.FC<GarageModalProps> = ({
  cars,
  selectedCarId,
  totalCoins,
  language,
  onSelectCar,
  onUnlockCar,
  onUpgradeCar,
  onChangeCarColor,
  onClose,
}) => {
  const isHi = language === 'hi';
  const [currentIdx, setCurrentIdx] = useState(() => {
    const idx = cars.findIndex((c) => c.id === selectedCarId);
    return idx >= 0 ? idx : 0;
  });

  const car = cars[currentIdx] || cars[0];
  const isSelected = car.id === selectedCarId;

  const nextCar = () => {
    setCurrentIdx((prev) => (prev + 1) % cars.length);
  };

  const prevCar = () => {
    setCurrentIdx((prev) => (prev - 1 + cars.length) % cars.length);
  };

  const handleUpgrade = (stat: 'speed' | 'accel' | 'handling' | 'nitro') => {
    const levelKey = `${stat}Level` as keyof typeof car.upgrades;
    const currentLevel = car.upgrades[levelKey];
    if (currentLevel >= 4) return;
    const cost = UPGRADE_PRICES[stat][currentLevel];
    if (totalCoins >= cost) {
      sound.playPowerup();
      onUpgradeCar(car.id, stat, cost);
    }
  };

  const handleUnlock = () => {
    if (totalCoins >= car.price) {
      sound.playPowerup();
      onUnlockCar(car.id, car.price);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-wide">
                {isHi ? 'कार गैराज और अपग्रेड्स' : 'CAR GARAGE & UPGRADES'}
              </h2>
              <p className="text-xs text-slate-400">
                {isHi ? 'अपनी पसंदीदा रेसिंग कार चुनें और रफ्तार बढ़ाएं' : 'Select your racing machine and tune performance'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Coins Balance */}
            <div className="flex items-center gap-2 bg-slate-800 border border-amber-500/40 px-3.5 py-1.5 rounded-xl">
              <span className="text-lg">🪙</span>
              <span className="font-mono font-black text-amber-300 text-lg">{totalCoins}</span>
            </div>

            <button
              id="close-garage-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-5 overflow-y-auto">
          {/* Left: Car Showcase & Selector */}
          <div className="md:col-span-6 flex flex-col items-center justify-between bg-slate-950/70 border border-slate-800/80 rounded-xl p-5 relative">
            {/* Car Nav arrows */}
            <div className="w-full flex items-center justify-between">
              <button
                id="prev-car-btn"
                onClick={prevCar}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-700 transition-transform active:scale-95"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="text-center">
                <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400 block">
                  {car.type.toUpperCase()} CLASS
                </span>
                <h3 className="text-xl font-black text-white">{isHi ? car.hindiName : car.name}</h3>
              </div>

              <button
                id="next-car-btn"
                onClick={nextCar}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-700 transition-transform active:scale-95"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Visual Car Rendering Preview */}
            <div className="my-6 relative w-48 h-64 flex items-center justify-center">
              {/* Floor glow */}
              <div
                className="absolute inset-x-4 bottom-6 h-12 rounded-full blur-xl opacity-60"
                style={{ backgroundColor: car.color }}
              />

              {/* Vector representation of car */}
              <svg viewBox="0 0 120 200" className="w-40 h-56 drop-shadow-2xl z-10">
                {/* Shadow */}
                <ellipse cx="60" cy="110" rx="42" ry="75" fill="rgba(0,0,0,0.5)" />

                {/* Wheels */}
                <rect x="14" y="35" width="12" height="28" rx="4" fill="#09090b" />
                <rect x="94" y="35" width="12" height="28" rx="4" fill="#09090b" />
                <rect x="14" y="135" width="12" height="28" rx="4" fill="#09090b" />
                <rect x="94" y="135" width="12" height="28" rx="4" fill="#09090b" />

                {/* Main Body */}
                <rect x="24" y="25" width="72" height="150" rx="16" fill={car.color} />

                {/* Body Accents */}
                <rect x="36" y="55" width="48" height="85" rx="10" fill={car.secondaryColor} opacity="0.85" />

                {/* Windshield & Cockpit */}
                <rect x="40" y="65" width="40" height="60" rx="6" fill="#020617" />
                <path d="M 42 70 L 52 110 L 46 110 Z" fill="rgba(255,255,255,0.15)" />

                {/* Headlights */}
                <circle cx="36" cy="32" r="5" fill="#fef08a" />
                <circle cx="84" cy="32" r="5" fill="#fef08a" />

                {/* Taillights */}
                <rect x="32" y="168" width="16" height="5" rx="2" fill="#ef4444" />
                <rect x="72" y="168" width="16" height="5" rx="2" fill="#ef4444" />
              </svg>
            </div>

            {/* Paint Color Swatches */}
            {car.unlocked && (
              <div className="w-full mt-2 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1.5 font-bold">
                  <Palette className="w-4 h-4 text-sky-400" />
                  {isHi ? 'रंग बदलें:' : 'Paint:'}
                </span>
                <div className="flex items-center gap-1.5">
                  {COLOR_PALETTE.map((col) => (
                    <button
                      key={col}
                      onClick={() => onChangeCarColor(car.id, col)}
                      style={{ backgroundColor: col }}
                      className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 active:scale-95 ${
                        car.color === col ? 'border-white ring-2 ring-sky-400' : 'border-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Select or Unlock Button */}
            <div className="w-full mt-4">
              {car.unlocked ? (
                <button
                  id="select-car-btn"
                  onClick={() => onSelectCar(car.id)}
                  disabled={isSelected}
                  className={`w-full py-3 rounded-xl font-black text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
                    isSelected
                      ? 'bg-emerald-600/25 border border-emerald-500/50 text-emerald-400 cursor-default'
                      : 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg active:scale-98'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-5 h-5" />
                      {isHi ? 'वर्तमान चुनी हुई कार' : 'SELECTED CAR'}
                    </>
                  ) : (
                    isHi ? 'यह कार चुनें' : 'CHOOSE THIS CAR'
                  )}
                </button>
              ) : (
                <button
                  id="unlock-car-btn"
                  onClick={handleUnlock}
                  disabled={totalCoins < car.price}
                  className={`w-full py-3 rounded-xl font-black text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
                    totalCoins >= car.price
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg active:scale-98'
                      : 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  {isHi ? `कार अनलॉक करें (${car.price} 🪙)` : `UNLOCK CAR (${car.price} 🪙)`}
                </button>
              )}
            </div>
          </div>

          {/* Right: Performance Specs & Upgrades */}
          <div className="md:col-span-6 flex flex-col justify-between gap-4">
            <div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                {isHi ? car.hindiDescription : car.description}
              </p>

              {/* Stats & Upgrade List */}
              <div className="flex flex-col gap-3">
                {/* 1. Top Speed */}
                <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Gauge className="w-4 h-4 text-sky-400" />
                      {isHi ? 'अधिकतम गति' : 'TOP SPEED'}
                    </span>
                    <span className="font-mono text-xs font-bold text-white">
                      {car.baseTopSpeed + car.upgrades.speedLevel * 25} km/h
                    </span>
                  </div>
                  {/* Level Pips & Upgrade Button */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1 flex-1">
                      {[0, 1, 2, 3].map((lvl) => (
                        <div
                          key={lvl}
                          className={`h-2 flex-1 rounded-full ${
                            lvl < car.upgrades.speedLevel ? 'bg-sky-400' : 'bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                    {car.unlocked && car.upgrades.speedLevel < 4 && (
                      <button
                        onClick={() => handleUpgrade('speed')}
                        disabled={totalCoins < UPGRADE_PRICES.speed[car.upgrades.speedLevel]}
                        className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                          totalCoins >= UPGRADE_PRICES.speed[car.upgrades.speedLevel]
                            ? 'bg-sky-600 hover:bg-sky-500 text-white'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        +{UPGRADE_PRICES.speed[car.upgrades.speedLevel]} 🪙
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Acceleration */}
                <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400" />
                      {isHi ? 'एक्सिलरेशन (पिकअप)' : 'ACCELERATION'}
                    </span>
                    <span className="font-mono text-xs font-bold text-white">
                      Level {car.baseAcceleration + car.upgrades.accelLevel}/9
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1 flex-1">
                      {[0, 1, 2, 3].map((lvl) => (
                        <div
                          key={lvl}
                          className={`h-2 flex-1 rounded-full ${
                            lvl < car.upgrades.accelLevel ? 'bg-amber-400' : 'bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                    {car.unlocked && car.upgrades.accelLevel < 4 && (
                      <button
                        onClick={() => handleUpgrade('accel')}
                        disabled={totalCoins < UPGRADE_PRICES.accel[car.upgrades.accelLevel]}
                        className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                          totalCoins >= UPGRADE_PRICES.accel[car.upgrades.accelLevel]
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        +{UPGRADE_PRICES.accel[car.upgrades.accelLevel]} 🪙
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. Handling */}
                <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-emerald-400" />
                      {isHi ? 'हैंडलिंग व कॉर्नरिंग' : 'HANDLING'}
                    </span>
                    <span className="font-mono text-xs font-bold text-white">
                      Level {car.baseHandling + car.upgrades.handlingLevel}/9
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1 flex-1">
                      {[0, 1, 2, 3].map((lvl) => (
                        <div
                          key={lvl}
                          className={`h-2 flex-1 rounded-full ${
                            lvl < car.upgrades.handlingLevel ? 'bg-emerald-400' : 'bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                    {car.unlocked && car.upgrades.handlingLevel < 4 && (
                      <button
                        onClick={() => handleUpgrade('handling')}
                        disabled={totalCoins < UPGRADE_PRICES.handling[car.upgrades.handlingLevel]}
                        className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                          totalCoins >= UPGRADE_PRICES.handling[car.upgrades.handlingLevel]
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        +{UPGRADE_PRICES.handling[car.upgrades.handlingLevel]} 🪙
                      </button>
                    )}
                  </div>
                </div>

                {/* 4. Nitro Boost NOS */}
                <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      {isHi ? 'नाइट्रो बूस्ट' : 'NITRO CAPACITY'}
                    </span>
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      Level {car.upgrades.nitroLevel + 1}/5
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1 flex-1">
                      {[0, 1, 2, 3].map((lvl) => (
                        <div
                          key={lvl}
                          className={`h-2 flex-1 rounded-full ${
                            lvl < car.upgrades.nitroLevel ? 'bg-cyan-400' : 'bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                    {car.unlocked && car.upgrades.nitroLevel < 4 && (
                      <button
                        onClick={() => handleUpgrade('nitro')}
                        disabled={totalCoins < UPGRADE_PRICES.nitro[car.upgrades.nitroLevel]}
                        className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                          totalCoins >= UPGRADE_PRICES.nitro[car.upgrades.nitroLevel]
                            ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        +{UPGRADE_PRICES.nitro[car.upgrades.nitroLevel]} 🪙
                      </button>
                    )}
                  </div>
                </div>

                {/* Armor Perk Info */}
                <div className="flex items-center gap-2 bg-slate-950/40 px-3 py-2 rounded-xl border border-slate-800/70 text-xs text-slate-400">
                  <Shield className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>
                    {isHi ? 'कवच (हेल्थ):' : 'Armor HP:'}{' '}
                    <strong className="text-white font-mono">{car.baseMaxHealth} HP</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Car Carousels thumbnail buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {cars.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => setCurrentIdx(i)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    i === currentIdx
                      ? 'bg-sky-600 text-white border-sky-400'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {isHi ? c.hindiName.split(' ')[0] : c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

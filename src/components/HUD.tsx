import React from 'react';
import { Volume2, VolumeX, Pause, Play, Flame, Shield, Magnet, Bell, Clock, Award } from 'lucide-react';
import { GameMode, ActivePowerup } from '../types';

interface HUDProps {
  speed: number;
  rpm: number;
  nitroPercent: number;
  healthPercent: number;
  score: number;
  distanceKm: number;
  coins: number;
  combo: number;
  timeRemaining: number;
  heatLevel: number;
  activePowerups: ActivePowerup[];
  gameMode: GameMode;
  isPaused: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
  language: 'hi' | 'en';
  onTogglePause: () => void;
  onToggleSound: () => void;
  onHonkHorn: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  speed,
  rpm,
  nitroPercent,
  healthPercent,
  score,
  distanceKm,
  coins,
  combo,
  timeRemaining,
  gameMode,
  isPaused,
  soundEnabled,
  language,
  activePowerups,
  onTogglePause,
  onToggleSound,
  onHonkHorn,
}) => {
  const isHi = language === 'hi';

  // Calculate speedometer needle angle (-120deg to 120deg)
  const maxVisualSpeed = 340;
  const speedRatio = Math.min(speed / maxVisualSpeed, 1);
  const needleDeg = -120 + speedRatio * 240;

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 sm:p-5 select-none font-sans">
      {/* Top Header Bar */}
      <div className="flex items-start justify-between w-full">
        {/* Score & Distance Panel */}
        <div className="flex flex-col gap-1.5 pointer-events-auto">
          <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md border border-slate-700/60 px-3.5 py-1.5 rounded-xl shadow-lg">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                {isHi ? 'स्कोर' : 'SCORE'}
              </span>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-mono">
                {score.toLocaleString()}
              </span>
            </div>
            {combo > 1 && (
              <div className="ml-2 px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-xs animate-pulse flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" />
                <span>{combo}x {isHi ? 'कॉम्बो' : 'COMBO'}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 px-2.5 py-1 rounded-lg">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">{isHi ? 'दूरी' : 'DIST'}:</span>
              <span className="text-sm font-bold text-sky-400 font-mono">{distanceKm} km</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md border border-amber-500/30 px-2.5 py-1 rounded-lg">
              <span className="text-amber-400 font-bold text-xs">🪙</span>
              <span className="text-sm font-bold text-amber-300 font-mono">{coins}</span>
            </div>
          </div>
        </div>

        {/* Center Mode-Specific Warning or Timer */}
        <div className="flex flex-col items-center pointer-events-auto">
          {gameMode === 'time_trial' && (
            <div
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-xl backdrop-blur-md ${
                timeRemaining <= 10
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-bounce'
                  : 'bg-slate-900/80 border-sky-500/50 text-white'
              }`}
            >
              <Clock className="w-4 h-4 text-sky-400" />
              <span className="text-sm uppercase tracking-wider font-semibold">
                {isHi ? 'समय' : 'TIME'}:
              </span>
              <span className="text-xl font-black font-mono">{timeRemaining}s</span>
            </div>
          )}

          {gameMode === 'police_chase' && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-950/85 border border-rose-500/80 rounded-full shadow-lg backdrop-blur-md animate-pulse text-rose-200">
              <span className="text-xs font-bold uppercase tracking-wide">
                🚨 {isHi ? 'पुलिस पीछा कर रही है!' : 'POLICE PURSUIT ACTIVE'}
              </span>
            </div>
          )}

          {/* Active Powerup Chips */}
          <div className="flex items-center gap-2 mt-2">
            {activePowerups.map((p) => (
              <div
                key={p.type}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-md ${
                  p.type === 'shield'
                    ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200'
                    : 'bg-rose-950/80 border-rose-400 text-rose-200'
                }`}
              >
                {p.type === 'shield' ? <Shield className="w-3.5 h-3.5" /> : <Magnet className="w-3.5 h-3.5" />}
                <span className="uppercase">{p.type}</span>
                <span className="font-mono text-[11px]">{Math.ceil(p.duration / 1000)}s</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls (Audio, Horn, Pause) */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            id="hud-horn-btn"
            onClick={onHonkHorn}
            title={isHi ? 'हॉर्न बजाएं' : 'Honk Horn'}
            className="p-2.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-amber-400 border border-slate-700/60 backdrop-blur-md transition-transform active:scale-90 shadow-lg"
          >
            <Bell className="w-5 h-5" />
          </button>
          <button
            id="hud-sound-btn"
            onClick={onToggleSound}
            title={isHi ? 'आवाज म्यूट/अनम्यूट' : 'Toggle Audio'}
            className="p-2.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-white border border-slate-700/60 backdrop-blur-md transition-transform active:scale-90 shadow-lg"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
          </button>
          <button
            id="hud-pause-btn"
            onClick={onTogglePause}
            title={isHi ? 'पॉज़ करें' : 'Pause'}
            className="p-2.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-white border border-slate-700/60 backdrop-blur-md transition-transform active:scale-90 shadow-lg"
          >
            {isPaused ? <Play className="w-5 h-5 text-emerald-400" /> : <Pause className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Bottom Cockpit Instrument Cluster */}
      <div className="flex items-end justify-between w-full pb-1">
        {/* Left: Health / Armor Status */}
        <div className="flex flex-col gap-1 w-36 sm:w-44 bg-slate-900/85 backdrop-blur-md border border-slate-700/60 p-2.5 rounded-xl shadow-lg pointer-events-auto">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-slate-300 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              {isHi ? 'कार स्वास्थ्य' : 'HEALTH'}
            </span>
            <span
              className={`font-mono ${
                healthPercent > 50 ? 'text-emerald-400' : healthPercent > 25 ? 'text-amber-400' : 'text-rose-500 animate-pulse'
              }`}
            >
              {healthPercent}%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
            <div
              className={`h-full transition-all duration-150 rounded-full ${
                healthPercent > 50
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : healthPercent > 25
                  ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                  : 'bg-gradient-to-r from-rose-600 to-red-500'
              }`}
              style={{ width: `${healthPercent}%` }}
            />
          </div>
        </div>

        {/* Center: Analog & Digital Speedometer */}
        <div className="relative flex flex-col items-center pointer-events-auto">
          {/* Circular Gauge Frame */}
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-slate-950/90 border-2 border-slate-700/70 backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center p-2">
            {/* Outer gauge tick marks SVG */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="44%"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-slate-800"
              />
              <circle
                cx="50%"
                cy="50%"
                r="44%"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray="280"
                strokeDashoffset={280 - (speedRatio * 200)}
                strokeLinecap="round"
                className={`transition-all duration-75 ${
                  speedRatio > 0.8 ? 'text-rose-500' : speedRatio > 0.5 ? 'text-amber-400' : 'text-sky-400'
                }`}
              />
            </svg>

            {/* Needle Pivot */}
            <div
              className="absolute w-1.5 h-12 sm:h-16 origin-bottom rounded-t-full transition-transform duration-75 shadow-md pointer-events-none"
              style={{
                bottom: '50%',
                left: 'calc(50% - 3px)',
                transform: `rotate(${needleDeg}deg)`,
                backgroundColor: speedRatio > 0.8 ? '#ef4444' : '#38bdf8',
              }}
            />
            <div className="absolute w-4 h-4 rounded-full bg-slate-900 border-2 border-sky-400 z-10" />

            {/* Digital Speed Readout */}
            <div className="z-10 text-center mt-6 sm:mt-8">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tighter text-white block leading-none">
                {speed}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400 block">
                KM/H
              </span>
            </div>
          </div>

          {/* RPM Mini bar under speedometer */}
          <div className="mt-1.5 flex items-center gap-1">
            <span className="text-[9px] font-bold text-slate-400 font-mono">RPM</span>
            <div className="w-24 sm:w-32 bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-sky-400 via-amber-400 to-rose-500 transition-all duration-75"
                style={{ width: `${Math.min((rpm / 8500) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Nitro Boost NOS Bar */}
        <div className="flex flex-col gap-1 w-36 sm:w-44 bg-slate-900/85 backdrop-blur-md border border-slate-700/60 p-2.5 rounded-xl shadow-lg pointer-events-auto">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-slate-300 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-cyan-400" />
              {isHi ? 'नाइट्रो NOS' : 'NITRO NOS'}
            </span>
            <span className="font-mono text-cyan-300">{nitroPercent}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
            <div
              className={`h-full transition-all duration-100 rounded-full ${
                nitroPercent > 20
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-sm shadow-cyan-400/50'
                  : 'bg-slate-600'
              }`}
              style={{ width: `${nitroPercent}%` }}
            />
          </div>
          <span className="text-[9px] text-slate-400 text-center font-semibold">
            {isHi ? '[SPACE] नाइट्रो दबाएं' : 'PRESS [SPACE] FOR BOOST'}
          </span>
        </div>
      </div>
    </div>
  );
};

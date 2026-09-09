import React from 'react';
import { Play, Wrench, Trophy, Flame, ShieldAlert, Clock, Sparkles, Volume2, VolumeX, HelpCircle, Globe } from 'lucide-react';
import { GameMode, TrackEnvironment, CarSpecs } from '../types';
import { TRACK_THEMES } from '../data/cars';
import { PWAInstallButton } from './PWAInstallButton';

interface MainMenuProps {
  selectedCar: CarSpecs;
  selectedTrack: TrackEnvironment;
  highScores: Record<GameMode, number>;
  totalCoins: number;
  language: 'hi' | 'en';
  soundEnabled: boolean;
  musicEnabled: boolean;
  onStartGame: (mode: GameMode) => void;
  onOpenGarage: () => void;
  onSelectTrack: (track: TrackEnvironment) => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onToggleLanguage: () => void;
  onOpenHowToPlay: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  selectedCar,
  selectedTrack,
  highScores,
  totalCoins,
  language,
  soundEnabled,
  musicEnabled,
  onStartGame,
  onOpenGarage,
  onSelectTrack,
  onToggleSound,
  onToggleMusic,
  onToggleLanguage,
  onOpenHowToPlay,
}) => {
  const isHi = language === 'hi';

  const modes: { id: GameMode; title: string; desc: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'endless',
      title: isHi ? 'अनंत हाईवे (Endless)' : 'Endless Highway',
      desc: isHi ? 'ट्रैफिक से बचें, नियर-मिस कॉम्बो बनाएं और रिकॉर्ड स्कोर तोड़ें।' : 'Dodge endless traffic, bank near-miss combos, and survive.',
      icon: <Flame className="w-6 h-6 text-amber-400" />,
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/40 hover:border-amber-400',
    },
    {
      id: 'time_trial',
      title: isHi ? 'टाइम अटैक (Time Attack)' : 'Time Attack Sprint',
      desc: isHi ? 'समय खत्म होने से पहले चेकपॉइंट तक पूरी रफ्तार से दौड़ें!' : 'Beat the ticking clock with aggressive nitro boosting!',
      icon: <Clock className="w-6 h-6 text-sky-400" />,
      color: 'from-sky-500/20 to-blue-500/10 border-sky-500/40 hover:border-sky-400',
    },
    {
      id: 'police_chase',
      title: isHi ? 'पुलिस चेज (Police Chase)' : 'Police Pursuit',
      desc: isHi ? 'सायरन वाली पुलिस गाड़ियों से बचें और हाईवे से भाग निकलें!' : 'Evade aggressive highway patrol cruisers in high-speed pursuit!',
      icon: <ShieldAlert className="w-6 h-6 text-rose-400" />,
      color: 'from-rose-500/20 to-red-500/10 border-rose-500/40 hover:border-rose-400',
    },
  ];

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-8 text-white select-none">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="w-full flex items-center justify-between max-w-6xl mx-auto z-10">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
            <span className="text-2xl">🏎️</span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-wider bg-gradient-to-r from-white via-sky-200 to-sky-400 bg-clip-text text-transparent">
              TURBO CIRCUIT
            </h1>
            <span className="text-[11px] font-bold text-sky-400 uppercase tracking-widest block">
              {isHi ? 'हाई-स्पीड 3D कार रेसिंग' : 'HIGH SPEED ARCADE RACER'}
            </span>
          </div>
        </div>

        {/* Header Right (Coins, Install, Audio, Language, Instructions) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* PWA Install App Button */}
          <PWAInstallButton language={language} />

          {/* Coin Wallet */}
          <button
            onClick={onOpenGarage}
            className="flex items-center gap-2 bg-slate-900/90 border border-amber-500/40 px-3.5 py-1.5 rounded-xl shadow-md hover:border-amber-400 transition-colors"
          >
            <span className="text-base">🪙</span>
            <span className="font-mono font-black text-amber-300 text-sm sm:text-base">{totalCoins}</span>
          </button>

          {/* Language Toggle */}
          <button
            id="lang-toggle-btn"
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 hover:bg-slate-800 text-xs font-bold transition-colors"
            title="Switch Language"
          >
            <Globe className="w-4 h-4 text-sky-400" />
            <span>{isHi ? 'ENG' : 'हिन्दी'}</span>
          </button>

          {/* Sound & Music Toggles */}
          <button
            id="sound-toggle-btn"
            onClick={onToggleSound}
            className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors"
            title={isHi ? 'साउंड' : 'Sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            id="how-to-play-btn"
            onClick={onOpenHowToPlay}
            className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors"
            title={isHi ? 'कैसे खेलें' : 'How to Play'}
          >
            <HelpCircle className="w-4 h-4 text-sky-400" />
          </button>
        </div>
      </div>

      {/* Center Main Stage */}
      <div className="w-full max-w-6xl mx-auto my-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center z-10">
        {/* Left Column: Selected Car Card & Garage Shortcut */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md relative overflow-hidden">
            {/* Top Car Label */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase font-bold text-sky-400 tracking-wider">
                {isHi ? 'आपकी वर्तमान कार' : 'ACTIVE RACER'}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-bold">
                {selectedCar.type.toUpperCase()}
              </span>
            </div>

            <h3 className="text-2xl font-black text-white">{isHi ? selectedCar.hindiName : selectedCar.name}</h3>
            <p className="text-xs text-slate-400 mb-4">{isHi ? selectedCar.hindiDescription : selectedCar.description}</p>

            {/* Car Preview Canvas/SVG */}
            <div className="relative w-full h-40 flex items-center justify-center bg-slate-950/60 rounded-xl border border-slate-800/80 my-2">
              {/* Floor glow */}
              <div
                className="absolute inset-x-8 bottom-3 h-8 rounded-full blur-lg opacity-60"
                style={{ backgroundColor: selectedCar.color }}
              />

              <svg viewBox="0 0 120 180" className="w-24 h-36 drop-shadow-2xl">
                {/* Shadow */}
                <ellipse cx="60" cy="100" rx="38" ry="65" fill="rgba(0,0,0,0.5)" />

                {/* Wheels */}
                <rect x="16" y="30" width="10" height="24" rx="3" fill="#09090b" />
                <rect x="94" y="30" width="10" height="24" rx="3" fill="#09090b" />
                <rect x="16" y="125" width="10" height="24" rx="3" fill="#09090b" />
                <rect x="94" y="125" width="10" height="24" rx="3" fill="#09090b" />

                {/* Body */}
                <rect x="25" y="20" width="70" height="140" rx="14" fill={selectedCar.color} />
                <rect x="36" y="50" width="48" height="75" rx="8" fill={selectedCar.secondaryColor} opacity="0.8" />
                <rect x="40" y="60" width="40" height="50" rx="6" fill="#020617" />
                <circle cx="36" cy="28" r="4" fill="#fef08a" />
                <circle cx="84" cy="28" r="4" fill="#fef08a" />
                <rect x="32" y="152" width="14" height="4" rx="2" fill="#ef4444" />
                <rect x="74" y="152" width="14" height="4" rx="2" fill="#ef4444" />
              </svg>
            </div>

            {/* Quick Specs Bar */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800 text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">{isHi ? 'गति' : 'SPEED'}</span>
                <span className="text-sm font-black font-mono text-sky-400">
                  {selectedCar.baseTopSpeed + selectedCar.upgrades.speedLevel * 25} km/h
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">{isHi ? 'पिकअप' : 'ACCEL'}</span>
                <span className="text-sm font-black font-mono text-amber-400">
                  {selectedCar.baseAcceleration + selectedCar.upgrades.accelLevel}/9
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">{isHi ? 'कंट्रोल' : 'HANDLING'}</span>
                <span className="text-sm font-black font-mono text-emerald-400">
                  {selectedCar.baseHandling + selectedCar.upgrades.handlingLevel}/9
                </span>
              </div>
            </div>

            {/* Open Garage CTA */}
            <button
              id="menu-open-garage-btn"
              onClick={onOpenGarage}
              className="w-full mt-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-98 shadow-md"
            >
              <Wrench className="w-4 h-4" />
              {isHi ? 'कार बदलें और अपग्रेड करें' : 'GARAGE & TUNING SHOP'}
            </button>
          </div>

          {/* Track Environment Selector */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block mb-2.5">
              {isHi ? 'ट्रैक और माहौल चुनें:' : 'SELECT TRACK ENVIRONMENT:'}
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(TRACK_THEMES) as TrackEnvironment[]).map((envKey) => {
                const trk = TRACK_THEMES[envKey];
                const isSelected = selectedTrack === envKey;
                return (
                  <button
                    key={envKey}
                    onClick={() => onSelectTrack(envKey)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-sky-600/20 border-sky-400 text-white shadow-md ring-1 ring-sky-400'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold block line-clamp-1">
                      {isHi ? trk.hindiName.split(' ')[0] : trk.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {envKey === 'cyber_neon' ? '🌙 Night' : envKey === 'sunset_desert' ? '🌅 Sunset' : '☀️ Day'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Game Modes Selection */}
        <div className="lg:col-span-7 flex flex-col gap-3.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isHi ? 'गेम मोड चुनें:' : 'CHOOSE GAME MODE TO START:'}
            </span>
            <span className="text-xs text-sky-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {isHi ? 'तैयार रहें' : 'PRESS TO RACE'}
            </span>
          </div>

          {modes.map((m) => {
            const modeHighScore = highScores[m.id] || 0;
            return (
              <div
                key={m.id}
                className={`relative group bg-gradient-to-r ${m.color} border rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:scale-[1.015] shadow-xl`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/60 shadow-md shrink-0">
                      {m.icon}
                    </div>
                    <div>
                      <h4 className="text-lg sm:text-xl font-black text-white tracking-wide">{m.title}</h4>
                      <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md">{m.desc}</p>

                      {/* Mode high score pill */}
                      <div className="flex items-center gap-1.5 mt-2.5 text-xs text-amber-300 font-mono font-bold">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isHi ? 'रिकॉर्ड:' : 'Best:'} {modeHighScore.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Play Button */}
                  <button
                    id={`start-mode-${m.id}-btn`}
                    onClick={() => onStartGame(m.id)}
                    className="self-center px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-sky-500/25 transition-all active:scale-95 flex items-center gap-2 shrink-0"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>{isHi ? 'रेस शुरू करें' : 'START RACE'}</span>
                  </button>
                </div>
              </div>
            );
          })}

          {/* Quick Keyboard Controls Tip Banner */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">
              🎮 {isHi ? 'कंट्रोल्स: स्टीयरिंग [A/D या ←/→], तेज गति [W या ↑], ब्रेक [S या ↓], नाइट्रो [SPACE]' : 'Controls: Steer [A/D or Arrows], Gas [W/↑], Brake [S/↓], Nitro [SPACE]'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-900 z-10">
        <span>Turbo Circuit: 2D Arcade Racing Engine</span>
        <span>{isHi ? '60 FPS प्रोसीजरल वेब ऑडियो और कैनवास' : '60 FPS Procedural Web Audio & Canvas'}</span>
      </div>
    </div>
  );
};

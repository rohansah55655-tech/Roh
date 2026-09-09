import React from 'react';
import { RotateCcw, Wrench, Home, Trophy, Award, Flame, Zap } from 'lucide-react';
import { GameStats, GameMode } from '../types';

interface GameOverModalProps {
  stats: GameStats;
  highScore: number;
  gameMode: GameMode;
  language: 'hi' | 'en';
  onRestart: () => void;
  onOpenGarage: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  highScore,
  language,
  onRestart,
  onOpenGarage,
  onMainMenu,
}) => {
  const isHi = language === 'hi';
  const isNewRecord = stats.score > highScore;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 flex flex-col items-center text-center">
        {/* Top Trophy / Skull badge */}
        <div className="relative mb-3">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center border-2 shadow-xl ${
              isNewRecord
                ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                : 'bg-rose-500/20 border-rose-500 text-rose-400'
            }`}
          >
            {isNewRecord ? <Trophy className="w-9 h-9" /> : <Award className="w-9 h-9" />}
          </div>
          {isNewRecord && (
            <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md animate-pulse">
              NEW RECORD!
            </span>
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide mb-1">
          {isNewRecord
            ? isHi ? '🎉 नया हाई स्कोर!' : '🎉 NEW HIGH SCORE!'
            : isHi ? 'रेस समाप्त!' : 'RACE CRASHED!'}
        </h2>
        <p className="text-xs text-slate-400 mb-5">
          {isHi ? 'आपकी रेसिंग का प्रदर्शन सारांश' : 'Here is your performance report'}
        </p>

        {/* Score Highlight Box */}
        <div className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-4 mb-4">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block mb-1">
            {isHi ? 'अंतिम स्कोर' : 'FINAL SCORE'}
          </span>
          <span className="text-4xl font-black text-amber-400 font-mono tracking-tight block">
            {stats.score.toLocaleString()}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-2.5 mb-6 text-left">
          <div className="bg-slate-950/50 border border-slate-800/80 p-2.5 rounded-xl flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                {isHi ? 'दूरी' : 'DISTANCE'}
              </span>
              <span className="text-sm font-bold text-white font-mono">{stats.distanceKm.toFixed(2)} km</span>
            </div>
          </div>

          <div className="bg-slate-950/50 border border-slate-800/80 p-2.5 rounded-xl flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <span className="text-sm">🪙</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                {isHi ? 'सिक्के' : 'COINS'}
              </span>
              <span className="text-sm font-bold text-amber-300 font-mono">+{stats.coinsEarned}</span>
            </div>
          </div>

          <div className="bg-slate-950/50 border border-slate-800/80 p-2.5 rounded-xl flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                {isHi ? 'नियर मिस' : 'NEAR MISSES'}
              </span>
              <span className="text-sm font-bold text-white font-mono">{stats.nearMisses}</span>
            </div>
          </div>

          <div className="bg-slate-950/50 border border-slate-800/80 p-2.5 rounded-xl flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                {isHi ? 'टॉप स्पीड' : 'MAX SPEED'}
              </span>
              <span className="text-sm font-bold text-sky-400 font-mono">{stats.maxSpeed} km/h</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            id="play-again-btn"
            onClick={onRestart}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-sm uppercase tracking-wider shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            {isHi ? 'फिर से खेलें (RESTART)' : 'PLAY AGAIN'}
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              id="garage-btn"
              onClick={onOpenGarage}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
            >
              <Wrench className="w-4 h-4" />
              {isHi ? 'कार गैराज' : 'GARAGE'}
            </button>

            <button
              id="main-menu-btn"
              onClick={onMainMenu}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
            >
              <Home className="w-4 h-4" />
              {isHi ? 'मेन मेन्यू' : 'MAIN MENU'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

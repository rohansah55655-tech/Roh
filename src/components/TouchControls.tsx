import React from 'react';
import { ChevronLeft, ChevronRight, Zap, Bell } from 'lucide-react';
import { PlayerControls } from '../types';

interface TouchControlsProps {
  controls: PlayerControls;
  onControlChange: (key: keyof PlayerControls, value: boolean) => void;
  language: 'hi' | 'en';
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onControlChange,
  language,
}) => {
  const isHi = language === 'hi';

  const bindTouch = (key: keyof PlayerControls) => ({
    onTouchStart: (e: React.TouchEvent) => {
      e.preventDefault();
      onControlChange(key, true);
    },
    onTouchEnd: (e: React.TouchEvent) => {
      e.preventDefault();
      onControlChange(key, false);
    },
    onMouseDown: (e: React.MouseEvent) => {
      e.preventDefault();
      onControlChange(key, true);
    },
    onMouseUp: (e: React.MouseEvent) => {
      e.preventDefault();
      onControlChange(key, false);
    },
    onMouseLeave: () => {
      onControlChange(key, false);
    },
  });

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-16 sm:bottom-20 z-20 flex justify-between px-3 sm:px-8 select-none">
      {/* Left steering group */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <button
          id="touch-steer-left"
          {...bindTouch('steerLeft')}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900/80 hover:bg-slate-800 active:bg-sky-600 active:scale-95 border-2 border-slate-700/80 text-white backdrop-blur-md shadow-2xl flex flex-col items-center justify-center transition-all touch-none"
        >
          <ChevronLeft className="w-9 h-9 text-sky-400" />
          <span className="text-[10px] uppercase font-bold text-slate-400">{isHi ? 'बाएं' : 'LEFT'}</span>
        </button>

        <button
          id="touch-steer-right"
          {...bindTouch('steerRight')}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900/80 hover:bg-slate-800 active:bg-sky-600 active:scale-95 border-2 border-slate-700/80 text-white backdrop-blur-md shadow-2xl flex flex-col items-center justify-center transition-all touch-none"
        >
          <ChevronRight className="w-9 h-9 text-sky-400" />
          <span className="text-[10px] uppercase font-bold text-slate-400">{isHi ? 'दाएं' : 'RIGHT'}</span>
        </button>
      </div>

      {/* Right action group (Brake, Nitro, Gas) */}
      <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
        <button
          id="touch-horn"
          {...bindTouch('horn')}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-amber-950/75 active:bg-amber-600 border border-amber-500/60 text-amber-300 backdrop-blur-md shadow-xl flex items-center justify-center transition-all active:scale-90 touch-none"
          title={isHi ? 'हॉर्न' : 'Horn'}
        >
          <Bell className="w-6 h-6" />
        </button>

        <button
          id="touch-nitro"
          {...bindTouch('nitro')}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-cyan-950/85 active:bg-cyan-500 active:scale-95 border-2 border-cyan-400/80 text-cyan-300 backdrop-blur-md shadow-2xl flex flex-col items-center justify-center transition-all touch-none animate-pulse"
        >
          <Zap className="w-7 h-7 text-cyan-300 fill-cyan-400/50" />
          <span className="text-[9px] uppercase font-black tracking-wider text-cyan-200">NOS</span>
        </button>

        <button
          id="touch-brake"
          {...bindTouch('brake')}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-rose-950/80 active:bg-rose-600 active:scale-95 border-2 border-rose-500/80 text-white backdrop-blur-md shadow-2xl flex flex-col items-center justify-center transition-all touch-none"
        >
          <span className="text-sm font-black text-rose-300">{isHi ? 'ब्रेक' : 'STOP'}</span>
          <span className="text-[9px] uppercase font-bold text-rose-400">{isHi ? 'धीमा' : 'BRAKE'}</span>
        </button>

        <button
          id="touch-gas"
          {...bindTouch('accelerate')}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-950/85 active:bg-emerald-600 active:scale-95 border-2 border-emerald-400/90 text-white backdrop-blur-md shadow-2xl flex flex-col items-center justify-center transition-all touch-none"
        >
          <span className="text-base sm:text-lg font-black text-emerald-300">{isHi ? 'दौड़' : 'GAS'}</span>
          <span className="text-[10px] uppercase font-bold text-emerald-400">{isHi ? 'तेज' : 'DRIVE'}</span>
        </button>
      </div>
    </div>
  );
};

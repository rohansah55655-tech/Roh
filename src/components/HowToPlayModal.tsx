import React from 'react';
import { X, Keyboard, Zap, Shield, Magnet, Flame, Award, Bell } from 'lucide-react';

interface HowToPlayModalProps {
  language: 'hi' | 'en';
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ language, onClose }) => {
  const isHi = language === 'hi';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">
                {isHi ? 'गेम कैसे खेलें (गाइड)' : 'HOW TO PLAY & PRO TIPS'}
              </h2>
              <p className="text-xs text-slate-400">
                {isHi ? 'कंट्रोल्स, पावर-अप्स और रिकॉर्ड स्कोर बनाने के तरीके' : 'Master controls, powerups, and drift mechanics'}
              </p>
            </div>
          </div>
          <button
            id="close-howtoplay-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-slate-300 text-sm">
          {/* Controls table */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-sky-400 mb-3 flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              {isHi ? 'कंट्रोल्स (कीबोर्ड और टच)' : 'CONTROLS (KEYBOARD & TOUCH)'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                <span>{isHi ? 'कार मोड़ें (बाएं / दाएं)' : 'Steer Left / Right'}</span>
                <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold text-white">
                  A / D or ← / →
                </span>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                <span>{isHi ? 'तेज दौड़ें (Gas / Drive)' : 'Accelerate (Gas)'}</span>
                <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold text-emerald-400">
                  W or ↑
                </span>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                <span>{isHi ? 'ब्रेक व धीमा करें' : 'Brake / Slow Down'}</span>
                <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold text-rose-400">
                  S or ↓
                </span>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                <span>{isHi ? 'नाइट्रो टर्बो बूस्ट (NOS)' : 'Turbo Nitro Boost'}</span>
                <span className="px-2.5 py-1 bg-cyan-950 border border-cyan-500/60 rounded-lg text-xs font-mono font-bold text-cyan-300">
                  SPACE / SHIFT
                </span>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                <span>{isHi ? 'हॉर्न बजाएं (ट्रैफिक हटाएं)' : 'Honk Horn (Traffic Alert)'}</span>
                <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold text-amber-400">
                  H
                </span>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                <span>{isHi ? 'गेम पॉज़ करें' : 'Pause Game'}</span>
                <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold text-white">
                  ESC / P
                </span>
              </div>
            </div>
          </div>

          {/* Scoring Tips */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4" />
              {isHi ? 'प्रो टिप्स और बोनस पॉइंट्स' : 'PRO TIPS & BONUS COMBOS'}
            </h3>
            <div className="space-y-2">
              <div className="bg-slate-950/50 border border-slate-800 p-3 rounded-xl flex items-start gap-3">
                <Flame className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">{isHi ? 'नियर मिस कॉम्बो (Near Miss):' : 'Near-Miss Combos:'}</strong>
                  <span className="text-xs text-slate-400">
                    {isHi
                      ? '130+ km/h की रफ्तार पर किसी भी ट्रैफिक कार के बिल्कुल बगल से निकलें। आपको कॉम्बो मल्टीप्लायर (2x, 3x, 4x...) और भारी बोनस मिलेगा!'
                      : 'Overtake traffic within inches at 130+ km/h. Chaining near-misses builds up to an 8x score multiplier!'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/50 border border-slate-800 p-3 rounded-xl flex items-start gap-3">
                <Bell className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">{isHi ? 'हॉर्न बजाना:' : 'Honking at Cars:'}</strong>
                  <span className="text-xs text-slate-400">
                    {isHi
                      ? 'जब आगे रास्ता बंद हो, तो हॉर्न दबाएं (H)। आगे वाली गाड़ियां साइड वाली लेन में हटने की कोशिश करेंगी!'
                      : 'Honk your horn (H) when traffic blocks your path. AI cars will activate blinkers and switch lanes!'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Powerups Directory */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              {isHi ? 'रोड पावर-अप्स' : 'ROAD POWER-UPS'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl text-center">
                <span className="text-2xl block mb-1">🪙</span>
                <span className="font-bold text-amber-400 text-xs block">{isHi ? 'सोने के सिक्के' : 'Gold Coins'}</span>
                <span className="text-[10px] text-slate-400">{isHi ? 'गैराज अपग्रेड्स' : 'For Garage Upgrades'}</span>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl text-center">
                <span className="text-2xl block mb-1">⚡</span>
                <span className="font-bold text-cyan-400 text-xs block">{isHi ? 'नाइट्रो कैन' : 'NOS Refill'}</span>
                <span className="text-[10px] text-slate-400">{isHi ? '+40% टर्बो गैस' : '+40% Boost Meter'}</span>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl text-center">
                <Shield className="w-6 h-6 text-sky-400 mx-auto mb-1" />
                <span className="font-bold text-sky-400 text-xs block">{isHi ? 'कवच (Shield)' : 'Invincible'}</span>
                <span className="text-[10px] text-slate-400">{isHi ? 'टकराव से सुरक्षा' : 'Deflects 1 Crash'}</span>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl text-center">
                <Magnet className="w-6 h-6 text-rose-400 mx-auto mb-1" />
                <span className="font-bold text-rose-400 text-xs block">{isHi ? 'चुंबक (Magnet)' : 'Coin Magnet'}</span>
                <span className="text-[10px] text-slate-400">{isHi ? 'सिक्कों को खींचे' : 'Attracts Coins'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex justify-end">
          <button
            id="close-howtoplay-footer-btn"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs uppercase tracking-wider transition-all"
          >
            {isHi ? 'समझ गया (GOT IT)' : 'GOT IT'}
          </button>
        </div>
      </div>
    </div>
  );
};

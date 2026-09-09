import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  language: 'hi' | 'en';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ language }) => {
  const isHi = language === 'hi';
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed, hide the install button
  if (isInstalled) {
    return null;
  }

  // Standard Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        id="pwa-install-btn"
        onClick={install}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all active:scale-95 border border-emerald-400/50 animate-pulse"
      >
        <Download className="w-4 h-4" />
        <span>{isHi ? 'ऐप इंस्टॉल करें' : 'INSTALL APP'}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          id="pwa-ios-install-btn"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:bg-slate-800 text-xs font-bold text-slate-300 transition-colors"
        >
          <Smartphone className="w-4 h-4 text-sky-400" />
          <span>{isHi ? 'iOS मा इंस्टॉल' : 'Install on iOS'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl text-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-sky-400" />
                  {isHi ? 'iPhone / iPad मा गेम इंस्टॉल गर्नुहोस्' : 'Install on iPhone / iPad'}
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 font-bold flex items-center justify-center text-[11px] shrink-0">1</span>
                  <span>Safari ब्राउजरको तल रहेको <strong>Share (शेयर)</strong> बटन थिच्नुहोस्।</span>
                </div>
                <div className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 font-bold flex items-center justify-center text-[11px] shrink-0">2</span>
                  <span>तल स्क्रोल गरेर <strong>Add to Home Screen (होम स्क्रिनमा थप्नुहोस्)</strong> छान्नुहोस्।</span>
                </div>
                <div className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>यसपछि तपाइँको मोबाइलको होम स्क्रिनमा यो गेम सामान्य एप जसरी नै फुलस्क्रिनमा चल्नेछ!</span>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider"
              >
                {isHi ? 'बुझें (Close)' : 'Close'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback desktop button showing installability prompt if triggered
  return (
    <button
      id="pwa-guide-btn"
      onClick={install}
      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:bg-slate-800 text-xs font-bold text-slate-300 transition-colors"
      title="Install to Desktop / Mobile"
    >
      <Download className="w-3.5 h-3.5 text-emerald-400" />
      <span>{isHi ? 'ऐप डाउनलोड' : 'Install App'}</span>
    </button>
  );
};

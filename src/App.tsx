import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, GameMode, TrackEnvironment, PlayerControls, CarSpecs, GameStats, ActivePowerup } from './types';
import { INITIAL_CARS } from './data/cars';
import { loadSaveData, saveGameData, mergeCarsWithSave, SaveData } from './utils/storage';
import { sound } from './utils/audio';
import { RacingCanvas } from './components/RacingCanvas';
import { HUD } from './components/HUD';
import { TouchControls } from './components/TouchControls';
import { MainMenu } from './components/MainMenu';
import { GarageModal } from './components/GarageModal';
import { GameOverModal } from './components/GameOverModal';
import { HowToPlayModal } from './components/HowToPlayModal';

export default function App() {
  // Load persistent save data
  const [saveData, setSaveData] = useState<SaveData>(() => loadSaveData());

  // Cars with unlocked/upgraded states
  const [cars, setCars] = useState<CarSpecs[]>(() => mergeCarsWithSave(INITIAL_CARS, loadSaveData()));

  // Active game session configuration
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [gameMode, setGameMode] = useState<GameMode>('endless');
  const [selectedTrack, setSelectedTrack] = useState<TrackEnvironment>(() => saveData.selectedTrack || 'coastal_highway');
  const [selectedCarId, setSelectedCarId] = useState<string>(() => saveData.selectedCarId || 'red_lightning');

  // Modals state
  const [isGarageOpen, setIsGarageOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [lastGameStats, setLastGameStats] = useState<GameStats | null>(null);

  // Audio & Language preferences
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => saveData.soundEnabled);
  const [musicEnabled, setMusicEnabled] = useState<boolean>(() => saveData.musicEnabled);
  const [language, setLanguage] = useState<'hi' | 'en'>(() => saveData.language || 'hi');

  // Controls state
  const [controls, setControls] = useState<PlayerControls>({
    steerLeft: false,
    steerRight: false,
    accelerate: false,
    brake: false,
    nitro: false,
    horn: false,
  });

  // HUD telemetry
  const [hudData, setHudData] = useState({
    speed: 0,
    rpm: 1200,
    nitroPercent: 100,
    healthPercent: 100,
    score: 0,
    distanceKm: 0,
    coins: 0,
    combo: 1,
    timeRemaining: 0,
    heatLevel: 0,
    activePowerups: [] as ActivePowerup[],
  });

  const controlsRef = useRef(controls);
  controlsRef.current = controls;

  // Sync Audio Settings with Engine
  useEffect(() => {
    sound.setSfxEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    sound.setMusicEnabled(musicEnabled);
  }, [musicEnabled]);

  // Persist SaveData on change
  const updateSave = useCallback((updater: (prev: SaveData) => SaveData) => {
    setSaveData((prev) => {
      const updated = updater(prev);
      saveGameData(updated);
      return updated;
    });
  }, []);

  // Find active car
  const activeCar = cars.find((c) => c.id === selectedCarId) || cars[0];

  // Control update handler
  const setControlKey = useCallback((key: keyof PlayerControls, value: boolean) => {
    setControls((prev) => {
      if (prev[key] === value) return prev;
      return { ...prev, [key]: value };
    });
  }, []);

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid interference if typing
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      sound.enableAudio();

      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          setControlKey('steerLeft', true);
          break;
        case 'ArrowRight':
        case 'KeyD':
          setControlKey('steerRight', true);
          break;
        case 'ArrowUp':
        case 'KeyW':
          setControlKey('accelerate', true);
          break;
        case 'ArrowDown':
        case 'KeyS':
          setControlKey('brake', true);
          break;
        case 'Space':
        case 'ShiftLeft':
        case 'ShiftRight':
          e.preventDefault();
          setControlKey('nitro', true);
          break;
        case 'KeyH':
          setControlKey('horn', true);
          break;
        case 'KeyP':
        case 'Escape':
          if (gameState === 'PLAYING') {
            setIsPaused((prev) => !prev);
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          setControlKey('steerLeft', false);
          break;
        case 'ArrowRight':
        case 'KeyD':
          setControlKey('steerRight', false);
          break;
        case 'ArrowUp':
        case 'KeyW':
          setControlKey('accelerate', false);
          break;
        case 'ArrowDown':
        case 'KeyS':
          setControlKey('brake', false);
          break;
        case 'Space':
        case 'ShiftLeft':
        case 'ShiftRight':
          setControlKey('nitro', false);
          break;
        case 'KeyH':
          setControlKey('horn', false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, setControlKey]);

  // Start game session
  const handleStartGame = (mode: GameMode) => {
    sound.enableAudio();
    if (musicEnabled) {
      sound.startMusic();
    }
    setGameMode(mode);
    setIsPaused(false);
    setControls({
      steerLeft: false,
      steerRight: false,
      accelerate: true, // auto drive off line
      brake: false,
      nitro: false,
      horn: false,
    });
    setGameState('PLAYING');
  };

  // Game over event
  const handleGameOver = useCallback((stats: GameStats) => {
    setGameState('GAMEOVER');
    setLastGameStats(stats);
    sound.stopMusic();

    // Update wallet and high score
    updateSave((prev) => {
      const currentHigh = prev.highScores[gameMode] || 0;
      const newHigh = Math.max(currentHigh, stats.score);
      return {
        ...prev,
        totalCoins: prev.totalCoins + stats.coinsEarned,
        highScores: {
          ...prev.highScores,
          [gameMode]: newHigh,
        },
      };
    });
  }, [gameMode, updateSave]);

  // Car Selection
  const handleSelectCar = (carId: string) => {
    setSelectedCarId(carId);
    updateSave((prev) => ({ ...prev, selectedCarId: carId }));
  };

  // Unlock car
  const handleUnlockCar = (carId: string, cost: number) => {
    if (saveData.totalCoins < cost) return;

    setCars((prev) =>
      prev.map((c) => (c.id === carId ? { ...c, unlocked: true } : c))
    );

    updateSave((prev) => ({
      ...prev,
      totalCoins: prev.totalCoins - cost,
      unlockedCars: { ...prev.unlockedCars, [carId]: true },
      selectedCarId: carId,
    }));
    setSelectedCarId(carId);
  };

  // Upgrade car stat
  const handleUpgradeCar = (
    carId: string,
    stat: 'speed' | 'accel' | 'handling' | 'nitro',
    cost: number
  ) => {
    if (saveData.totalCoins < cost) return;

    const levelKey = `${stat}Level` as keyof CarSpecs['upgrades'];

    setCars((prev) =>
      prev.map((c) => {
        if (c.id !== carId) return c;
        const newUpgrades = {
          ...c.upgrades,
          [levelKey]: Math.min(4, c.upgrades[levelKey] + 1),
        };
        return { ...c, upgrades: newUpgrades };
      })
    );

    updateSave((prev) => {
      const currentCarUpgrades = prev.carUpgrades[carId] || {
        speedLevel: 0,
        accelLevel: 0,
        handlingLevel: 0,
        nitroLevel: 0,
      };
      const updatedUpgrades = {
        ...currentCarUpgrades,
        [levelKey]: Math.min(4, currentCarUpgrades[levelKey] + 1),
      };
      return {
        ...prev,
        totalCoins: prev.totalCoins - cost,
        carUpgrades: {
          ...prev.carUpgrades,
          [carId]: updatedUpgrades,
        },
      };
    });
  };

  // Change Car Color
  const handleChangeCarColor = (carId: string, color: string) => {
    setCars((prev) =>
      prev.map((c) => (c.id === carId ? { ...c, color } : c))
    );
  };

  // Track selection
  const handleSelectTrack = (track: TrackEnvironment) => {
    setSelectedTrack(track);
    updateSave((prev) => ({ ...prev, selectedTrack: track }));
  };

  // Sound toggles
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    updateSave((prev) => ({ ...prev, soundEnabled: next }));
  };

  const handleToggleMusic = () => {
    const next = !musicEnabled;
    setMusicEnabled(next);
    updateSave((prev) => ({ ...prev, musicEnabled: next }));
  };

  const handleToggleLanguage = () => {
    const next = language === 'hi' ? 'en' : 'hi';
    setLanguage(next);
    updateSave((prev) => ({ ...prev, language: next }));
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black font-sans select-none">
      {/* 1. Main Racing Simulation Canvas */}
      {gameState === 'PLAYING' && (
        <>
          <RacingCanvas
            key={`${selectedCarId}-${gameMode}-${selectedTrack}`}
            playerCar={activeCar}
            gameMode={gameMode}
            trackEnv={selectedTrack}
            controls={controls}
            isPaused={isPaused}
            onGameOver={handleGameOver}
            onUpdateHUD={setHudData}
          />

          {/* HUD Overlay */}
          <HUD
            speed={hudData.speed}
            rpm={hudData.rpm}
            nitroPercent={hudData.nitroPercent}
            healthPercent={hudData.healthPercent}
            score={hudData.score}
            distanceKm={hudData.distanceKm}
            coins={hudData.coins}
            combo={hudData.combo}
            timeRemaining={hudData.timeRemaining}
            heatLevel={hudData.heatLevel}
            activePowerups={hudData.activePowerups}
            gameMode={gameMode}
            isPaused={isPaused}
            soundEnabled={soundEnabled}
            musicEnabled={musicEnabled}
            language={language}
            onTogglePause={() => setIsPaused((prev) => !prev)}
            onToggleSound={handleToggleSound}
            onHonkHorn={() => setControlKey('horn', true)}
          />

          {/* On-screen Touch Controls */}
          <TouchControls
            controls={controls}
            onControlChange={setControlKey}
            language={language}
          />

          {/* Paused Overlay */}
          {isPaused && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4">
              <div className="w-full max-w-xs bg-slate-900 border border-slate-700 rounded-2xl p-6 text-center shadow-2xl">
                <h3 className="text-xl font-black text-white mb-2">
                  {language === 'hi' ? 'खेल रुका हुआ है (PAUSED)' : 'GAME PAUSED'}
                </h3>
                <p className="text-xs text-slate-400 mb-5">
                  {language === 'hi' ? 'जारी रखने के लिए बटन दबाएं' : 'Press Resume to continue racing'}
                </p>
                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={() => setIsPaused(false)}
                    className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm uppercase tracking-wider"
                  >
                    {language === 'hi' ? 'जारी रखें (RESUME)' : 'RESUME'}
                  </button>
                  <button
                    onClick={() => {
                      setIsPaused(false);
                      setGameState('MENU');
                      sound.stopEngine();
                      sound.stopNitro();
                      sound.stopMusic();
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider"
                  >
                    {language === 'hi' ? 'मेन मेन्यू (MAIN MENU)' : 'MAIN MENU'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 2. Main Menu */}
      {gameState === 'MENU' && (
        <MainMenu
          selectedCar={activeCar}
          selectedTrack={selectedTrack}
          highScores={saveData.highScores}
          totalCoins={saveData.totalCoins}
          language={language}
          soundEnabled={soundEnabled}
          musicEnabled={musicEnabled}
          onStartGame={handleStartGame}
          onOpenGarage={() => setIsGarageOpen(true)}
          onSelectTrack={handleSelectTrack}
          onToggleSound={handleToggleSound}
          onToggleMusic={handleToggleMusic}
          onToggleLanguage={handleToggleLanguage}
          onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
        />
      )}

      {/* 3. Garage Modal */}
      {isGarageOpen && (
        <GarageModal
          cars={cars}
          selectedCarId={selectedCarId}
          totalCoins={saveData.totalCoins}
          language={language}
          onSelectCar={handleSelectCar}
          onUnlockCar={handleUnlockCar}
          onUpgradeCar={handleUpgradeCar}
          onChangeCarColor={handleChangeCarColor}
          onClose={() => setIsGarageOpen(false)}
        />
      )}

      {/* 4. Game Over Modal */}
      {gameState === 'GAMEOVER' && lastGameStats && (
        <GameOverModal
          stats={lastGameStats}
          highScore={saveData.highScores[gameMode] || 0}
          gameMode={gameMode}
          language={language}
          onRestart={() => handleStartGame(gameMode)}
          onOpenGarage={() => {
            setIsGarageOpen(true);
            setGameState('MENU');
          }}
          onMainMenu={() => setGameState('MENU')}
        />
      )}

      {/* 5. How to Play Modal */}
      {isHowToPlayOpen && (
        <HowToPlayModal
          language={language}
          onClose={() => setIsHowToPlayOpen(false)}
        />
      )}
    </main>
  );
}

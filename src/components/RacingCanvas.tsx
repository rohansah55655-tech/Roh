import React, { useEffect, useRef, useCallback } from 'react';
import {
  CarSpecs,
  GameMode,
  TrackEnvironment,
  PlayerControls,
  TrafficVehicle,
  CollectibleItem,
  Particle,
  SkidMark,
  GameStats,
  ActivePowerup,
} from '../types';
import { TRACK_THEMES } from '../data/cars';
import { sound } from '../utils/audio';

interface RacingCanvasProps {
  playerCar: CarSpecs;
  gameMode: GameMode;
  trackEnv: TrackEnvironment;
  controls: PlayerControls;
  isPaused: boolean;
  onGameOver: (stats: GameStats) => void;
  onUpdateHUD: (data: {
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
  }) => void;
}

export const RacingCanvas: React.FC<RacingCanvasProps> = ({
  playerCar,
  gameMode,
  trackEnv,
  controls,
  isPaused,
  onGameOver,
  onUpdateHUD,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Mutable game simulation state
  const stateRef = useRef({
    running: true,
    lastTime: 0,
    // Player physical state
    playerX: 0, // -1.0 (far left) to 1.0 (far right)
    playerWorldY: 0,
    playerSpeed: 0, // current km/h
    playerMaxSpeed: 220,
    playerAccel: 1.0,
    playerHandling: 1.0,
    playerHealth: 100,
    playerMaxHealth: 100,
    nitroAmount: 100, // 0 - 100%
    isDrifting: false,
    steerAngle: 0, // for wheel/chassis tilt
    // World curve simulation
    roadCurve: 0,
    targetCurve: 0,
    curveTimer: 0,
    // Entities
    traffic: [] as TrafficVehicle[],
    collectibles: [] as CollectibleItem[],
    particles: [] as Particle[],
    skidMarks: [] as SkidMark[],
    activePowerups: [] as ActivePowerup[],
    // Game stats
    stats: {
      score: 0,
      distanceKm: 0,
      coinsEarned: 0,
      nearMisses: 0,
      maxSpeed: 0,
      timeRemaining: gameMode === 'time_trial' ? 75 : 0,
      heatLevel: gameMode === 'police_chase' ? 1 : 0,
      combo: 1,
      comboTimer: 0,
    } as GameStats,
    // Camera shake
    shakeIntensity: 0,
    // Road visual offset
    roadOffset: 0,
    // Spawn counters
    nextTrafficDistance: 200,
    nextItemDistance: 400,
    trafficIdCounter: 1,
    itemIdCounter: 1,
    // Invulnerability after hit
    invincibleTimer: 0,
  });

  // Calculate upgraded car stats
  useEffect(() => {
    const s = stateRef.current;
    const speedBonus = playerCar.upgrades.speedLevel * 25;
    const accelBonus = playerCar.upgrades.accelLevel * 0.25;
    const handlingBonus = playerCar.upgrades.handlingLevel * 0.2;
    const healthBonus = (playerCar.baseMaxHealth - 100);

    s.playerMaxSpeed = playerCar.baseTopSpeed + speedBonus;
    s.playerAccel = (playerCar.baseAcceleration * 0.4) + accelBonus;
    s.playerHandling = (playerCar.baseHandling * 0.35) + handlingBonus;
    s.playerMaxHealth = playerCar.baseMaxHealth + healthBonus;
    s.playerHealth = s.playerMaxHealth;
  }, [playerCar]);

  // Audio start & cleanup
  useEffect(() => {
    sound.startEngine();
    return () => {
      sound.stopEngine();
      sound.stopNitro();
      sound.stopSkid();
      sound.stopSiren();
    };
  }, []);

  // Main game loop
  const triggerNearMiss = useCallback((x: number, y: number) => {
    const s = stateRef.current;
    s.stats.nearMisses++;
    s.stats.combo = Math.min(s.stats.combo + 1, 8);
    s.stats.comboTimer = 3.5;
    const bonus = 150 * s.stats.combo;
    s.stats.score += bonus;
    sound.playNearMiss();

    // Floating text particle
    s.particles.push({
      x,
      y,
      vx: 0,
      vy: -1.8,
      size: 18,
      color: '#38bdf8',
      alpha: 1.0,
      life: 0,
      maxLife: 50,
      type: 'text',
      text: `NEAR MISS! +${bonus}`,
    });
  }, []);

  // Collision response
  const triggerCrash = useCallback((damage: number, impactX: number, impactY: number) => {
    const s = stateRef.current;

    // Check shield
    const hasShield = s.activePowerups.some((p) => p.type === 'shield');
    if (hasShield) {
      s.activePowerups = s.activePowerups.filter((p) => p.type !== 'shield');
      sound.playCrash();
      // Shield break sparks
      for (let i = 0; i < 24; i++) {
        const angle = (Math.PI * 2 * i) / 24;
        s.particles.push({
          x: impactX,
          y: impactY,
          vx: Math.cos(angle) * (4 + Math.random() * 4),
          vy: Math.sin(angle) * (4 + Math.random() * 4),
          size: 4 + Math.random() * 4,
          color: '#38bdf8',
          alpha: 1,
          life: 0,
          maxLife: 35,
          type: 'spark',
        });
      }
      return;
    }

    if (s.invincibleTimer > 0) return;

    sound.playCrash();
    s.shakeIntensity = Math.min(s.shakeIntensity + 18, 30);
    s.playerSpeed = Math.max(s.playerSpeed * 0.45, 30);
    s.invincibleTimer = 1.2; // 1.2s invulnerability

    // Muscle car passive perk: takes 35% less collision damage
    const actualDamage = playerCar.type === 'muscle' ? damage * 0.65 : damage;
    s.playerHealth = Math.max(0, s.playerHealth - actualDamage);
    s.stats.combo = 1;

    // Metal sparks and debris explosion
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 7;
      s.particles.push({
        x: impactX,
        y: impactY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 4,
        color: Math.random() > 0.5 ? '#f59e0b' : '#ef4444',
        alpha: 1,
        life: 0,
        maxLife: 40 + Math.random() * 20,
        type: 'debris',
      });
    }

    if (s.playerHealth <= 0) {
      sound.stopEngine();
      sound.stopNitro();
      sound.stopSiren();
      s.running = false;
      onGameOver(s.stats);
    }
  }, [playerCar, onGameOver]);

  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Handle responsive sizing
    const handleResize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Horn action
    let hornTriggered = false;

    // Loop
    const loop = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(loop);
      if (isPaused) {
        stateRef.current.lastTime = currentTime;
        return;
      }

      const s = stateRef.current;
      if (!s.running) return;

      if (!s.lastTime) s.lastTime = currentTime;
      const dt = Math.min((currentTime - s.lastTime) / 1000, 0.1);
      s.lastTime = currentTime;

      const theme = TRACK_THEMES[trackEnv];
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      // Handle Horn
      if (controls.horn && !hornTriggered) {
        sound.playHorn();
        hornTriggered = true;
        // Honking startles nearby traffic into moving aside
        s.traffic.forEach((t) => {
          if (Math.abs(t.y - s.playerWorldY) < 400) {
            if (t.lane > 0 && Math.random() > 0.5) {
              t.targetLane = t.lane - 1;
              t.turnSignal = 'left';
            } else if (t.lane < 3) {
              t.targetLane = t.lane + 1;
              t.turnSignal = 'right';
            }
          }
        });
      } else if (!controls.horn) {
        hornTriggered = false;
      }

      // --- 1. PLAYER PHYSICS ---
      const isNitroActive = controls.nitro && s.nitroAmount > 0 && controls.accelerate && s.playerSpeed > 40;
      if (isNitroActive) {
        sound.startNitro();
        s.nitroAmount = Math.max(0, s.nitroAmount - 24 * dt);
      } else {
        sound.stopNitro();
        // Slow natural recharge
        s.nitroAmount = Math.min(100, s.nitroAmount + 4 * dt);
      }

      // Acceleration / Braking
      const currentMaxSpeed = isNitroActive ? s.playerMaxSpeed * 1.25 : s.playerMaxSpeed;
      if (controls.accelerate) {
        const accelRate = 45 * s.playerAccel * (isNitroActive ? 1.8 : 1.0);
        s.playerSpeed = Math.min(currentMaxSpeed, s.playerSpeed + accelRate * dt);
      } else if (controls.brake) {
        s.playerSpeed = Math.max(0, s.playerSpeed - 120 * dt);
      } else {
        // Natural drag
        s.playerSpeed = Math.max(0, s.playerSpeed - 20 * dt);
      }

      // Steering
      const steerSpeed = (s.playerSpeed > 20 ? 1.3 : s.playerSpeed / 20 * 1.3) * s.playerHandling;
      let targetSteerAngle = 0;
      let isSkidding = false;

      if (controls.steerLeft) {
        s.playerX = Math.max(-1.15, s.playerX - steerSpeed * dt);
        targetSteerAngle = -0.22;
        if (s.playerSpeed > 140) isSkidding = true;
      } else if (controls.steerRight) {
        s.playerX = Math.min(1.15, s.playerX + steerSpeed * dt);
        targetSteerAngle = 0.22;
        if (s.playerSpeed > 140) isSkidding = true;
      }

      // Off-road penalty (hit grass/barrier)
      if (Math.abs(s.playerX) > 0.98) {
        s.playerSpeed = Math.max(40, s.playerSpeed - 110 * dt);
        s.shakeIntensity = Math.min(s.shakeIntensity + 3, 10);
        // Off-road dust particles
        const carScreenX = width / 2 + s.playerX * (width * 0.38);
        const carScreenY = height * 0.78;
        s.particles.push({
          x: carScreenX + (Math.random() - 0.5) * 30,
          y: carScreenY + 20,
          vx: (Math.random() - 0.5) * 2,
          vy: 2 + Math.random() * 3,
          size: 4 + Math.random() * 6,
          color: trackEnv === 'sunset_desert' ? '#d97706' : '#22c55e',
          alpha: 0.7,
          life: 0,
          maxLife: 25,
          type: 'smoke',
        });
      }

      // Skid audio
      if (isSkidding && controls.brake) {
        sound.startSkid();
      }

      // Smooth chassis roll angle
      s.steerAngle += (targetSteerAngle - s.steerAngle) * 0.2;

      // Update engine audio
      const speedRatio = s.playerSpeed / s.playerMaxSpeed;
      sound.updateEngine(speedRatio, controls.accelerate, isNitroActive);

      // Advance world
      const worldMetersTraveled = (s.playerSpeed * 1000 / 3600) * dt;
      s.playerWorldY += worldMetersTraveled;
      s.roadOffset = (s.roadOffset + worldMetersTraveled * 10) % 100;

      // Stats
      s.stats.distanceKm += worldMetersTraveled / 1000;
      s.stats.maxSpeed = Math.max(s.stats.maxSpeed, Math.round(s.playerSpeed));
      s.stats.score += Math.round(s.playerSpeed * 0.15 * dt * s.stats.combo);

      // Mode timers
      if (gameMode === 'time_trial') {
        s.stats.timeRemaining -= dt;
        if (s.stats.timeRemaining <= 0) {
          s.running = false;
          sound.stopEngine();
          sound.stopNitro();
          onGameOver(s.stats);
          return;
        }
      }

      // Police chase sirens
      if (gameMode === 'police_chase') {
        const policeNear = s.traffic.some((t) => t.type === 'police' && Math.abs(t.y - s.playerWorldY) < 600);
        if (policeNear) {
          sound.startSiren();
        } else {
          sound.stopSiren();
        }
      }

      // Combo timer decay
      if (s.stats.comboTimer > 0) {
        s.stats.comboTimer -= dt;
        if (s.stats.comboTimer <= 0) {
          s.stats.combo = 1;
        }
      }

      // Invulnerability decay
      if (s.invincibleTimer > 0) {
        s.invincibleTimer -= dt;
      }

      // Powerup durations
      s.activePowerups.forEach((p) => {
        p.duration -= dt * 1000;
      });
      s.activePowerups = s.activePowerups.filter((p) => p.duration > 0);

      // Road Curve Dynamics
      s.curveTimer -= dt;
      if (s.curveTimer <= 0) {
        s.targetCurve = (Math.random() - 0.5) * 0.9;
        s.curveTimer = 4 + Math.random() * 5;
      }
      s.roadCurve += (s.targetCurve - s.roadCurve) * 0.04;

      // Camera Shake decay
      s.shakeIntensity = Math.max(0, s.shakeIntensity - 35 * dt);

      // --- 2. TRAFFIC SPAWN & BEHAVIOR ---
      if (s.playerWorldY + 1200 > s.nextTrafficDistance) {
        const lane = Math.floor(Math.random() * 4); // 4 lanes (0, 1, 2, 3)
        const laneBaseSpeeds = [90, 120, 140, 160];
        const isPolice = gameMode === 'police_chase' && Math.random() < 0.35;
        const vehicleTypes: TrafficVehicle['type'][] = isPolice
          ? ['police']
          : ['sedan', 'sports', 'truck', 'taxi', 'bus'];
        const chosenType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];

        let chosenColor = '#3b82f6';
        let widthUnits = 0.32;
        let lengthUnits = 70;

        if (chosenType === 'police') {
          chosenColor = '#0f172a';
          widthUnits = 0.32;
          lengthUnits = 68;
        } else if (chosenType === 'truck') {
          chosenColor = '#e2e8f0';
          widthUnits = 0.36;
          lengthUnits = 120;
        } else if (chosenType === 'taxi') {
          chosenColor = '#eab308';
          widthUnits = 0.31;
          lengthUnits = 65;
        } else if (chosenType === 'sports') {
          chosenColor = '#ec4899';
          widthUnits = 0.33;
          lengthUnits = 65;
        } else if (chosenType === 'bus') {
          chosenColor = '#059669';
          widthUnits = 0.37;
          lengthUnits = 135;
        }

        const laneX = -0.75 + lane * 0.5; // -0.75, -0.25, 0.25, 0.75

        s.traffic.push({
          id: s.trafficIdCounter++,
          lane,
          targetLane: lane,
          x: laneX,
          y: s.playerWorldY + 1400 + Math.random() * 200,
          speed: laneBaseSpeeds[lane] + (Math.random() - 0.5) * 20,
          baseSpeed: laneBaseSpeeds[lane],
          type: chosenType,
          color: chosenColor,
          width: widthUnits,
          length: lengthUnits,
          changeLaneTimer: 3 + Math.random() * 6,
          turnSignal: 'none',
          health: 50,
          markedNearMiss: false,
        });

        s.nextTrafficDistance = s.playerWorldY + 220 + Math.random() * 200;
      }

      // Update Traffic positions and AI
      s.traffic.forEach((tv) => {
        // AI speed motion
        const tvSpeedMs = (tv.speed * 1000 / 3600);
        tv.y += tvSpeedMs * dt;

        // Lane change logic
        tv.changeLaneTimer -= dt;
        if (tv.changeLaneTimer <= 0 && tv.type !== 'truck' && tv.type !== 'bus') {
          tv.changeLaneTimer = 4 + Math.random() * 7;
          const shift = Math.random() > 0.5 ? 1 : -1;
          const newLane = Math.max(0, Math.min(3, tv.lane + shift));
          if (newLane !== tv.lane) {
            tv.targetLane = newLane;
            tv.turnSignal = shift > 0 ? 'right' : 'left';
          }
        }

        // Smooth move towards target lane
        const targetX = -0.75 + tv.targetLane * 0.5;
        if (Math.abs(tv.x - targetX) > 0.02) {
          tv.x += (targetX - tv.x) * 2.5 * dt;
        } else {
          tv.x = targetX;
          tv.lane = tv.targetLane;
          tv.turnSignal = 'none';
        }

        // Police pursuit AI
        if (tv.type === 'police' && tv.y > s.playerWorldY - 200) {
          if (tv.y < s.playerWorldY + 600) {
            // Accelerate to catch up
            tv.speed = Math.max(tv.speed, s.playerSpeed * 0.95 + 15);
            // Steer towards player lane
            if (Math.random() < 0.02) {
              const playerLaneEst = Math.floor((s.playerX + 1) / 0.5);
              tv.targetLane = Math.max(0, Math.min(3, playerLaneEst));
            }
          }
        }
      });

      // Remove far away traffic
      s.traffic = s.traffic.filter((tv) => tv.y > s.playerWorldY - 400 && tv.y < s.playerWorldY + 2600);

      // --- 3. COLLECTIBLE ITEMS (Coins, Nitro, Repair, Shield, Magnet) ---
      if (s.playerWorldY + 1200 > s.nextItemDistance) {
        const lane = Math.floor(Math.random() * 4);
        const laneX = -0.75 + lane * 0.5;

        // Pick type
        const rand = Math.random();
        let itemType: CollectibleItem['type'] = 'coin';
        if (rand < 0.55) itemType = 'coin';
        else if (rand < 0.75) itemType = 'nitro';
        else if (rand < 0.88) itemType = 'repair';
        else if (rand < 0.95) itemType = 'magnet';
        else itemType = 'shield';

        s.collectibles.push({
          id: s.itemIdCounter++,
          lane,
          x: laneX,
          y: s.playerWorldY + 1400,
          type: itemType,
          value: itemType === 'coin' ? 20 : 1,
          radius: 18,
          rotation: 0,
        });

        s.nextItemDistance = s.playerWorldY + 300 + Math.random() * 350;
      }

      // Collectibles magnet attraction
      const hasMagnet = s.activePowerups.some((p) => p.type === 'magnet');
      s.collectibles.forEach((item) => {
        item.rotation = (item.rotation + dt * 4) % (Math.PI * 2);
        if (hasMagnet && item.type === 'coin') {
          const dy = item.y - s.playerWorldY;
          if (dy > 0 && dy < 600) {
            item.x += (s.playerX - item.x) * 5 * dt;
            item.y -= 150 * dt;
          }
        }
      });

      // --- 4. COLLISION & NEAR MISS DETECTION ---
      const playerScreenX = width / 2 + s.playerX * (width * 0.38);
      const playerScreenY = height * 0.78;
      const playerCarWidthPx = 48;
      const playerCarLengthPx = 88;

      // Check collision with traffic
      s.traffic.forEach((tv) => {
        const relY = tv.y - s.playerWorldY; // meters difference
        const tvScreenY = playerScreenY - relY * 2.2;
        const tvScreenX = width / 2 + tv.x * (width * 0.38);

        // Near miss check (passed closely at high speed)
        if (
          !tv.markedNearMiss &&
          s.playerSpeed > 130 &&
          Math.abs(relY) < 15 &&
          Math.abs(s.playerX - tv.x) < 0.45 &&
          Math.abs(s.playerX - tv.x) > 0.18
        ) {
          tv.markedNearMiss = true;
          triggerNearMiss(playerScreenX, playerScreenY - 40);
        }

        // Direct collision bounding box check
        const halfWidthP = playerCarWidthPx * 0.42;
        const halfLengthP = playerCarLengthPx * 0.44;
        const halfWidthT = (tv.width * width * 0.38) * 0.42;
        const halfLengthT = tv.length * 0.45;

        if (
          Math.abs(playerScreenX - tvScreenX) < (halfWidthP + halfWidthT) &&
          Math.abs(playerScreenY - tvScreenY) < (halfLengthP + halfLengthT)
        ) {
          const impactDamage = tv.type === 'truck' ? 45 : tv.type === 'police' ? 35 : 25;
          triggerCrash(impactDamage, (playerScreenX + tvScreenX) / 2, (playerScreenY + tvScreenY) / 2);
        }
      });

      // Check item pickups
      s.collectibles.forEach((item) => {
        if (item.collected) return;
        const relY = item.y - s.playerWorldY;
        const itemScreenY = playerScreenY - relY * 2.2;
        const itemScreenX = width / 2 + item.x * (width * 0.38);

        const dist = Math.hypot(playerScreenX - itemScreenX, playerScreenY - itemScreenY);
        if (dist < 38) {
          item.collected = true;
          if (item.type === 'coin') {
            sound.playCoin();
            s.stats.coinsEarned += item.value;
            s.stats.score += item.value * 10 * s.stats.combo;
          } else {
            sound.playPowerup();
            if (item.type === 'nitro') {
              s.nitroAmount = Math.min(100, s.nitroAmount + 40);
            } else if (item.type === 'repair') {
              s.playerHealth = Math.min(s.playerMaxHealth, s.playerHealth + 35);
            } else if (item.type === 'shield') {
              s.activePowerups = s.activePowerups.filter((p) => p.type !== 'shield');
              s.activePowerups.push({ type: 'shield', duration: 10000, maxDuration: 10000 });
            } else if (item.type === 'magnet') {
              s.activePowerups = s.activePowerups.filter((p) => p.type !== 'magnet');
              s.activePowerups.push({ type: 'magnet', duration: 12000, maxDuration: 12000 });
            }
          }

          // Sparkle burst
          for (let i = 0; i < 12; i++) {
            const angle = Math.random() * Math.PI * 2;
            s.particles.push({
              x: itemScreenX,
              y: itemScreenY,
              vx: Math.cos(angle) * (2 + Math.random() * 3),
              vy: Math.sin(angle) * (2 + Math.random() * 3),
              size: 3 + Math.random() * 3,
              color: item.type === 'coin' ? '#fbbf24' : item.type === 'nitro' ? '#06b6d4' : '#22c55e',
              alpha: 1,
              life: 0,
              maxLife: 20,
              type: 'spark',
            });
          }
        }
      });
      s.collectibles = s.collectibles.filter((item) => !item.collected && item.y > s.playerWorldY - 300);

      // --- 5. EXHAUST & TIRE SMOKE PARTICLES ---
      if (s.playerSpeed > 30) {
        // Exhaust flames when nitro active
        if (isNitroActive) {
          for (let i = 0; i < 3; i++) {
            s.particles.push({
              x: playerScreenX + (Math.random() - 0.5) * 16,
              y: playerScreenY + 45,
              vx: (Math.random() - 0.5) * 2,
              vy: 6 + Math.random() * 6,
              size: 6 + Math.random() * 6,
              color: Math.random() > 0.4 ? '#38bdf8' : '#f97316',
              alpha: 0.9,
              life: 0,
              maxLife: 15,
              type: 'fire',
            });
          }
        } else {
          // Standard faint exhaust puff
          if (Math.random() < 0.4) {
            s.particles.push({
              x: playerScreenX + (Math.random() - 0.5) * 12,
              y: playerScreenY + 44,
              vx: (Math.random() - 0.5) * 1.5,
              vy: 3 + Math.random() * 3,
              size: 3 + Math.random() * 4,
              color: '#94a3b8',
              alpha: 0.4,
              life: 0,
              maxLife: 18,
              type: 'smoke',
            });
          }
        }

        // Skid marks when hard steering or braking
        if (isSkidding || controls.brake) {
          s.skidMarks.push({
            leftX: playerScreenX - 16,
            leftY: playerScreenY + 35,
            rightX: playerScreenX + 16,
            rightY: playerScreenY + 35,
            alpha: 0.6,
          });
          if (s.skidMarks.length > 80) s.skidMarks.shift();
        }
      }

      // Update particles
      s.particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);
      });
      s.particles = s.particles.filter((p) => p.life < p.maxLife);

      // Fade skid marks
      s.skidMarks.forEach((sm) => {
        sm.alpha = Math.max(0, sm.alpha - 0.25 * dt);
      });
      s.skidMarks = s.skidMarks.filter((sm) => sm.alpha > 0.02);

      // --- 6. RENDER EVERYTHING TO CANVAS ---
      ctx.save();
      ctx.scale(dpr, dpr);

      // Screen shake translation
      if (s.shakeIntensity > 0) {
        const shakeX = (Math.random() - 0.5) * s.shakeIntensity;
        const shakeY = (Math.random() - 0.5) * s.shakeIntensity;
        ctx.translate(shakeX, shakeY);
      }

      // A. Sky & Parallax Horizon
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.4);
      skyGrad.addColorStop(0, theme.skyGradient[0]);
      skyGrad.addColorStop(1, theme.skyGradient[1]);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height * 0.45);

      // Distant mountains / cyber buildings
      ctx.save();
      const horizonY = height * 0.38;
      const curveOffset = s.roadCurve * 45;

      if (theme.sceneryType === 'city') {
        // Cyber skyline with glowing windows
        ctx.fillStyle = '#1e1b4b';
        const numBldgs = 16;
        for (let i = 0; i < numBldgs; i++) {
          const bx = (i * (width / numBldgs) + curveOffset * 0.5) % (width + 80) - 40;
          const bh = 50 + Math.sin(i * 99) * 40;
          const bw = width / numBldgs + 5;
          ctx.fillRect(bx, horizonY - bh, bw, bh);

          // Glowing neon outline
          ctx.strokeStyle = i % 2 === 0 ? '#06b6d4' : '#ec4899';
          ctx.lineWidth = 1;
          ctx.strokeRect(bx, horizonY - bh, bw, bh);
        }
      } else if (theme.sceneryType === 'desert') {
        // Canyon silhouettes
        ctx.fillStyle = '#7c2d12';
        ctx.beginPath();
        ctx.moveTo(0, horizonY);
        for (let x = 0; x <= width; x += 40) {
          const mY = horizonY - 45 - Math.sin((x + curveOffset) * 0.015) * 35;
          ctx.lineTo(x, mY);
        }
        ctx.lineTo(width, horizonY);
        ctx.closePath();
        ctx.fill();
      } else {
        // Ocean & mountains
        ctx.fillStyle = '#0369a1';
        ctx.fillRect(0, horizonY - 20, width, 25); // ocean band
        ctx.fillStyle = '#1e3a8a';
        ctx.beginPath();
        ctx.moveTo(0, horizonY - 15);
        for (let x = 0; x <= width; x += 60) {
          const mY = horizonY - 40 - Math.sin((x + curveOffset) * 0.01) * 30;
          ctx.lineTo(x, mY);
        }
        ctx.lineTo(width, horizonY - 15);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // B. Road & Perspective Surface
      const roadTopY = height * 0.38;
      const roadBottomY = height;
      const roadTopWidth = width * 0.25;
      const roadBottomWidth = width * 0.88;
      const roadCenterTopX = width / 2 + s.roadCurve * 120;
      const roadCenterBottomX = width / 2;

      // Grass / Roadside Terrain
      ctx.fillStyle = trackEnv === 'sunset_desert' ? '#78350f' : trackEnv === 'cyber_neon' ? '#09090b' : '#15803d';
      ctx.fillRect(0, roadTopY, width, height - roadTopY);

      // Road Asphalt Polygon
      ctx.fillStyle = theme.roadColor;
      ctx.beginPath();
      ctx.moveTo(roadCenterTopX - roadTopWidth / 2, roadTopY);
      ctx.lineTo(roadCenterTopX + roadTopWidth / 2, roadTopY);
      ctx.lineTo(roadCenterBottomX + roadBottomWidth / 2, roadBottomY);
      ctx.lineTo(roadCenterBottomX - roadBottomWidth / 2, roadBottomY);
      ctx.closePath();
      ctx.fill();

      // Road Curbs / Rumble Strips (Red & White alternating)
      const curbSegments = 24;
      for (let i = 0; i < curbSegments; i++) {
        const segT1 = i / curbSegments;
        const segT2 = (i + 1) / curbSegments;

        const y1 = roadTopY + (roadBottomY - roadTopY) * segT1;
        const y2 = roadTopY + (roadBottomY - roadTopY) * segT2;

        const cX1 = roadCenterTopX + (roadCenterBottomX - roadCenterTopX) * segT1;
        const cX2 = roadCenterTopX + (roadCenterBottomX - roadCenterTopX) * segT2;
        const rw1 = roadTopWidth + (roadBottomWidth - roadTopWidth) * segT1;
        const rw2 = roadTopWidth + (roadBottomWidth - roadTopWidth) * segT2;

        const isAlt = Math.floor((i + s.roadOffset * 0.2) % 2) === 0;
        ctx.fillStyle = isAlt ? theme.curbColorA : theme.curbColorB;

        // Left curb
        ctx.beginPath();
        ctx.moveTo(cX1 - rw1 / 2 - (10 * segT1), y1);
        ctx.lineTo(cX1 - rw1 / 2, y1);
        ctx.lineTo(cX2 - rw2 / 2, y2);
        ctx.lineTo(cX2 - rw2 / 2 - (10 * segT2), y2);
        ctx.closePath();
        ctx.fill();

        // Right curb
        ctx.beginPath();
        ctx.moveTo(cX1 + rw1 / 2, y1);
        ctx.lineTo(cX1 + rw1 / 2 + (10 * segT1), y1);
        ctx.lineTo(cX2 + rw2 / 2 + (10 * segT2), y2);
        ctx.lineTo(cX2 + rw2 / 2, y2);
        ctx.closePath();
        ctx.fill();
      }

      // 4 Lanes - 3 Dashed Lane Lines
      ctx.strokeStyle = theme.laneColor;
      for (let laneIdx = 1; laneIdx <= 3; laneIdx++) {
        const laneRatio = (laneIdx / 4) - 0.5; // -0.25, 0, 0.25
        ctx.lineWidth = 3;
        ctx.setLineDash([18, 14]);
        ctx.lineDashOffset = -s.roadOffset * 1.5;

        ctx.beginPath();
        ctx.moveTo(roadCenterTopX + roadTopWidth * laneRatio, roadTopY);
        ctx.lineTo(roadCenterBottomX + roadBottomWidth * laneRatio, roadBottomY);
        ctx.stroke();
      }
      ctx.setLineDash([]); // reset dash

      // C. Skid Marks on Road
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.45)';
      ctx.lineWidth = 4;
      s.skidMarks.forEach((sm) => {
        ctx.strokeStyle = `rgba(15, 23, 42, ${sm.alpha})`;
        ctx.beginPath();
        ctx.moveTo(sm.leftX, sm.leftY);
        ctx.lineTo(sm.leftX, sm.leftY + 10);
        ctx.moveTo(sm.rightX, sm.rightY);
        ctx.lineTo(sm.rightX, sm.rightY + 10);
        ctx.stroke();
      });

      // D. Draw Collectibles
      s.collectibles.forEach((item) => {
        const relY = item.y - s.playerWorldY;
        const itemY = playerScreenY - relY * 2.2;
        if (itemY < roadTopY - 20 || itemY > height + 40) return;

        const itemX = width / 2 + item.x * (width * 0.38);

        ctx.save();
        ctx.translate(itemX, itemY);

        if (item.type === 'coin') {
          // 3D Spinning Gold Coin
          const scaleX = Math.cos(item.rotation);
          ctx.scale(scaleX, 1);
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(0, 0, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 3;
          ctx.stroke();
          // Inner dollar sign / star
          ctx.fillStyle = '#78350f';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('★', 0, 1);
        } else if (item.type === 'nitro') {
          // Blue NOS bottle
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(-8, -12, 16, 24);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(-5, -9, 10, 18);
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(-4, -16, 8, 4); // bottle cap
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('NOS', 0, 3);
        } else if (item.type === 'repair') {
          // Green wrench/medkit
          ctx.fillStyle = '#16a34a';
          ctx.beginPath();
          ctx.arc(0, 0, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-2, -8, 4, 16);
          ctx.fillRect(-8, -2, 16, 4);
        } else if (item.type === 'shield') {
          // Shield badge
          ctx.fillStyle = '#3b82f6';
          ctx.beginPath();
          ctx.arc(0, 0, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#93c5fd';
          ctx.lineWidth = 2.5;
          ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🛡️', 0, 0);
        } else if (item.type === 'magnet') {
          // Magnet badge
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.arc(0, 0, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🧲', 0, 0);
        }

        ctx.restore();
      });

      // E. Draw Traffic Cars
      s.traffic.forEach((tv) => {
        const relY = tv.y - s.playerWorldY;
        const tvY = playerScreenY - relY * 2.2;
        if (tvY < roadTopY - 60 || tvY > height + 80) return;

        const tvX = width / 2 + tv.x * (width * 0.38);
        const tvW = 44;
        const tvH = tv.length;

        ctx.save();
        ctx.translate(tvX, tvY);

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 4, tvW * 0.6, tvH * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();

        // Car Body
        ctx.fillStyle = tv.color;
        ctx.beginPath();
        ctx.roundRect(-tvW / 2, -tvH / 2, tvW, tvH, 8);
        ctx.fill();

        // Windshield and roof
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(-tvW * 0.36, -tvH * 0.25, tvW * 0.72, tvH * 0.45, 4);
        ctx.fill();

        // Rear window
        ctx.fillStyle = '#334155';
        ctx.fillRect(-tvW * 0.3, tvH * 0.12, tvW * 0.6, 6);

        // Taillights (glow red)
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-tvW * 0.45, tvH * 0.42, 8, 4);
        ctx.fillRect(tvW * 0.45 - 8, tvH * 0.42, 8, 4);

        // Police strobe lights
        if (tv.type === 'police') {
          const isRedFlash = Math.floor(currentTime * 0.01) % 2 === 0;
          ctx.fillStyle = isRedFlash ? '#ef4444' : '#3b82f6';
          ctx.fillRect(-12, -4, 10, 8);
          ctx.fillStyle = isRedFlash ? '#3b82f6' : '#ef4444';
          ctx.fillRect(2, -4, 10, 8);
        }

        // Turn signals
        if (tv.turnSignal !== 'none') {
          const isBlinking = Math.floor(currentTime * 0.006) % 2 === 0;
          if (isBlinking) {
            ctx.fillStyle = '#f59e0b';
            if (tv.turnSignal === 'left') {
              ctx.fillRect(-tvW * 0.48, tvH * 0.4, 5, 5);
            } else {
              ctx.fillRect(tvW * 0.48 - 5, tvH * 0.4, 5, 5);
            }
          }
        }

        ctx.restore();
      });

      // F. Draw Player Car
      ctx.save();
      ctx.translate(playerScreenX, playerScreenY);
      ctx.rotate(s.steerAngle);

      // Flashing if invincible
      if (s.invincibleTimer > 0 && Math.floor(currentTime * 0.02) % 2 === 0) {
        ctx.globalAlpha = 0.5;
      }

      // Headlight Cones casting forward onto road
      const headLightGrad = ctx.createLinearGradient(0, -playerCarLengthPx * 0.5, 0, -220);
      headLightGrad.addColorStop(0, 'rgba(254, 240, 138, 0.4)');
      headLightGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = headLightGrad;
      ctx.beginPath();
      ctx.moveTo(-18, -playerCarLengthPx * 0.4);
      ctx.lineTo(-75, -220);
      ctx.lineTo(75, -220);
      ctx.lineTo(18, -playerCarLengthPx * 0.4);
      ctx.closePath();
      ctx.fill();

      // Car Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(0, 6, playerCarWidthPx * 0.65, playerCarLengthPx * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wheels
      ctx.fillStyle = '#09090b';
      // Front left & right wheels (turn with steering)
      ctx.save();
      ctx.translate(-playerCarWidthPx * 0.48, -playerCarLengthPx * 0.3);
      ctx.rotate(s.steerAngle * 1.5);
      ctx.fillRect(-4, -10, 8, 20);
      ctx.restore();

      ctx.save();
      ctx.translate(playerCarWidthPx * 0.48, -playerCarLengthPx * 0.3);
      ctx.rotate(s.steerAngle * 1.5);
      ctx.fillRect(-4, -10, 8, 20);
      ctx.restore();

      // Rear wheels
      ctx.fillRect(-playerCarWidthPx * 0.48 - 4, playerCarLengthPx * 0.22, 8, 20);
      ctx.fillRect(playerCarWidthPx * 0.48 - 4, playerCarLengthPx * 0.22, 8, 20);

      // Procedural Car Chassis based on Car Type
      if (playerCar.type === 'formula') {
        // F1 Racer: Needle nose, front wing, cockpit, rear wing
        ctx.fillStyle = playerCar.color;
        // Front wing
        ctx.fillRect(-playerCarWidthPx * 0.5, -playerCarLengthPx * 0.48, playerCarWidthPx, 8);
        // Main slender body
        ctx.beginPath();
        ctx.moveTo(0, -playerCarLengthPx * 0.5);
        ctx.lineTo(12, -playerCarLengthPx * 0.1);
        ctx.lineTo(16, playerCarLengthPx * 0.4);
        ctx.lineTo(-16, playerCarLengthPx * 0.4);
        ctx.lineTo(-12, -playerCarLengthPx * 0.1);
        ctx.closePath();
        ctx.fill();

        // Cockpit & driver helmet
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.ellipse(0, -playerCarLengthPx * 0.05, 7, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, -playerCarLengthPx * 0.05, 5, 0, Math.PI * 2);
        ctx.fill();

        // Rear Wing
        ctx.fillStyle = playerCar.secondaryColor;
        ctx.fillRect(-playerCarWidthPx * 0.52, playerCarLengthPx * 0.38, playerCarWidthPx * 1.04, 10);
      } else if (playerCar.type === 'muscle') {
        // Heavy Wide Muscle car with racing stripes
        ctx.fillStyle = playerCar.color;
        ctx.beginPath();
        ctx.roundRect(-playerCarWidthPx * 0.5, -playerCarLengthPx * 0.48, playerCarWidthPx, playerCarLengthPx, 10);
        ctx.fill();

        // Dual Racing Stripes
        ctx.fillStyle = playerCar.secondaryColor;
        ctx.fillRect(-6, -playerCarLengthPx * 0.48, 4, playerCarLengthPx);
        ctx.fillRect(2, -playerCarLengthPx * 0.48, 4, playerCarLengthPx);

        // Supercharger scoop on hood
        ctx.fillStyle = '#475569';
        ctx.fillRect(-7, -playerCarLengthPx * 0.32, 14, 10);

        // Windshield and roof
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(-playerCarWidthPx * 0.38, -playerCarLengthPx * 0.18, playerCarWidthPx * 0.76, playerCarLengthPx * 0.45, 4);
        ctx.fill();
      } else if (playerCar.type === 'cyber') {
        // Cyber racer: angular stealth with glowing lines
        ctx.fillStyle = playerCar.color;
        ctx.beginPath();
        ctx.moveTo(0, -playerCarLengthPx * 0.5);
        ctx.lineTo(playerCarWidthPx * 0.5, -playerCarLengthPx * 0.2);
        ctx.lineTo(playerCarWidthPx * 0.45, playerCarLengthPx * 0.45);
        ctx.lineTo(-playerCarWidthPx * 0.45, playerCarLengthPx * 0.45);
        ctx.lineTo(-playerCarWidthPx * 0.5, -playerCarLengthPx * 0.2);
        ctx.closePath();
        ctx.fill();

        // Glowing neon accents
        ctx.strokeStyle = playerCar.secondaryColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, -playerCarLengthPx * 0.45);
        ctx.lineTo(playerCarWidthPx * 0.35, -playerCarLengthPx * 0.15);
        ctx.lineTo(playerCarWidthPx * 0.35, playerCarLengthPx * 0.4);
        ctx.moveTo(0, -playerCarLengthPx * 0.45);
        ctx.lineTo(-playerCarWidthPx * 0.35, -playerCarLengthPx * 0.15);
        ctx.lineTo(-playerCarWidthPx * 0.35, playerCarLengthPx * 0.4);
        ctx.stroke();

        // Dark glass canopy
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 22, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Sports & Hypercar: sleek aerodynamic curves
        ctx.fillStyle = playerCar.color;
        ctx.beginPath();
        ctx.roundRect(-playerCarWidthPx * 0.46, -playerCarLengthPx * 0.48, playerCarWidthPx * 0.92, playerCarLengthPx, 12);
        ctx.fill();

        // Accent roof / stripe
        ctx.fillStyle = playerCar.secondaryColor;
        ctx.beginPath();
        ctx.roundRect(-playerCarWidthPx * 0.35, -playerCarLengthPx * 0.22, playerCarWidthPx * 0.7, playerCarLengthPx * 0.5, 6);
        ctx.fill();

        // Dark tinted cockpit
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(-playerCarWidthPx * 0.3, -playerCarLengthPx * 0.18, playerCarWidthPx * 0.6, playerCarLengthPx * 0.42, 5);
        ctx.fill();

        // Rear aero spoiler
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-playerCarWidthPx * 0.48, playerCarLengthPx * 0.42, playerCarWidthPx * 0.96, 6);
      }

      // Taillights (glow brighter when braking)
      const isBraking = controls.brake;
      ctx.fillStyle = isBraking ? '#ff0000' : '#dc2626';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = isBraking ? 15 : 6;
      ctx.fillRect(-playerCarWidthPx * 0.38, playerCarLengthPx * 0.45, 10, 4);
      ctx.fillRect(playerCarWidthPx * 0.38 - 10, playerCarLengthPx * 0.45, 10, 4);
      ctx.shadowBlur = 0; // reset shadow

      // Active Shield Bubble Visual
      const hasActiveShield = s.activePowerups.some((p) => p.type === 'shield');
      if (hasActiveShield) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, playerCarLengthPx * 0.65, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Active Magnet Aura Visual
      const hasActiveMagnet = s.activePowerups.some((p) => p.type === 'magnet');
      if (hasActiveMagnet) {
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.arc(0, 0, playerCarLengthPx * 0.75 + Math.sin(currentTime * 0.008) * 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.restore();

      // G. Speed Lines Effect when driving over 200 km/h
      if (s.playerSpeed > 190) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 2;
        const numLines = Math.floor((s.playerSpeed - 180) * 0.2);
        for (let i = 0; i < numLines; i++) {
          const side = Math.random() > 0.5 ? 1 : -1;
          const lineX = width / 2 + side * (width * 0.3 + Math.random() * width * 0.2);
          const lineY = height * 0.4 + Math.random() * height * 0.55;
          const lineLen = 20 + Math.random() * 60;
          ctx.beginPath();
          ctx.moveTo(lineX, lineY);
          ctx.lineTo(lineX, lineY + lineLen);
          ctx.stroke();
        }
      }

      // H. Draw Particles (Fire, Smoke, Sparks, Text Popups)
      s.particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        if (p.type === 'text' && p.text) {
          ctx.fillStyle = p.color;
          ctx.font = 'bold 20px sans-serif';
          ctx.textAlign = 'center';
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 8;
          ctx.fillText(p.text, p.x, p.y);
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      ctx.restore(); // restore dpr scale & translation

      // --- 7. HUD CALLBACK DISPATCH ---
      onUpdateHUD({
        speed: Math.round(s.playerSpeed),
        rpm: Math.round(1500 + (s.playerSpeed / s.playerMaxSpeed) * 7500),
        nitroPercent: Math.round(s.nitroAmount),
        healthPercent: Math.round((s.playerHealth / s.playerMaxHealth) * 100),
        score: s.stats.score,
        distanceKm: Number(s.stats.distanceKm.toFixed(2)),
        coins: s.stats.coinsEarned,
        combo: s.stats.combo,
        timeRemaining: Math.max(0, Math.ceil(s.stats.timeRemaining)),
        heatLevel: s.stats.heatLevel,
        activePowerups: [...s.activePowerups],
      });
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [
    isPaused,
    gameMode,
    trackEnv,
    controls,
    playerCar,
    triggerCrash,
    triggerNearMiss,
    onGameOver,
    onUpdateHUD,
  ]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden select-none bg-black">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};

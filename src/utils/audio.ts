/**
 * Web Audio API procedural sound synthesizer for Turbo Circuit Racing.
 * Zero external asset dependencies - generates all sounds dynamically!
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;

  // Engine sound nodes
  private engineOsc1: OscillatorNode | null = null;
  private engineOsc2: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private isEngineRunning = false;

  // Nitro sound nodes
  private nitroNoiseNode: AudioBufferSourceNode | null = null;
  private nitroGain: GainNode | null = null;
  private isNitroPlaying = false;

  // Skid sound nodes
  private skidGain: GainNode | null = null;
  private isSkidPlaying = false;

  // Siren sound nodes
  private sirenOsc: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private isSirenPlaying = false;

  // Music loop state
  private musicInterval: number | null = null;
  private isMusicPlaying = false;
  private musicStep = 0;

  // Settings
  public sfxEnabled = true;
  public musicEnabled = true;
  public masterVolume = 0.8;

  constructor() {
    // AudioContext will be initialized on first user interaction to comply with browser autoplay policies
  }

  private initContext() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.masterVolume;
    this.masterGain.connect(this.ctx.destination);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = this.sfxEnabled ? 1 : 0;
    this.sfxGain.connect(this.masterGain);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = this.musicEnabled ? 0.35 : 0;
    this.musicGain.connect(this.masterGain);
  }

  public enableAudio() {
    this.initContext();
  }

  public setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
    if (this.sfxGain) {
      this.sfxGain.gain.value = enabled ? 1 : 0;
    }
    if (!enabled) {
      this.stopEngine();
      this.stopNitro();
      this.stopSkid();
      this.stopSiren();
    }
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (this.musicGain) {
      this.musicGain.gain.value = enabled ? 0.35 : 0;
    }
    if (enabled && !this.isMusicPlaying) {
      this.startMusic();
    } else if (!enabled && this.isMusicPlaying) {
      this.stopMusic();
    }
  }

  // --- ENGINE SYNTHESIZER ---
  public startEngine() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isEngineRunning) return;

    try {
      this.engineOsc1 = this.ctx.createOscillator();
      this.engineOsc2 = this.ctx.createOscillator();
      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineGain = this.ctx.createGain();

      this.engineOsc1.type = 'sawtooth';
      this.engineOsc2.type = 'triangle';

      this.engineOsc1.frequency.setValueAtTime(45, this.ctx.currentTime);
      this.engineOsc2.frequency.setValueAtTime(90, this.ctx.currentTime);

      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(320, this.ctx.currentTime);
      this.engineFilter.Q.setValueAtTime(3, this.ctx.currentTime);

      this.engineGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

      this.engineOsc1.connect(this.engineFilter);
      this.engineOsc2.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.sfxGain);

      this.engineOsc1.start();
      this.engineOsc2.start();
      this.isEngineRunning = true;
    } catch {
      // Audio context might need user interaction
    }
  }

  public updateEngine(speedRatio: number, isAccelerating: boolean, isNitro: boolean) {
    if (!this.isEngineRunning || !this.ctx || !this.engineOsc1 || !this.engineOsc2 || !this.engineFilter || !this.engineGain) {
      return;
    }

    const t = this.ctx.currentTime;
    const baseFreq = 40 + speedRatio * 160 + (isAccelerating ? 25 : 0) + (isNitro ? 60 : 0);
    this.engineOsc1.frequency.setTargetAtTime(baseFreq, t, 0.08);
    this.engineOsc2.frequency.setTargetAtTime(baseFreq * 1.5, t, 0.08);

    const filterCutoff = 250 + speedRatio * 1800 + (isNitro ? 1000 : 0);
    this.engineFilter.frequency.setTargetAtTime(filterCutoff, t, 0.08);

    const targetGain = 0.15 + speedRatio * 0.2 + (isAccelerating ? 0.08 : 0);
    this.engineGain.gain.setTargetAtTime(targetGain, t, 0.08);
  }

  public stopEngine() {
    if (!this.isEngineRunning) return;
    try {
      this.engineOsc1?.stop();
      this.engineOsc2?.stop();
      this.engineOsc1?.disconnect();
      this.engineOsc2?.disconnect();
      this.engineGain?.disconnect();
      this.engineFilter?.disconnect();
    } catch {
      // safe ignore
    }
    this.isEngineRunning = false;
  }

  // --- NITRO BOOST SOUND ---
  public startNitro() {
    if (!this.sfxEnabled || this.isNitroPlaying) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      this.nitroNoiseNode = this.ctx.createBufferSource();
      this.nitroNoiseNode.buffer = buffer;
      this.nitroNoiseNode.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
      filter.Q.setValueAtTime(2, this.ctx.currentTime);

      this.nitroGain = this.ctx.createGain();
      this.nitroGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      this.nitroGain.gain.exponentialRampToValueAtTime(0.35, this.ctx.currentTime + 0.15);

      this.nitroNoiseNode.connect(filter);
      filter.connect(this.nitroGain);
      this.nitroGain.connect(this.sfxGain);

      this.nitroNoiseNode.start();
      this.isNitroPlaying = true;
    } catch {
      // ignore
    }
  }

  public stopNitro() {
    if (!this.isNitroPlaying || !this.nitroGain || !this.ctx) return;
    try {
      this.nitroGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
      setTimeout(() => {
        try {
          this.nitroNoiseNode?.stop();
          this.nitroNoiseNode?.disconnect();
          this.nitroGain?.disconnect();
        } catch {
          // ignore
        }
      }, 120);
    } catch {
      // ignore
    }
    this.isNitroPlaying = false;
  }

  // --- SKID / DRIFT SOUND ---
  public startSkid() {
    if (!this.sfxEnabled || this.isSkidPlaying) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const bufferSize = this.ctx.sampleRate;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2400, this.ctx.currentTime);
      filter.Q.setValueAtTime(6, this.ctx.currentTime);

      this.skidGain = this.ctx.createGain();
      this.skidGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(this.skidGain);
      this.skidGain.connect(this.sfxGain);

      noise.start();
      this.isSkidPlaying = true;

      setTimeout(() => {
        if (this.isSkidPlaying) this.stopSkid();
      }, 400);
    } catch {
      // ignore
    }
  }

  public stopSkid() {
    if (!this.isSkidPlaying || !this.skidGain || !this.ctx) return;
    try {
      this.skidGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
      setTimeout(() => {
        this.skidGain?.disconnect();
      }, 60);
    } catch {
      // ignore
    }
    this.isSkidPlaying = false;
  }

  // --- CRASH / IMPACT SOUND ---
  public playCrash() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const t = this.ctx.currentTime;
      // Low boom oscillator
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.4);

      oscGain.gain.setValueAtTime(0.6, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

      osc.connect(oscGain);
      oscGain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.5);

      // White noise explosion burst
      const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.5, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.15));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(1200, t);
      noiseFilter.frequency.exponentialRampToValueAtTime(200, t + 0.4);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.7, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.sfxGain);

      noise.start(t);
    } catch {
      // ignore
    }
  }

  // --- COIN PICKUP CHIME ---
  public playCoin() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const t = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(987.77, t); // B5
      osc1.frequency.setValueAtTime(1318.51, t + 0.08); // E6

      osc2.frequency.setValueAtTime(1975.53, t + 0.08); // B6

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.sfxGain);

      osc1.start(t);
      osc2.start(t + 0.08);
      osc1.stop(t + 0.35);
      osc2.stop(t + 0.35);
    } catch {
      // ignore
    }
  }

  // --- POWERUP COLLECTED ---
  public playPowerup() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const t = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.05);

        gain.gain.setValueAtTime(0.2, t + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.2);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(t + idx * 0.05);
        osc.stop(t + idx * 0.05 + 0.22);
      });
    } catch {
      // ignore
    }
  }

  // --- NEAR MISS WHOOSH ---
  public playNearMiss() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';

      osc.frequency.setValueAtTime(400, t);
      osc.frequency.exponentialRampToValueAtTime(800, t + 0.08);
      osc.frequency.exponentialRampToValueAtTime(300, t + 0.25);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.25);
    } catch {
      // ignore
    }
  }

  // --- CAR HORN ---
  public playHorn() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const t = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';

      // Classic American car dual tone (F4 + A4)
      osc1.frequency.setValueAtTime(349.23, t);
      osc2.frequency.setValueAtTime(440.0, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.setValueAtTime(0.25, t + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.sfxGain);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.35);
      osc2.stop(t + 0.35);
    } catch {
      // ignore
    }
  }

  // --- POLICE SIREN ---
  public startSiren() {
    if (!this.sfxEnabled || this.isSirenPlaying) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const t = this.ctx.currentTime;
      this.sirenOsc = this.ctx.createOscillator();
      this.sirenGain = this.ctx.createGain();

      this.sirenOsc.type = 'sine';
      this.sirenGain.gain.setValueAtTime(0.15, t);

      // LFO for wailing effect
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(2, t); // 2 Hz wail
      lfoGain.gain.setValueAtTime(250, t); // modulation depth

      lfo.connect(lfoGain);
      lfoGain.connect(this.sirenOsc.frequency);

      this.sirenOsc.frequency.setValueAtTime(750, t);

      this.sirenOsc.connect(this.sirenGain);
      this.sirenGain.connect(this.sfxGain);

      lfo.start(t);
      this.sirenOsc.start(t);
      this.isSirenPlaying = true;
    } catch {
      // ignore
    }
  }

  public stopSiren() {
    if (!this.isSirenPlaying || !this.sirenOsc) return;
    try {
      this.sirenOsc.stop();
      this.sirenOsc.disconnect();
      this.sirenGain?.disconnect();
    } catch {
      // ignore
    }
    this.isSirenPlaying = false;
  }

  // --- RETRO SYNTHWAVE MUSIC SYNTHESIZER ---
  public startMusic() {
    if (this.isMusicPlaying || !this.musicEnabled) return;
    this.initContext();
    if (!this.ctx || !this.musicGain) return;

    this.isMusicPlaying = true;
    this.musicStep = 0;

    // 130 BPM = ~115ms per 16th note
    const stepInterval = 115;

    // Classic synthwave progression in D minor / F / C / G
    const bassline = [
      146.83, 146.83, 146.83, 293.66, 146.83, 146.83, 174.61, 146.83, // D3
      174.61, 174.61, 174.61, 349.23, 174.61, 174.61, 196.00, 174.61, // F3
      130.81, 130.81, 130.81, 261.63, 130.81, 130.81, 146.83, 130.81, // C3
      196.00, 196.00, 196.00, 392.00, 196.00, 196.00, 220.00, 196.00, // G3
    ];

    const leadArp = [
      587.33, 0, 739.99, 880.00, 587.33, 0, 880.00, 1046.50,
      698.46, 0, 880.00, 1046.50, 698.46, 0, 1046.50, 1174.66,
      523.25, 0, 659.25, 783.99, 523.25, 0, 783.99, 1046.50,
      783.99, 0, 987.77, 1174.66, 783.99, 0, 1174.66, 1318.51,
    ];

    this.musicInterval = window.setInterval(() => {
      if (!this.ctx || !this.musicGain || !this.musicEnabled) return;

      const t = this.ctx.currentTime;
      const step = this.musicStep % 32;

      // Bass note
      const bassFreq = bassline[step];
      if (bassFreq) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bassFreq / 2, t);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(350, t);
        filter.frequency.exponentialRampToValueAtTime(100, t + 0.1);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc.start(t);
        osc.stop(t + 0.16);
      }

      // Kick drum on beats 0, 4, 8, 12, 16, 20, 24, 28
      if (step % 4 === 0) {
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.frequency.setValueAtTime(150, t);
        kickOsc.frequency.exponentialRampToValueAtTime(40, t + 0.08);

        kickGain.gain.setValueAtTime(0.3, t);
        kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        kickOsc.connect(kickGain);
        kickGain.connect(this.musicGain);
        kickOsc.start(t);
        kickOsc.stop(t + 0.12);
      }

      // Hi-hat on every offbeat (2, 6, 10, 14...)
      if (step % 2 === 1) {
        const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.03, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 200);
        }
        const hat = this.ctx.createBufferSource();
        hat.buffer = buffer;
        const hatFilter = this.ctx.createBiquadFilter();
        hatFilter.type = 'highpass';
        hatFilter.frequency.setValueAtTime(7000, t);

        const hatGain = this.ctx.createGain();
        hatGain.gain.setValueAtTime(0.06, t);

        hat.connect(hatFilter);
        hatFilter.connect(hatGain);
        hatGain.connect(this.musicGain);
        hat.start(t);
      }

      // Arpeggio Lead
      const leadFreq = leadArp[step];
      if (leadFreq > 0) {
        const leadOsc = this.ctx.createOscillator();
        const leadGain = this.ctx.createGain();
        leadOsc.type = 'triangle';
        leadOsc.frequency.setValueAtTime(leadFreq, t);

        leadGain.gain.setValueAtTime(0.08, t);
        leadGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        leadOsc.connect(leadGain);
        leadGain.connect(this.musicGain);
        leadOsc.start(t);
        leadOsc.stop(t + 0.13);
      }

      this.musicStep++;
    }, stepInterval);
  }

  public stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.isMusicPlaying = false;
  }
}

export const sound = new SoundEngine();

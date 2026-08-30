// Professional Industrial Emergency Siren Synthesizer using Web Audio API
// High-decibel, multi-harmonic wailing siren with zero external dependencies.
// Plays instantly and works 100% offline.

class EmergencyAudioController {
  constructor() {
    this.audioCtx = null;
    this.oscMain = null;
    this.oscSub = null;
    this.gainNode = null;
    this.intervalId = null;
    this.isPlaying = false;
    this.listeners = new Set();
  }

  init() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
  }

  addListener(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify() {
    this.listeners.forEach(fn => {
      try { fn(this.isPlaying); } catch(e) {}
    });
  }

  startAlarm() {
    if (this.isPlaying) return;

    try {
      this.init();
      if (!this.audioCtx) return;

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      this.isPlaying = true;
      this.notify();

      const now = this.audioCtx.currentTime;

      // Master Gain Node
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(0.35, now);
      this.gainNode.connect(this.audioCtx.destination);

      // Primary High Alert Siren Oscillator (Sawtooth for sharp industrial pierce)
      this.oscMain = this.audioCtx.createOscillator();
      this.oscMain.type = 'sawtooth';
      this.oscMain.frequency.setValueAtTime(900, now);

      // Deep Sub-harmonic Oscillator (Square/Triangle blend for structural rumble)
      this.oscSub = this.audioCtx.createOscillator();
      this.oscSub.type = 'triangle';
      this.oscSub.frequency.setValueAtTime(450, now);

      this.oscMain.connect(this.gainNode);
      this.oscSub.connect(this.gainNode);

      this.oscMain.start();
      this.oscSub.start();

      let isSweepHigh = false;

      // High-low alternating siren wail cadence (400ms interval)
      this.intervalId = setInterval(() => {
        if (!this.isPlaying || !this.audioCtx) return;
        
        const t = this.audioCtx.currentTime;
        if (isSweepHigh) {
          // Sweep down
          this.oscMain.frequency.cancelScheduledValues(t);
          this.oscMain.frequency.linearRampToValueAtTime(620, t + 0.35);
          this.oscSub.frequency.cancelScheduledValues(t);
          this.oscSub.frequency.linearRampToValueAtTime(310, t + 0.35);
          this.gainNode.gain.setValueAtTime(0.40, t);
        } else {
          // Sweep up
          this.oscMain.frequency.cancelScheduledValues(t);
          this.oscMain.frequency.linearRampToValueAtTime(980, t + 0.35);
          this.oscSub.frequency.cancelScheduledValues(t);
          this.oscSub.frequency.linearRampToValueAtTime(490, t + 0.35);
          this.gainNode.gain.setValueAtTime(0.45, t);
        }
        isSweepHigh = !isSweepHigh;
      }, 380);

    } catch (e) {
      console.warn('Emergency Audio Playback Notice:', e);
    }
  }

  stopAlarm() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    this.notify();

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    try {
      if (this.oscMain) {
        this.oscMain.stop();
        this.oscMain.disconnect();
        this.oscMain = null;
      }
      if (this.oscSub) {
        this.oscSub.stop();
        this.oscSub.disconnect();
        this.oscSub = null;
      }
      if (this.gainNode) {
        this.gainNode.disconnect();
        this.gainNode = null;
      }
    } catch (e) {
      // Teardown safety
    }
  }
}

export const emergencyAudio = new EmergencyAudioController();

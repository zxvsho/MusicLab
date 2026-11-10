/**
 * Generador de audio musical basado en Web Audio API para previsualización
 * confiable de pistas en entornos académicos y emulación sonora sin dependencias externas.
 */

class MusicLabAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlayingSynth = false;
  private intervalId: any = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public playSynthesizedTrack(songId: number, genreText: string = ''): void {
    this.stop();
    this.init();
    if (!this.ctx || !this.masterGain) return;

    this.isPlayingSynth = true;

    // Escala de notas según género
    let notes: number[] = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25]; // Do Mayor pentatónica
    let tempoMs = 380;

    if (genreText.toLowerCase().includes('synthwave') || genreText.toLowerCase().includes('electrónica')) {
      notes = [130.81, 164.81, 196.0, 220.0, 261.63, 329.63, 392.0]; // Retro Bass
      tempoMs = 240;
    } else if (genreText.toLowerCase().includes('rock')) {
      notes = [146.83, 174.61, 196.0, 220.0, 261.63, 293.66]; // Re menor
      tempoMs = 300;
    } else if (genreText.toLowerCase().includes('clásica') || genreText.toLowerCase().includes('piano')) {
      notes = [220.0, 261.63, 329.63, 440.0, 523.25, 659.25]; // La menor arpegio
      tempoMs = 450;
    }

    let step = 0;
    this.intervalId = setInterval(() => {
      if (!this.isPlayingSynth || !this.ctx || !this.masterGain) return;

      const freqIndex = (step + songId) % notes.length;
      const freq = notes[freqIndex];

      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = genreText.toLowerCase().includes('synthwave') ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const now = this.ctx.currentTime;
      noteGain.gain.setValueAtTime(0, now);
      noteGain.gain.linearRampToValueAtTime(0.22, now + 0.04);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + (tempoMs / 1000) * 0.9);

      osc.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + tempoMs / 1000);

      // Línea de bajo complementaria cada 2 pasos
      if (step % 2 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(freq / 2, now);
        bassGain.gain.setValueAtTime(0.2, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        bassOsc.connect(bassGain);
        bassGain.connect(this.masterGain);
        bassOsc.start(now);
        bassOsc.stop(now + 0.5);
      }

      step++;
    }, tempoMs);
  }

  public stop(): void {
    this.isPlayingSynth = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public setVolume(vol: number): void {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }
}

export const audioEngine = new MusicLabAudioEngine();

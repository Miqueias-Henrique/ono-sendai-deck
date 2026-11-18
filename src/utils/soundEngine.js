// ============================================================================
// TYRELL / VANGELIS CS-80 & HOSAKA KEYSWITCH WEB AUDIO SYNTHESIZER
// Zero external MP3 files required; pure WebAudio analog synthesis
// ============================================================================

let audioCtx = null;
let ambientNodes = null;

function getCtx() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playKeyclick(enabled = true, pitch = 680) {
  if (!enabled) return;
  try {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(190, now + 0.045);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.048);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  } catch {
    // Ignore audio context restrictions
  }
}

export function playVoightKampffPulse(enabled = true, step = 1) {
  if (!enabled) return;
  try {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const baseFreq = 260 + step * 110;

    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc2.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.45, now + 0.22);
    osc2.frequency.setValueAtTime(baseFreq * 0.5, now);

    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.26);
    osc2.stop(now + 0.26);
  } catch {}
}

export function playVangelisChord(enabled = true, chordNotes = [220, 277.18, 329.63, 440]) {
  if (!enabled) return;
  try {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    chordNotes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime((idx - 1.5) * 7, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);
      filter.frequency.exponentialRampToValueAtTime(1850, now + 0.35);
      filter.frequency.exponentialRampToValueAtTime(420, now + 1.3);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.035, now + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 1.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.4);
    });
  } catch {}
}

export function playRelicGlitch(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freqs = [180, 520, 310];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i === 1 ? 'sawtooth' : 'square';
      osc.frequency.setValueAtTime(f, now + i * 0.025);
      osc.frequency.exponentialRampToValueAtTime(f * 0.65, now + i * 0.025 + 0.04);
      gain.gain.setValueAtTime(0.028, now + i * 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + i * 0.025 + 0.045);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.025);
      osc.stop(now + i * 0.025 + 0.05);
    });
  } catch {}
}

export function playRotationChime(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    [440, 659.25].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.07);
      gain.gain.setValueAtTime(0.045, now + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + i * 0.07 + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.07);
      osc.stop(now + i * 0.07 + 0.2);
    });
  } catch {}
}

export function playConflictBuzz(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    [165, 130].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + i * 0.085);
      gain.gain.setValueAtTime(0.04, now + i * 0.085);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + i * 0.085 + 0.075);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.085);
      osc.stop(now + i * 0.085 + 0.08);
    });
  } catch {}
}

export function playDaemonUpload(enabled = true, tier = 1) {
  if (!enabled) return;
  try {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const base = 330 + tier * 55;
    const notes = [base, base * 1.25, base * 1.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);
      gain.gain.setValueAtTime(0.048, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + i * 0.06 + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.18);
    });
  } catch {}
}

/**
 * Procedural Blade Runner / CS-80 nocturnal ambient drone (pure WebAudio).
 * Gentle lowpass-filtered D-minor fifth drone with slow LFO filter sweep.
 */
export function setAmbientDrone(active) {
  try {
    if (!active) {
      if (ambientNodes) {
        const { ctx, master, oscs, lfo } = ambientNodes;
        const now = ctx.currentTime;
        master.gain.cancelScheduledValues(now);
        master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), now);
        master.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
        setTimeout(() => {
          oscs.forEach((o) => {
            try {
              o.stop();
              o.disconnect();
            } catch {}
          });
          try {
            lfo.stop();
            lfo.disconnect();
            master.disconnect();
          } catch {}
        }, 500);
        ambientNodes = null;
      }
      return;
    }

    if (ambientNodes) return;
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.linearRampToValueAtTime(0.022, now + 1.4);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(360, now);
    filter.Q.setValueAtTime(2.4, now);

    // Slow analog breathing LFO on the filter cutoff
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.09, now);
    lfoGain.gain.setValueAtTime(175, now);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start(now);

    // D2 (73.42), A2 (110), D3 (146.83), F3 (174.61) — iconic CS-80 noir voicing
    const voices = [
      { freq: 73.42, type: 'sine', detune: 0, gainVal: 0.45 },
      { freq: 110.0, type: 'triangle', detune: -6, gainVal: 0.3 },
      { freq: 146.83, type: 'sawtooth', detune: 5, gainVal: 0.16 },
      { freq: 174.61, type: 'sawtooth', detune: -8, gainVal: 0.11 },
    ];

    const oscs = voices.map((v) => {
      const osc = ctx.createOscillator();
      const vGain = ctx.createGain();
      osc.type = v.type;
      osc.frequency.setValueAtTime(v.freq, now);
      osc.detune.setValueAtTime(v.detune, now);
      vGain.gain.setValueAtTime(v.gainVal, now);
      osc.connect(vGain);
      vGain.connect(filter);
      osc.start(now);
      return osc;
    });

    filter.connect(master);
    master.connect(ctx.destination);
    ambientNodes = { ctx, master, oscs, lfo };
  } catch {}
}

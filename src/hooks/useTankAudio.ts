import { useEffect, useRef, useState, useCallback } from 'react';

interface TankAudioOptions {
  isEngaged: boolean;
  throttle: number; // 0.5, 1.0, 2.0
  driveMode: 'LAND' | 'WATER';
}

export function useTankAudio({ isEngaged, throttle, driveMode }: TankAudioOptions) {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);

  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;

  const volumeRef = useRef(volume);
  volumeRef.current = volume;

  const audioCtxRef = useRef<AudioContext | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const mainGainRef = useRef<GainNode | null>(null);
  const masterVolumeRef = useRef<GainNode | null>(null);

  // Initialize Audio Context on demand with stable reference
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) {
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
      return;
    }

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Master volume node
      const masterVolume = ctx.createGain();
      masterVolume.gain.setValueAtTime(isMutedRef.current ? 0 : volumeRef.current, ctx.currentTime);
      masterVolume.connect(ctx.destination);
      masterVolumeRef.current = masterVolume;

      // Main engine gain with 0 volume initially
      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(0, ctx.currentTime);
      mainGain.connect(masterVolume);
      mainGainRef.current = mainGain;

      // Deep Lowpass Filter (140Hz - 360Hz) to produce smooth diesel rumble
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, ctx.currentTime);
      filter.Q.setValueAtTime(3.5, ctx.currentTime);
      filter.connect(mainGain);
      filterRef.current = filter;

      // Primary Engine Oscillator (Triangle wave for rich low-end harmonic rumble)
      const osc1 = ctx.createOscillator();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(45, ctx.currentTime);

      // Secondary Engine Oscillator (Detuned Sine wave for turbine hum)
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(47.5, ctx.currentTime);

      // Low Frequency Oscillator for subtle mechanical cylinder chug/throbbing
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(5.5, ctx.currentTime);

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(12, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      // Connect oscillators through filter
      osc1.connect(filter);
      osc2.connect(filter);

      osc1.start();
      osc2.start();
      lfo.start();

      osc1Ref.current = osc1;
      osc2Ref.current = osc2;
      lfoRef.current = lfo;
      lfoGainRef.current = lfoGain;
    } catch (e) {
      console.warn('AudioContext initialization failed or blocked:', e);
    }
  }, []);

  // Handle propulsion start / stop with smooth 0.4s attack & 0.5s decay fade-out
  useEffect(() => {
    if (isEngaged) {
      initAudio();
    }

    const ctx = audioCtxRef.current;
    const mainGain = mainGainRef.current;
    if (!ctx || !mainGain) return;

    const now = ctx.currentTime;
    mainGain.gain.cancelScheduledValues(now);

    if (isEngaged && !isMuted) {
      // 0.4s smooth attack fade-in
      mainGain.gain.setValueAtTime(mainGain.gain.value, now);
      mainGain.gain.linearRampToValueAtTime(0.55, now + 0.4);
    } else {
      // 0.5s smooth decay fade-out
      mainGain.gain.setValueAtTime(mainGain.gain.value, now);
      mainGain.gain.linearRampToValueAtTime(0, now + 0.5);
    }
  }, [isEngaged, isMuted, initAudio]);

  // Modulate engine pitch and filter cutoff based on throttle and drive mode
  useEffect(() => {
    const ctx = audioCtxRef.current;
    const osc1 = osc1Ref.current;
    const osc2 = osc2Ref.current;
    const filter = filterRef.current;
    const lfo = lfoRef.current;

    if (!ctx || !osc1 || !osc2 || !filter) return;

    const now = ctx.currentTime;
    // Base frequency tuned by throttle
    const baseFreq = driveMode === 'WATER' ? 38 * throttle : 44 * throttle;
    const detuneOffset = driveMode === 'WATER' ? 3.5 : 2.8;
    const targetFilterFreq = Math.min(
      360,
      Math.max(140, 160 + (throttle - 0.5) * 110 + (driveMode === 'WATER' ? -25 : 0))
    );

    osc1.frequency.setTargetAtTime(baseFreq, now, 0.25);
    osc2.frequency.setTargetAtTime(baseFreq + detuneOffset, now, 0.25);
    filter.frequency.setTargetAtTime(targetFilterFreq, now, 0.3);

    if (lfo) {
      lfo.frequency.setTargetAtTime(4.0 * throttle, now, 0.2);
    }
  }, [throttle, driveMode]);

  // Master volume and mute handling
  useEffect(() => {
    const ctx = audioCtxRef.current;
    const masterVolume = masterVolumeRef.current;
    if (!ctx || !masterVolume) return;

    const now = ctx.currentTime;
    masterVolume.gain.cancelScheduledValues(now);
    const targetVal = isMuted ? 0 : volume;
    masterVolume.gain.setTargetAtTime(targetVal, now, 0.08);
  }, [isMuted, volume]);

  // High-tech tactile chirp for button clicks
  const playTacticalClick = useCallback(
    (freq = 1200, duration = 0.04) => {
      try {
        if (isMutedRef.current) return;
        initAudio();
        const ctx = audioCtxRef.current;
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        const now = ctx.currentTime;
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + duration);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
      } catch {
        // ignore audio errors
      }
    },
    [initAudio]
  );

  const toggleMute = useCallback(() => {
    initAudio();
    setIsMuted((prev) => !prev);
  }, [initAudio]);

  return {
    isMuted,
    toggleMute,
    volume,
    setVolume,
    playTacticalClick,
  };
}

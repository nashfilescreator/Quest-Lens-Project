
// Simple synthesizer for UI sounds to avoid external asset dependencies
let sharedAudioCtx: AudioContext | null = null;

export interface AudioSettings {
  sound: boolean;
  haptics: boolean;
}

let activeSettings: AudioSettings = { sound: true, haptics: true };

export const updateAudioSettings = (settings: AudioSettings) => {
  activeSettings = settings;
};

// Runtime synchronization for global state
export const refreshAudioSettings = () => {
    // In a React-based app, the updateAudioSettings call in App.tsx 
    // effectively handles this synchronization via the reactive props stream.
};

export const getSharedContext = () => {
  if (!sharedAudioCtx) {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (Ctx) {
        sharedAudioCtx = new Ctx();
    }
  }
  return sharedAudioCtx;
};

// Helper to safely resume context on user interaction
export const ensureAudioContext = async () => {
    const ctx = getSharedContext();
    if (ctx && ctx.state === 'suspended') {
        await ctx.resume();
    }
    return ctx;
};

export const triggerHaptic = (pattern: number | number[] = 10) => {
  if (!activeSettings.haptics) return;
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch (e) {}
  }
};

export const playSound = (type: 'click' | 'success' | 'error' | 'hero' | 'open') => {
  // Trigger haptics regardless of sound setting
  switch (type) {
    case 'click': case 'open': triggerHaptic(5); break;
    case 'success': triggerHaptic([5, 30, 10]); break;
    case 'error': triggerHaptic([40, 10, 40]); break;
    case 'hero': triggerHaptic([10, 50, 20, 50, 30]); break;
  }

  if (!activeSettings.sound) return;

  try {
    const ctx = getSharedContext();
    if (!ctx) return;
    // Don't await resume here to avoid lag on click, assume ensureAudioContext called elsewhere or browser handles it
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case 'click':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      case 'open':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      case 'success':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); 
        osc.frequency.setValueAtTime(659.25, now + 0.1); 
        osc.frequency.setValueAtTime(783.99, now + 0.2); 
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        break;
      case 'error':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.linearRampToValueAtTime(40, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
       case 'hero':
        osc.type = 'square';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc.start(now);
        osc.stop(now + 1.2);
        break;
    }
  } catch (e) {}
};

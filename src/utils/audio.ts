// Sound effects and speech synthesis utilities with Cambridge UK/US accent support

export type Accent = 'uk' | 'us';

let audioCtx: AudioContext | null = null;
let soundEnabled = true;
let currentAccent: Accent = 'us';

if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('unit2_vocab_accent');
    if (saved === 'uk' || saved === 'us') {
      currentAccent = saved;
    }
  } catch {
    // ignore
  }
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export function getSelectedAccent(): Accent {
  return currentAccent;
}

export function setSelectedAccent(accent: Accent) {
  currentAccent = accent;
  try {
    localStorage.setItem('unit2_vocab_accent', accent);
  } catch {
    // ignore
  }
}

export function playSound(type: 'correct' | 'incorrect' | 'flip' | 'click' | 'complete') {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  try {
    if (type === 'correct') {
      // Pleasant chime: C5 -> G5
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(783.99, now + 0.1);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'incorrect') {
      // Gentle buzz: Low sawtooth
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.setValueAtTime(110, now + 0.12);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } else if (type === 'flip') {
      // Soft card swoosh
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(580, now + 0.08);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'click') {
      // Subtle tap
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'complete') {
      // Fanfare chord: C5 -> E5 -> G5 -> C6
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.1, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.4);
      });
    }
  } catch (err) {
    console.warn('Audio playback error', err);
  }
}

let activeAudioElement: HTMLAudioElement | null = null;

// Audio pronunciation player supporting UK / US and native human MP3 audio
export function playPronunciation(
  text: string,
  accent?: Accent,
  audioUrl?: string
) {
  const chosenAccent = accent || currentAccent;

  // Stop any ongoing speech or audio
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  if (activeAudioElement) {
    activeAudioElement.pause();
    activeAudioElement = null;
  }

  // 1. If direct audio URL is provided, try playing authentic human voice
  if (audioUrl) {
    try {
      const audio = new Audio(audioUrl);
      activeAudioElement = audio;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If network / playback fails, fallback to speech synthesis
          fallbackSpeechSynthesis(text, chosenAccent);
        });
      }
      return;
    } catch {
      // fallback
    }
  }

  // 2. Play with Speech Synthesis (UK vs US accent)
  fallbackSpeechSynthesis(text, chosenAccent);
}

function fallbackSpeechSynthesis(text: string, accent: Accent) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    const utterance = new SpeechSynthesisUtterance(text);
    const targetLang = accent === 'uk' ? 'en-GB' : 'en-US';
    utterance.lang = targetLang;
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      if (accent === 'uk') {
        const ukVoice = voices.find(
          (v) =>
            v.lang.replace('_', '-').toLowerCase().startsWith('en-gb') ||
            v.name.includes('UK') ||
            v.name.includes('British') ||
            v.name.includes('Daniel') ||
            v.name.includes('George')
        );
        if (ukVoice) utterance.voice = ukVoice;
      } else {
        const usVoice = voices.find(
          (v) =>
            v.lang.replace('_', '-').toLowerCase().startsWith('en-us') ||
            v.name.includes('US') ||
            v.name.includes('Samantha') ||
            v.name.includes('Google US') ||
            v.name.includes('Alex')
        );
        if (usVoice) utterance.voice = usVoice;
      }
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error', err);
  }
}

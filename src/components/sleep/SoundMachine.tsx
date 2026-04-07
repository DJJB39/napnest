import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

type SoundId = "white-plain" | "white-rain" | "white-ocean" | "brown-plain" | "brown-deep";

interface SoundDef {
  id: SoundId;
  label: string;
  type: "programmatic" | "file";
  file?: string; // bucket path for file-based
}

const SOUNDS: SoundDef[] = [
  { id: "white-plain", label: "Plain White Noise", type: "programmatic" },
  { id: "white-rain", label: "Rain", type: "file", file: "rain.mp3" },
  { id: "white-ocean", label: "Ocean", type: "file", file: "ocean.mp3" },
  { id: "brown-plain", label: "Plain Brown Noise", type: "programmatic" },
  { id: "brown-deep", label: "Deep Rumble", type: "programmatic" },
];

const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
const FADE_DURATION = 30; // seconds

// Raindrop + Zzz cozy icon
const RaindropZzz = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="shrink-0">
    <path d="M14 4C14 4 8 12 8 16a6 6 0 0012 0c0-4-6-12-6-12z" fill="hsl(var(--primary))" opacity="0.25" />
    <path d="M14 4C14 4 8 12 8 16a6 6 0 0012 0c0-4-6-12-6-12z" stroke="hsl(var(--primary))" strokeWidth="1.5" fill="none" />
    <text x="19" y="8" fontSize="7" fontWeight="bold" fill="hsl(var(--primary))" opacity="0.7">z</text>
    <text x="22" y="5" fontSize="5" fontWeight="bold" fill="hsl(var(--primary))" opacity="0.5">z</text>
  </svg>
);

// Animated equalizer bars
const EqBars = () => (
  <div className="flex items-end gap-[2px] h-4">
    {[0, 0.15, 0.3, 0.1].map((delay, i) => (
      <span
        key={i}
        className="w-[3px] rounded-full bg-primary animate-pulse"
        style={{
          height: `${8 + Math.random() * 8}px`,
          animationDelay: `${delay}s`,
          animationDuration: `${0.6 + i * 0.15}s`,
        }}
      />
    ))}
  </div>
);

export const SoundMachine = () => {
  const [selectedSound, setSelectedSound] = useState<SoundId | "">("");
  const [volume, setVolume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);

  // Programmatic audio refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // File-based audio ref
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  // 3h auto-stop timer
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (fadeRef.current) { clearInterval(fadeRef.current); fadeRef.current = null; }
  }, []);

  const stopAll = useCallback(() => {
    // Stop programmatic
    try { sourceRef.current?.stop(); } catch {}
    sourceRef.current = null;
    try { audioCtxRef.current?.close(); } catch {}
    audioCtxRef.current = null;
    gainRef.current = null;

    // Stop file-based
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current.src = "";
      audioElRef.current = null;
    }

    clearTimers();
    setIsPlaying(false);
  }, [clearTimers]);

  // Fade out then stop
  const startFadeOut = useCallback(() => {
    const steps = FADE_DURATION * 10; // 100ms intervals
    let step = 0;
    const initialVol = volume;

    fadeRef.current = setInterval(() => {
      step++;
      const newVol = Math.max(0, initialVol * (1 - step / steps));
      if (gainRef.current) gainRef.current.gain.value = newVol;
      if (audioElRef.current) audioElRef.current.volume = newVol;
      if (step >= steps) {
        stopAll();
      }
    }, 100);
  }, [volume, stopAll]);

  // Start 3h timer
  const start3hTimer = useCallback(() => {
    clearTimers();
    timerRef.current = setTimeout(() => {
      startFadeOut();
    }, THREE_HOURS_MS - FADE_DURATION * 1000);
  }, [clearTimers, startFadeOut]);

  const generateBuffer = useCallback((ctx: AudioContext, type: SoundId) => {
    const bufferSize = ctx.sampleRate * 10;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === "white-plain") {
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    } else if (type === "brown-plain") {
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.5;
      }
    } else if (type === "brown-deep") {
      // Deep rumble: brown noise with extra low-pass character
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.01 * white) / 1.01; // tighter filter = deeper
        data[i] = lastOut * 5;
      }
    }
    return buffer;
  }, []);

  const playProgrammatic = useCallback(async (soundId: SoundId) => {
    stopAll();
    const ctx = new AudioContext();
    await ctx.resume();
    audioCtxRef.current = ctx;
    const buffer = generateBuffer(ctx, soundId);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = ctx.createGain();
    gain.gain.value = volume;
    gainRef.current = gain;

    // Deep rumble gets a biquad low-pass filter
    if (soundId === "brown-deep") {
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 150;
      source.connect(filter);
      filter.connect(gain);
    } else {
      source.connect(gain);
    }

    gain.connect(ctx.destination);
    source.start();
    sourceRef.current = source;
    setIsPlaying(true);
    start3hTimer();
  }, [stopAll, volume, generateBuffer, start3hTimer]);

  const playFile = useCallback((fileName: string) => {
    stopAll();
    const url = `${SUPABASE_URL}/storage/v1/object/public/sound_files/${fileName}`;
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = volume;
    audio.play().catch((err) => {
      console.warn("Could not play sound file:", fileName, url, err);
    });
    audioElRef.current = audio;
    setIsPlaying(true);
    start3hTimer();
  }, [stopAll, volume, start3hTimer]);

  const playSound = useCallback((soundId: SoundId) => {
    const sound = SOUNDS.find((s) => s.id === soundId);
    if (!sound) return;
    if (sound.type === "programmatic") playProgrammatic(soundId);
    else if (sound.file) playFile(sound.file);
  }, [playProgrammatic, playFile]);

  const handleSelect = (val: string) => {
    const soundId = val as SoundId;
    setSelectedSound(soundId);
    playSound(soundId);
  };

  const handlePlayPause = async () => {
    if (!selectedSound) return;
    if (isPlaying) {
      // Pause
      if (audioCtxRef.current) audioCtxRef.current.suspend();
      if (audioElRef.current) audioElRef.current.pause();
      setIsPlaying(false);
    } else {
      // Resume
      if (audioCtxRef.current) await audioCtxRef.current.resume();
      if (audioElRef.current) audioElRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (val: number[]) => {
    const v = val[0];
    setVolume(v);
    if (gainRef.current) gainRef.current.gain.value = v;
    if (audioElRef.current) audioElRef.current.volume = v;
  };

  // Cleanup on unmount
  useEffect(() => () => stopAll(), [stopAll]);

  const activeSoundLabel = SOUNDS.find((s) => s.id === selectedSound)?.label;

  return (
    <div className="card-dreamy w-full max-w-xs p-5 rounded-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-center gap-2">
        <RaindropZzz />
        <span className="text-sm font-heading font-semibold text-foreground">Sound Machine</span>
      </div>

      {/* Dropdown Selector */}
      <Select value={selectedSound} onValueChange={handleSelect}>
        <SelectTrigger className="rounded-xl border-primary/20 bg-card/80 backdrop-blur-sm">
          <SelectValue placeholder="Choose a sound…" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectGroup>
            <SelectLabel className="text-xs text-muted-foreground">White Noise</SelectLabel>
            <SelectItem value="white-plain">☁️ Plain</SelectItem>
            <SelectItem value="white-rain">🌧️ Rain</SelectItem>
            <SelectItem value="white-ocean">🌊 Ocean</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel className="text-xs text-muted-foreground">Brown Noise</SelectLabel>
            <SelectItem value="brown-plain">🍂 Plain</SelectItem>
            <SelectItem value="brown-deep">🌋 Deep Rumble</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Now Playing + Controls */}
      {selectedSound && (
        <div className="space-y-3 animate-fade-in">
          {/* Now playing label */}
          <div className="flex items-center justify-center gap-2">
            {isPlaying && <EqBars />}
            <span className="text-xs text-muted-foreground font-medium">
              {isPlaying ? `Playing: ${activeSoundLabel}` : `Paused: ${activeSoundLabel}`}
            </span>
          </div>

          {/* Play/Pause */}
          <div className="flex items-center justify-center">
            <Button
              size="sm"
              variant="ghost"
              className="rounded-xl btn-hover h-10 w-10"
              onClick={handlePlayPause}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3">
            <VolumeX className="w-4 h-4 text-muted-foreground shrink-0" />
            <Slider
              value={[volume]}
              onValueChange={handleVolumeChange}
              min={0}
              max={1}
              step={0.01}
              className="flex-1"
            />
            <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />
          </div>
        </div>
      )}
    </div>
  );
};

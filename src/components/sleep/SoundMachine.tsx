import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX, Play, Pause, Waves } from "lucide-react";

type NoiseType = "white" | "brown" | null;

export const SoundMachine = () => {
  const [activeNoise, setActiveNoise] = useState<NoiseType>(null);
  const [volume, setVolume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const stopNoise = useCallback(() => {
    sourceRef.current?.stop();
    sourceRef.current = null;
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    setIsPlaying(false);
  }, []);

  const playNoise = useCallback((type: "white" | "brown") => {
    stopNoise();
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    const bufferSize = ctx.sampleRate * 10;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === "white") {
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    } else {
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.5;
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const gain = ctx.createGain();
    gain.gain.value = volume;
    gainRef.current = gain;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    sourceRef.current = source;
    setActiveNoise(type);
    setIsPlaying(true);
  }, [stopNoise, volume]);

  const handleToggle = (type: "white" | "brown") => {
    if (activeNoise === type && isPlaying) { stopNoise(); setActiveNoise(null); }
    else playNoise(type);
  };

  const handleVolumeChange = (val: number[]) => {
    const v = val[0];
    setVolume(v);
    if (gainRef.current) gainRef.current.gain.value = v;
  };

  const handlePlayPause = () => {
    if (!audioCtxRef.current || !activeNoise) return;
    if (isPlaying) { audioCtxRef.current.suspend(); setIsPlaying(false); }
    else { audioCtxRef.current.resume(); setIsPlaying(true); }
  };

  return (
    <div className="card-dreamy w-full max-w-xs p-5 rounded-2xl space-y-4">
      <div className="flex items-center justify-center gap-3">
        <Button
          size="lg"
          variant={activeNoise === "white" ? "default" : "outline"}
          className={`rounded-2xl text-sm btn-hover gap-2 ${activeNoise === "white" && isPlaying ? "glow-primary" : ""}`}
          onClick={() => handleToggle("white")}
        >
          <Waves className="w-4 h-4" />
          White Noise
        </Button>
        <Button
          size="lg"
          variant={activeNoise === "brown" ? "default" : "outline"}
          className={`rounded-2xl text-sm btn-hover gap-2 ${activeNoise === "brown" && isPlaying ? "glow-primary" : ""}`}
          onClick={() => handleToggle("brown")}
        >
          <Waves className="w-4 h-4" />
          Brown Noise
        </Button>
      </div>

      {activeNoise && (
        <div className="space-y-3">
          <div className="flex items-center justify-center">
            <Button size="sm" variant="ghost" className="rounded-xl btn-hover" onClick={handlePlayPause}>
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <VolumeX className="w-4 h-4 text-muted-foreground shrink-0" />
            <Slider value={[volume]} onValueChange={handleVolumeChange} min={0} max={1} step={0.01} className="flex-1" />
            <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />
          </div>
        </div>
      )}
    </div>
  );
};

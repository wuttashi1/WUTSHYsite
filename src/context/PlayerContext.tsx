"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { PlayerTrack } from "@/types";

interface PlayerState {
  current: PlayerTrack | null;
  queue: PlayerTrack[];
  isPlaying: boolean;
  progress: number;
  duration: number;
  currentTime: number;
  volume: number;
  playTrack: (track: PlayerTrack, queue?: PlayerTrack[]) => void;
  switchVersion: (track: PlayerTrack) => void;
  toggle: () => void;
  toggleTrack: (track: PlayerTrack, queue?: PlayerTrack[]) => void;
  next: () => void;
  prev: () => void;
  seek: (percent: number) => void;
  setVolume: (v: number) => void;
  isCurrent: (id: string) => boolean;
}

const PlayerContext = createContext<PlayerState | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [current, setCurrent] = useState<PlayerTrack | null>(null);
  const [queue, setQueue] = useState<PlayerTrack[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolumeState] = useState(1);

  useEffect(() => {
    audioRef.current = new Audio();
    const audio = audioRef.current;

    const onTime = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };
    const onEnd = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onTime);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onTime);
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, []);

  const playTrack = useCallback(
    (track: PlayerTrack, newQueue?: PlayerTrack[]) => {
      const audio = audioRef.current;
      if (!audio || !track.audioUrl) return;
      setQueue(newQueue ?? []);
      setCurrentTime(0);
      setDuration(0);
      setProgress(0);
      setCurrent(track);
      audio.src = track.audioUrl;
      audio.play().catch(() => {});
    },
    []
  );

  const switchVersion = useCallback((track: PlayerTrack) => {
    const audio = audioRef.current;
    if (!audio || current?.id !== track.id || !track.audioUrl) return;
    const position = audio.currentTime;
    const resume = !audio.paused;
    audio.src = track.audioUrl;
    audio.currentTime = position;
    setCurrent(track);
    if (resume) audio.play().catch(() => {});
  }, [current]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }, [current]);

  const toggleTrack = useCallback(
    (track: PlayerTrack, newQueue?: PlayerTrack[]) => {
      if (current?.id === track.id) {
        toggle();
      } else {
        playTrack(track, newQueue);
      }
    },
    [current, toggle, playTrack]
  );

  const next = useCallback(() => {
    if (!current || queue.length === 0) return;
    const idx = queue.findIndex((t) => t.id === current.id);
    const nextTrack = queue[idx + 1];
    if (nextTrack) playTrack(nextTrack, queue);
  }, [current, queue, playTrack]);

  const prev = useCallback(() => {
    if (!current || queue.length === 0) return;
    const idx = queue.findIndex((t) => t.id === current.id);
    const prevTrack = queue[idx - 1];
    if (prevTrack) playTrack(prevTrack, queue);
  }, [current, queue, playTrack]);

  const seek = useCallback((percent: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = (percent / 100) * audio.duration;
  }, []);

  const setVolume = useCallback((v: number) => {
    const audio = audioRef.current;
    if (audio) audio.volume = v;
    setVolumeState(v);
  }, []);

  const isCurrent = useCallback((id: string) => current?.id === id, [current]);

  return (
    <PlayerContext.Provider
      value={{
        current,
        queue,
        isPlaying,
        progress,
        duration,
        currentTime,
        volume,
        playTrack,
        toggle,
        switchVersion,
        toggleTrack,
        next,
        prev,
        seek,
        setVolume,
        isCurrent,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}

"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Pause, Play } from "lucide-react";

const CLIPS = [
  { src: "/videos/vid1.mp4", poster: "/videos/vid1-poster.jpg" },
  { src: "/videos/vid2.mp4", poster: "/videos/vid2-poster.jpg" },
  { src: "/videos/vid3.mp4", poster: "/videos/vid3-poster.jpg" },
];

/** Warms the footage slightly so the cool glass sits inside the brass-and-midnight palette. */
const TINT = "saturate(0.7) sepia(0.14) hue-rotate(-8deg) brightness(0.92)";

/**
 * Full-bleed hero background: cycles through the three brand cinematics
 * (each its own "birth of dimensions → GeoVerse logo" arc), crossfading at
 * the cut so the loop reads as one continuous reel instead of three clips.
 * Falls back to a static poster frame for prefers-reduced-motion, and the
 * visitor can pause the reel at any time.
 */
export default function HeroVideo() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const el = videoRef.current;
    if (!el) return;
    const advance = () => setIndex((i) => (i + 1) % CLIPS.length);
    el.addEventListener("ended", advance);
    return () => el.removeEventListener("ended", advance);
  }, [reducedMotion, index]);

  // Keep the element in step with the pause button (also after the next clip mounts).
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (paused) el.pause();
    else void el.play().catch(() => {});
  }, [paused, index]);

  const clip = CLIPS[index];

  if (reducedMotion) {
    return (
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${CLIPS[0].poster})`, filter: TINT }}
        aria-hidden
      />
    );
  }

  return (
    <div className="bg-background absolute inset-0 overflow-hidden">
      <AnimatePresence>
        <motion.video
          key={clip.src}
          ref={videoRef}
          autoPlay
          muted
          playsInline
          poster={clip.poster}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: TINT }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          aria-hidden
        >
          <source src={clip.src} type="video/mp4" />
        </motion.video>
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? "Play background video" : "Pause background video"}
        className="border-primary/50 bg-background/70 text-foreground hover:bg-primary/20 absolute right-4 bottom-4 z-20 flex h-9 w-9 items-center justify-center rounded-sm border backdrop-blur-sm transition-colors"
      >
        {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
      </button>
    </div>
  );
}

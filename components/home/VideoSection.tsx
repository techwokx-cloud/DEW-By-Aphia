"use client";

import { useRef, useState } from "react";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DewMotifDivider } from "@/components/ui/AnkaraMotif";

export function VideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);

  function toggleMute() {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setMuted(videoRef.current.muted);
  }

  function togglePlay() {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setPlaying(true);
    } else {
      videoRef.current.pause();
      setPlaying(false);
    }
  }

  return (
    <section className="bg-primary/[0.03] py-20 lg:py-28">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div className="order-2 lg:order-1">
            <p className="eyebrow text-primary mb-3">In Motion</p>
            <h2 className="font-display text-3xl lg:text-4xl text-ink text-balance mb-5">
              See the prints move.
            </h2>
            <DewMotifDivider className="w-24 h-3 mb-6" tone="gold" />
            <p className="text-ink-soft leading-relaxed max-w-md mb-8">
              Wax print was made to move — every fold, drape, and turn tells its own
              story. Step inside the DEW atelier and follow a piece from fabric to
              finished look.
            </p>
            <Button href="https://www.instagram.com/dew_byaphia/">Watch More on Instagram</Button>
          </div>

          <div className="order-1 lg:order-2 mx-auto">
            <div className="relative w-[260px] sm:w-[300px] aspect-[9/16] rounded-[var(--radius)] overflow-hidden border border-line shadow-[var(--shadow)] bg-ink">
              <video
                ref={videoRef}
                src="/video/dew-byaphia.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 p-3 flex items-center justify-between bg-gradient-to-t from-black/50 to-transparent">
                <button
                  onClick={togglePlay}
                  aria-label={playing ? "Pause video" : "Play video"}
                  className="h-9 w-9 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-cream hover:bg-white/25 transition-colors"
                >
                  {playing ? (
                    <Pause size={15} strokeWidth={1.75} />
                  ) : (
                    <Play size={15} strokeWidth={1.75} />
                  )}
                </button>
                <button
                  onClick={toggleMute}
                  aria-label={muted ? "Unmute video" : "Mute video"}
                  className="h-9 w-9 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-cream hover:bg-white/25 transition-colors"
                >
                  {muted ? (
                    <VolumeX size={15} strokeWidth={1.75} />
                  ) : (
                    <Volume2 size={15} strokeWidth={1.75} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

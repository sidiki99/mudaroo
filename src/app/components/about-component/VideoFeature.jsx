
"use client";

import { useRef, useState } from "react";
import Link from "next/link";

export default function VideoFeature({
  videoSrc = "/videos/store.mp4", // file inside /public/video/
  poster = "/video/store-poster.jpg", // thumbnail shown before playing
  title = "Best Digital Store BasicStore",
  paragraphs = [
    "Risus augue curabitur diam senectus congue velit et. Sed vitae metus nibh sit era. Nulla adipiscing pharetra pellentesque maecenas odio eros at. Et libero vulputate amet duis erat volutpat vitae eget. Sed vitae metus nibh sit era. Nulla adipiscing pharetra eros at.",
    "Nulla adipiscing pharetra pellentesque maecenas odio eros at. Et libero vulputate amet duis erat volutpat vitae eget. Quam libero etiam et in ac at quis. Risus augue curabitur diam senectus congue velit et.",
  ],
  buttonLabel = "Go to Shop",
  buttonHref = "/shop",
}) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const handlePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => setPlaying(false)); // autoplay can be blocked
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
        {/* ---------- video ---------- */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-neutral-100">
          <video
            ref={videoRef}
            src={videoSrc}
            poster={poster}
            controls={playing}
            playsInline
            preload="metadata"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            className="h-full w-full object-cover"
          />

          {/* big play button, hidden while the video is playing */}
          {!playing && (
            <button
              type="button"
              onClick={handlePlay}
              aria-label="Play video"
              className="absolute inset-0 flex items-center justify-center"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-neutral-800 bg-white/30 backdrop-blur-[1px] transition hover:scale-105 hover:bg-white/60">
                <svg
                  viewBox="0 0 24 24"
                  className="ml-0.5 h-6 w-6 text-neutral-800"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                >
                  <path d="M8 5.5v13l11-6.5z" />
                </svg>
              </span>
            </button>
          )}
        </div>

        {/* ---------- text ---------- */}
        <div>
          <h2 className="text-xl font-light uppercase tracking-wide text-neutral-700">
            {title}
          </h2>

          <div className="mt-2 space-y-2">
            {paragraphs.map((text, i) => (
              <p key={i} className="text-xs leading-relaxed text-neutral-600">
                {text}
              </p>
            ))}
          </div>

          <Link
            href={buttonHref}
            className="mt-6 inline-block rounded-full bg-[#ff5a36] px-8 py-2.5 text-[10px] font-medium uppercase tracking-wider text-white transition hover:bg-[#e8502e]"
          >
            {buttonLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}

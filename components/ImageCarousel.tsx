'use client'

import Image from "next/image";
import { useState } from "react";

const images = [
  "https://plus.unsplash.com/premium_photo-1752498577284-249eed860bfa?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1752606402449-0c14a2d6af70?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1752759667426-be8b901c5fc5?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
];

export default function ImageCarousel() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));

  return (
    <div className="relative w-full max-w-2xl mx-auto aspect-[16/7] overflow-hidden rounded-lg shadow-md">
      <Image
        src={images[current]}
        alt={`Carrossel ${current + 1}`}
        fill
        style={{ objectFit: "cover" }}
        priority
      />
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-zinc-900/80 rounded-full p-2 shadow hover:bg-white"
        aria-label="Anterior"
        type="button"
      >
        &#8592;
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-zinc-900/80 rounded-full p-2 shadow hover:bg-white"
        aria-label="Próximo"
        type="button"
      >
        &#8594;
      </button>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full ${i === current ? "bg-primary" : "bg-gray-300 dark:bg-zinc-700"}`}
          />
        ))}
      </div>
    </div>
  );
} 
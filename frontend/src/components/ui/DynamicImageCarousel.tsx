"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

interface DynamicImageCarouselProps {
  images: string[];
  interval?: number;
  animation?: "fade" | "slideLeft" | "slideRight" | "slideUp" | "slideDown" | "zoom";
  className?: string;
  overlay?: string;
  priority?: boolean;
}

const VARIANTS = {
  fade: {
    enter: { opacity: 0, scale: 1 },
    center: { opacity: 1, scale: 1.06 },
    exit: { opacity: 0, scale: 1.06 },
  },
  slideLeft: {
    enter: { opacity: 0, x: 60, scale: 1 },
    center: { opacity: 1, x: 0, scale: 1.05 },
    exit: { opacity: 0, x: -60, scale: 1.05 },
  },
  slideRight: {
    enter: { opacity: 0, x: -60, scale: 1 },
    center: { opacity: 1, x: 0, scale: 1.05 },
    exit: { opacity: 0, x: 60, scale: 1.05 },
  },
  slideUp: {
    enter: { opacity: 0, y: 40, scale: 1 },
    center: { opacity: 1, y: 0, scale: 1.05 },
    exit: { opacity: 0, y: -40, scale: 1.05 },
  },
  slideDown: {
    enter: { opacity: 0, y: -40, scale: 1 },
    center: { opacity: 1, y: 0, scale: 1.05 },
    exit: { opacity: 0, y: 40, scale: 1.05 },
  },
  zoom: {
    enter: { opacity: 0, scale: 1.15 },
    center: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
};

export default function DynamicImageCarousel({
  images,
  interval = 5000,
  animation = "fade",
  className = "",
  overlay,
  priority = false,
}: DynamicImageCarouselProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(timer);
  }, [images.length, interval]);

  const variants = VARIANTS[animation];

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${images[current]}-${current}`}
          initial="enter"
          animate="center"
          exit="exit"
          variants={variants}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={images[current]}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 60vw"
            priority={priority && current === 0}
          />
        </motion.div>
      </AnimatePresence>
      {/* Overlay */}
      {overlay && <div className={`absolute inset-0 ${overlay}`} />}
    </div>
  );
}

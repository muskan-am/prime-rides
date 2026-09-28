"use client";

import { useEffect, useRef } from "react";

interface HeroMotionBackgroundProps {
  imageSrc?: string;
  videoSrc?: string;
}

export default function HeroMotionBackground({
  imageSrc = "/car-hero.png",
  videoSrc = "/car.mp4",
}: HeroMotionBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const parallaxLayerRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    // Check if device supports hover / fine pointer (desktop only for mouse parallax)
    const isDesktopPointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let scrollY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDesktopPointer) return;
      const { innerWidth, innerHeight } = window;
      // Normalize to -1 to +1 range
      const normX = (e.clientX / innerWidth) * 2 - 1;
      const normY = (e.clientY / innerHeight) * 2 - 1;
      // Target parallax range: 3px to 5px
      targetX = normX * -4;
      targetY = normY * -2.5;
    };

    const handleScroll = () => {
      // Subtle scroll parallax: 0 to 30px over the hero height
      scrollY = Math.min(window.scrollY * 0.08, 35);
    };

    const updateMotion = () => {
      // Smooth lerp for mouse parallax
      mouseX += (targetX - mouseX) * 0.08;
      mouseY += (targetY - mouseY) * 0.08;

      if (parallaxLayerRef.current) {
        parallaxLayerRef.current.style.transform = `translate3d(${mouseX.toFixed(2)}px, ${(mouseY + scrollY).toFixed(2)}px, 0)`;
      }

      rafId.current = requestAnimationFrame(updateMotion);
    };

    if (isDesktopPointer) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    rafId.current = requestAnimationFrame(updateMotion);

    return () => {
      if (isDesktopPointer) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
      window.removeEventListener("scroll", handleScroll);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none"
      aria-hidden="true"
    >
      <style>{`
        @keyframes heroCarCinematicMotion {
          0% {
            transform: scale(1.008) translate3d(0px, 0px, 0);
          }
          25% {
            transform: scale(1.014) translate3d(-5px, -1px, 0);
          }
          50% {
            transform: scale(1.02) translate3d(-8px, -0.5px, 0);
          }
          75% {
            transform: scale(1.014) translate3d(-3px, 1px, 0);
          }
          100% {
            transform: scale(1.008) translate3d(0px, 0px, 0);
          }
        }

        @keyframes heroSheenSweep {
          0%, 100% {
            opacity: 0;
            transform: translate3d(-40%, -10%, 0) rotate(-15deg);
          }
          35% {
            opacity: 0.07;
          }
          55% {
            opacity: 0.09;
          }
          75% {
            opacity: 0;
            transform: translate3d(40%, 10%, 0) rotate(-15deg);
          }
        }

        .hero-cinematic-drive {
          animation: heroCarCinematicMotion 6.5s ease-in-out infinite;
          will-change: transform;
          transform-origin: center center;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          transform-style: preserve-3d;
        }

        .hero-lighting-sheen {
          animation: heroSheenSweep 9s ease-in-out infinite;
          will-change: transform, opacity;
        }

        @media (max-width: 768px) {
          @keyframes heroCarCinematicMotionMobile {
            0% {
              transform: scale(1.005) translate3d(0px, 0px, 0);
            }
            50% {
              transform: scale(1.012) translate3d(-3px, -0.5px, 0);
            }
            100% {
              transform: scale(1.005) translate3d(0px, 0px, 0);
            }
          }
          .hero-cinematic-drive {
            animation: heroCarCinematicMotionMobile 6.5s ease-in-out infinite;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-cinematic-drive,
          .hero-lighting-sheen {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* Parallax wrapper driven by mouse and scroll */}
      <div
        ref={parallaxLayerRef}
        className="absolute -inset-2 h-[calc(100%+1rem)] w-[calc(100%+1rem)] transition-transform duration-75 ease-out"
      >
        {/* Continuous cinematic driving motion container */}
        <div className="relative h-full w-full hero-cinematic-drive">
          {/* Main Hero Car + Scenery Image */}
          <img
            src={imageSrc}
            alt="Prime Rides Luxury Car"
            className="h-full w-full object-cover object-right lg:object-center"
            style={{
              imageRendering: "auto",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
            loading="eager"
            decoding="async"
          />

          {/* Fallback Highway Video */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover object-center -z-10"
            aria-hidden="true"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>

          {/* Subtle Ambient Sunset Sheen / Reflection Overlay */}
          <div className="absolute inset-0 pointer-events-none hero-lighting-sheen bg-gradient-to-tr from-transparent via-amber-200/20 to-transparent mix-blend-screen" />
        </div>
      </div>
    </div>
  );
}

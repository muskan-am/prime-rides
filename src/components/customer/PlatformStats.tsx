"use client";

import { useEffect, useRef, useState } from "react";

export type StatItem = {
  id?: string;
  label: string;
  valueNumber: number;
  prefix?: string;
  suffix?: string;
};

type PlatformStatsProps = {
  stats?: StatItem[];
};

const defaultStats: StatItem[] = [
  {
    label: "Major cities in India with reliable self drive car rental options.",
    valueNumber: 100,
    prefix: "",
    suffix: "+",
  },
  {
    label: "Users trust Prime Rides for easy and affordable car rentals.",
    valueNumber: 25,
    prefix: "",
    suffix: "M+",
  },
  {
    label: "Self-drive cars available across various categories to suit every travel need.",
    valueNumber: 40,
    prefix: "",
    suffix: "K+",
  },
  {
    label: "Hosts offering a wide range of self drive cars.",
    valueNumber: 20,
    prefix: "",
    suffix: "K+",
  },
];

function AnimatedCounter({
  targetValue,
  prefix = "",
  suffix = "+",
  duration = 2000,
  isVisible,
}: {
  targetValue: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  isVisible: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setCount(0);
      return;
    }

    let startTime: number | null = null;
    let animationFrameId: number;

    const easeOutExpo = (x: number): number => {
      return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
    };

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = easeOutExpo(progress);
      
      const currentCount = Math.floor(easedProgress * targetValue);
      setCount(currentCount);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(targetValue);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible, targetValue, duration]);

  return (
    <span className="inline-flex items-baseline font-black tracking-tight bg-gradient-to-r from-blue-400 via-cyan-300 to-white bg-clip-text text-transparent text-4xl sm:text-5xl lg:text-6xl transition-transform duration-300 group-hover:scale-105 drop-shadow-sm">
      {prefix}
      {count}
      {suffix}
    </span>
  );
}

export default function PlatformStats({ stats }: PlatformStatsProps) {
  const displayStats = stats && stats.length > 0 ? stats : defaultStats;
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.2,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#0A1128] border-y border-slate-800/80 py-16 px-4 sm:px-6 lg:px-8 text-white shadow-2xl"
    >
      {/* Ambient Radial Blue Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />

      {/* Background Micro Glow Grid Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:28px_28px] opacity-15 pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 border-b border-slate-800/80 pb-8">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
              OUR IMPACT
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-none">
              India&apos;s #1{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-white bg-clip-text text-transparent">
                Car Rental Platform
              </span>
            </h2>
          </div>
          <p className="text-sm sm:text-base text-slate-300 max-w-md font-medium leading-relaxed">
            Empowering millions of travelers across India with seamless, self-drive freedom and verified hosts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayStats.map((stat, index) => (
            <div
              key={stat.id || index}
              className="group relative flex flex-col justify-between p-6 rounded-2xl bg-slate-900/60 border border-slate-800/90 backdrop-blur-md transition-all duration-300 hover:bg-slate-900/90 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1.5"
            >
              {/* Subtle top indicator bar on hover */}
              <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-full" />

              <div className="mb-4">
                <AnimatedCounter
                  targetValue={stat.valueNumber}
                  prefix={stat.prefix || ""}
                  suffix={stat.suffix || "+"}
                  isVisible={isVisible}
                />
              </div>

              <p className="text-sm font-medium text-slate-300 leading-relaxed">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import React, { useState, useEffect } from "react";

export default function IntroAnimation({ onFinish }) {
  const [loadingStep, setLoadingStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    "INITIALIZING STADIUMIQ CORE LAYER...",
    "BOOTSTRAPPING NEURAL INTENT TRANSLATORS...",
    "ESTABLISHING VEHICULAR & PEDESTRIAN GRAPH NODES...",
    "SYNCING LIVE CCTV OCCUPANCY HEATMAPS...",
    "TUNING RETRIEVAL-AUGMENTED DECISION RETRIEVER...",
    "STADIUMIQ GENAI ORCHESTRATOR ONLINE!"
  ];

  useEffect(() => {
    // Progress bar speed
    const progressTimer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return p + 1.25;
      });
    }, 40);

    // Logging text stepper
    const stepTimer = setInterval(() => {
      setLoadingStep((s) => {
        if (s < steps.length - 1) {
          return s + 1;
        }
        return s;
      });
    }, 700);

    return () => {
      clearInterval(progressTimer);
      clearInterval(stepTimer);
    };
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const finishTimeout = setTimeout(() => {
        onFinish();
      }, 600); // slight pause at 100%
      return () => clearTimeout(finishTimeout);
    }
  }, [progress, onFinish]);

  return (
    <div className="fixed inset-0 z-[9999] bg-surface flex flex-col items-center justify-center overflow-hidden p-6 select-none">
      {/* Background glowing ambient blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-secondary/15 blur-[120px] pointer-events-none animate-pulse" />

      {/* Main Container */}
      <div className="w-full max-w-lg relative flex flex-col items-center">
        {/* Animated Scanner Ring */}
        <div className="relative w-48 h-48 mb-12 flex items-center justify-center">
          {/* Inner ring */}
          <div className="absolute inset-2 rounded-full border border-primary/20 animate-[spin_10s_linear_infinite]" />
          
          {/* Middle dashed scan ring */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-secondary/40 animate-[spin_20s_linear_infinite_reverse]" />
          
          {/* Outer glowing border */}
          <div className="absolute -inset-4 rounded-full border border-primary-container/30 blur-[2px] animate-pulse" />
          
          {/* Scanning Sweep line */}
          <div className="absolute inset-0 rounded-full border-t border-r-2 border-secondary animate-[spin_2.5s_linear_infinite]" />

          {/* StadiumIQ Pulsing Icon */}
          <div className="z-10 flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-secondary text-5xl animate-bounce" style={{ fontVariationSettings: "'FILL' 1" }}>
              sports_soccer
            </span>
            <div className="text-sm font-black text-on-surface tracking-[0.2em] font-mono mt-2">
              IQ.CORE
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-extrabold text-white tracking-wider mb-2 text-center">
          STADIUM<span className="text-secondary">IQ</span>
        </h2>
        <p className="text-[10px] text-primary font-mono uppercase tracking-[0.4em] mb-12 text-center">
          GENAI VENUE ORCHESTRATION PLATFORM
        </p>

        {/* Console-style loader block */}
        <div className="w-full bg-surface-container border border-outline-variant/30 rounded-xl p-6 font-mono text-xs shadow-2xl relative overflow-hidden backdrop-blur-md">
          {/* Glass glare */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />

          {/* Loader text */}
          <div className="space-y-2 min-h-[90px]">
            {steps.slice(0, loadingStep + 1).map((step, idx) => (
              <div 
                key={idx} 
                className={`flex items-start gap-2.5 transition-all duration-300 ${
                  idx === loadingStep ? "text-secondary font-bold" : "text-on-surface-variant/70"
                }`}
              >
                <span className="text-primary-container">&gt;</span>
                <span className="leading-relaxed">{step}</span>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mt-6 pt-4 border-t border-outline-variant/20 flex flex-col gap-2">
            <div className="flex justify-between items-center text-[10px] text-on-surface-variant font-mono">
              <span>SYSTEM CALIBRATION</span>
              <span className="text-secondary font-bold">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden border border-outline-variant/30">
              <div 
                className="h-full bg-gradient-to-r from-primary-container to-secondary transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Skip button */}
        <button
          onClick={onFinish}
          className="mt-8 px-5 py-2 rounded-full border border-outline-variant/30 hover:border-white/40 bg-surface-container-high/40 hover:bg-surface-container-high/80 text-[10px] font-mono text-on-surface-variant hover:text-white uppercase tracking-widest transition-all duration-200"
        >
          SKIP BOOT SYSTEM
        </button>
      </div>
    </div>
  );
}

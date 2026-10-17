import { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';

export function LoadingScreen() {
  const { progress, active } = useProgress();
  const [displayProgress, setDisplayProgress] = useState(12);

  useEffect(() => {
    // If drei's useProgress provides a value, follow it smoothly
    if (active && progress > 0) {
      setDisplayProgress(Math.round(progress));
    } else {
      // Natural smooth fake progress crawl while GLB streams
      const interval = setInterval(() => {
        setDisplayProgress((prev) => {
          if (prev >= 95) return prev;
          const inc = Math.max(1, Math.floor((100 - prev) / 8));
          return prev + inc;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [active, progress]);

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#08090b] text-slate-100 select-none">
      {/* Background tactical grid */}
      <div className="absolute inset-0 tactical-grid-bg opacity-30 pointer-events-none" />

      {/* Center Radar / HUD Ring */}
      <div className="relative flex items-center justify-center w-32 h-32 mb-8">
        <div className="absolute inset-0 rounded-full border border-amber-500/20 animate-ping" />
        <div className="absolute inset-2 rounded-full border border-cyan-500/30 border-dashed animate-spin" style={{ animationDuration: '8s' }} />
        <div className="w-24 h-24 rounded-full border-2 border-t-amber-400 border-r-amber-500/40 border-b-cyan-400 border-l-transparent animate-spin" style={{ animationDuration: '1.2s' }} />
        <div className="absolute flex flex-col items-center justify-center">
          <span className="font-mono-telemetry font-black text-amber-400 text-lg">
            {displayProgress}%
          </span>
          <span className="text-[9px] font-mono-telemetry text-slate-400 font-semibold tracking-wider">
            DECODING
          </span>
        </div>
      </div>

      {/* Tactical Status Headings */}
      <div className="text-center z-10 max-w-sm px-6">
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
          <span className="font-sans-tactical font-black tracking-widest text-sm text-slate-200 uppercase">
            AMPHIBIOUS COMBAT RIG // MK-IV
          </span>
        </div>
        <p className="font-mono-telemetry text-xs text-slate-400 tracking-wider mb-6">
          STREAMING 3D ASSETS & COMPILING SHADERS...
        </p>

        {/* Segmented Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-900 border border-white/10 p-0.5 overflow-hidden">
          <div
            className="h-full rounded-sm bg-gradient-to-r from-amber-500 via-cyan-400 to-emerald-400 transition-all duration-300 shadow-[0_0_12px_#f59e0b]"
            style={{ width: `${displayProgress}%` }}
          />
        </div>

        {/* Telemetry coordinate stamp */}
        <div className="flex justify-between items-center text-[10px] font-mono-telemetry text-slate-400 mt-3">
          <span>PORT: 5173/5174</span>
          <span>SEC-4 // GLTF RIG</span>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;

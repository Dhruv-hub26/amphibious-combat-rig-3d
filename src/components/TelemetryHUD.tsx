import React from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Box,
  Compass,
  Gauge,
  Shield,
  Layers,
  Sliders,
  Power,
  Anchor,
  Truck,
  Eye,
  Radio,
} from 'lucide-react';
import type {
  CamoType,
  DriveMode,
  CameraViewPreset,
  TelemetryState,
} from '../types/telemetry';

interface TelemetryHUDProps {
  state: TelemetryState;
  onToggleEngage: () => void;
  onThrottleChange: (throttle: number) => void;
  onDriveModeChange: (mode: DriveMode) => void;
  onWireframeToggle: () => void;
  onCamoChange: (camo: CamoType) => void;
  onCameraPresetChange: (preset: CameraViewPreset) => void;
  onResetCamera: () => void;
  onToggleMute: () => void;
  onTurretPitchChange: (pitch: number) => void;
  onPlayClickSound?: () => void;
}

const CAMO_OPTIONS: { id: CamoType; label: string; bgClass: string; borderHex: string }[] = [
  { id: 'camo-green', label: 'Camo Green', bgClass: 'bg-[#3b4536]', borderHex: '#86efac' },
  { id: 'urban-slate', label: 'Urban Slate', bgClass: 'bg-[#475569]', borderHex: '#cbd5e1' },
  { id: 'desert-sand', label: 'Desert Sand', bgClass: 'bg-[#9a805f]', borderHex: '#fde047' },
  { id: 'stealth-obsidian', label: 'Stealth Obsidian', bgClass: 'bg-[#181b22]', borderHex: '#67e8f9' },
];

const CAMERA_PRESETS: CameraViewPreset[] = [
  'TACTICAL ORBIT',
  'TURRET VIEW',
  'TREAD TRACKS',
  "BIRD'S EYE",
];

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({
  state,
  onToggleEngage,
  onThrottleChange,
  onDriveModeChange,
  onWireframeToggle,
  onCamoChange,
  onCameraPresetChange,
  onResetCamera,
  onToggleMute,
  onTurretPitchChange,
  onPlayClickSound,
}) => {
  const {
    isEngaged,
    throttle,
    driveMode,
    wireframe,
    camo,
    cameraPreset,
    armorIntegrity,
    rpm,
    speedKmh,
    speedKnots,
    heading,
    turretPitch,
    triangleCount,
    isMuted,
  } = state;

  const handleClick = (callback: () => void) => {
    if (onPlayClickSound) onPlayClickSound();
    callback();
  };

  // Circular gauge calculation (RPM: 0 to 6000 max)
  const maxRpm = 6000;
  const rpmRatio = Math.min(rpm / maxRpm, 1);
  const strokeDashoffset = 283 - 283 * rpmRatio * 0.75; // 270 degree sweep

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-4 sm:p-6 md:p-8 w-screen h-screen overflow-hidden select-none font-sans">
      {/* ======================================================== */}
      {/* 1. TOP HEADER BAR                                       */}
      {/* ======================================================== */}
      <header className="flex items-center justify-between w-full gap-4">
        {/* Left Badge: Unit Identifier */}
        <div className="pointer-events-auto bg-slate-950/70 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2.5 flex items-center gap-3.5 shadow-2xl">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-400/30 text-[#FDBA74] font-sans font-bold text-xs">
            [T]
            {isEngaged && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans font-bold tracking-wide text-xs sm:text-sm text-slate-100">
                AMPHIBIOUS COMBAT RIG
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-sans font-semibold bg-cyan-500/15 border border-cyan-400/30 text-[#67E8F9]">
                MK-IV
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  isEngaged ? 'bg-teal-400 shadow-[0_0_8px_#5eead4]' : 'bg-[#FB923C] shadow-[0_0_8px_#fb923c]'
                }`}
              />
              <span className="text-[10px] font-sans font-medium tracking-wider text-slate-400 uppercase">
                {isEngaged ? 'Tactical Deployed' : 'Standby Mode'}
              </span>
              <span className="text-[10px] font-mono tracking-tight text-slate-400 hidden sm:inline">
                // SEC-9.84
              </span>
            </div>
          </div>
        </div>

        {/* Right Header Panel: Power, Mute, Reset, Wireframe */}
        <div className="pointer-events-auto bg-slate-950/70 backdrop-blur-xl border border-white/10 rounded-2xl px-3.5 py-2 flex items-center gap-2 sm:gap-3 shadow-2xl">
          {/* Turbine Status Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/60 border border-white/5 text-xs font-sans">
            <Radio
              className={`w-3.5 h-3.5 ${
                isEngaged ? 'text-teal-300 animate-pulse' : 'text-slate-400'
              }`}
            />
            <span className="text-slate-400 text-[11px]">TURBINE:</span>
            <span
              className={`font-semibold text-[11px] ${
                isEngaged ? 'text-teal-300' : 'text-[#FDBA74]'
              }`}
            >
              {isEngaged ? 'ACTIVE' : 'STANDBY'}
            </span>
          </div>

          {/* Wireframe Inspection Toggle */}
          <button
            onClick={() => handleClick(onWireframeToggle)}
            title="Toggle Wireframe Inspection"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans font-medium transition-all ${
              wireframe
                ? 'bg-cyan-500/20 text-[#67E8F9] border border-cyan-400/40 shadow-[0_0_12px_rgba(103,232,249,0.3)]'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mesh</span>
          </button>

          {/* Audio Mute/Unmute */}
          <button
            onClick={() => handleClick(onToggleMute)}
            title={isMuted ? 'Unmute Engine Sound' : 'Mute Engine Sound'}
            className={`p-2 rounded-xl text-xs transition-all ${
              isMuted
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
            }`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#FDBA74]" />}
          </button>

          {/* Camera Reset */}
          <button
            onClick={() => handleClick(onResetCamera)}
            title="Reset Camera View to Default"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 text-xs font-sans transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. MIDDLE FLOATING TELEMETRY PANELS                      */}
      {/* ======================================================== */}
      <div className="flex justify-between items-center w-full my-auto pointer-events-none gap-4">
        {/* LEFT PANEL: PROPULSION TELEMETRY */}
        <aside className="pointer-events-auto bg-slate-950/70 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl w-72 sm:w-80 transition-transform font-sans">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3.5">
            <div className="flex items-center gap-2 text-[#FDBA74] font-sans font-bold text-xs uppercase tracking-wider">
              <Gauge className="w-4 h-4" />
              <span>PROPULSION TELEMETRY</span>
            </div>
            <span className="text-[10px] font-sans text-slate-400 bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-500/20">
              SYS-01
            </span>
          </div>

          {/* Dynamic Circular RPM Gauge & Velocity */}
          <div className="flex items-center gap-4 py-1">
            {/* SVG Circular RPM Gauge */}
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg className="w-24 h-24 -rotate-135" viewBox="0 0 100 100">
                {/* Background Track */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-slate-800"
                  strokeWidth="7"
                  fill="transparent"
                  strokeDasharray="210"
                  strokeLinecap="round"
                />
                {/* Active Dynamic Progress in Soft Mint / Pastel Cyan */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className={
                    rpm > 4500
                      ? 'stroke-rose-400'
                      : rpm > 3000
                      ? 'stroke-[#FDBA74]'
                      : 'stroke-[#5EEAD4]'
                  }
                  strokeWidth="7"
                  fill="transparent"
                  strokeDasharray="283"
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[9px] font-sans text-slate-400 font-semibold uppercase tracking-wider">
                  RPM
                </span>
                <span className="text-base font-mono tracking-tight font-bold text-slate-100">
                  {Math.round(rpm)}
                </span>
                <span className="text-[8px] font-sans text-[#FDBA74]/90">
                  {isEngaged ? `${throttle}x LOAD` : 'IDLE'}
                </span>
              </div>
            </div>

            {/* Velocity Readouts: KM/H and Amphibious Knots */}
            <div className="flex-1 space-y-2">
              <div className="bg-slate-900/70 rounded-xl p-2.5 border border-white/5">
                <div className="text-[10px] font-sans text-slate-400 uppercase tracking-wider flex justify-between">
                  <span>GROUND SPEED</span>
                  <span className="text-[#FDBA74] font-semibold text-[10px]">KM/H</span>
                </div>
                <div className="text-xl font-mono tracking-tight font-bold text-slate-100 flex items-baseline gap-1 mt-0.5">
                  <span>{speedKmh.toFixed(1)}</span>
                  <span className="text-xs font-sans font-normal text-slate-400">km/h</span>
                </div>
              </div>

              <div className="bg-slate-900/70 rounded-xl p-2.5 border border-white/5">
                <div className="text-[10px] font-sans text-slate-400 uppercase tracking-wider flex justify-between">
                  <span>HYDRO VELOCITY</span>
                  <span className="text-[#67E8F9] font-semibold text-[10px]">KNOTS</span>
                </div>
                <div className="text-lg font-mono tracking-tight font-bold text-[#67E8F9] flex items-baseline gap-1 mt-0.5">
                  <span>{speedKnots.toFixed(1)}</span>
                  <span className="text-xs font-sans font-normal text-[#67E8F9]/70">kts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Drive Mode Selector: Land Crawl vs Amphibious Water Drive */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <span className="text-[10px] font-sans text-slate-400 uppercase tracking-wider block mb-2">
              DRIVE CONFIGURATION
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleClick(() => onDriveModeChange('LAND'))}
                className={`flex items-center justify-center gap-2 py-2 px-2.5 rounded-xl text-xs font-sans font-semibold transition-all ${
                  driveMode === 'LAND'
                    ? 'bg-orange-500/20 text-[#FDBA74] border border-orange-400/40 shadow-[0_0_15px_rgba(251,146,60,0.25)]'
                    : 'bg-slate-900/50 text-slate-400 hover:text-slate-200 border border-white/5'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>LAND CRAWL</span>
              </button>

              <button
                onClick={() => handleClick(() => onDriveModeChange('WATER'))}
                className={`flex items-center justify-center gap-2 py-2 px-2.5 rounded-xl text-xs font-sans font-semibold transition-all ${
                  driveMode === 'WATER'
                    ? 'bg-teal-500/20 text-[#5EEAD4] border border-teal-400/40 shadow-[0_0_15px_rgba(94,234,212,0.25)]'
                    : 'bg-slate-900/50 text-slate-400 hover:text-slate-200 border border-white/5'
                }`}
              >
                <Anchor className="w-3.5 h-3.5" />
                <span>AMPHIBIOUS</span>
              </button>
            </div>
          </div>
        </aside>

        {/* RIGHT PANEL: CHASSIS & COMBAT SPECS */}
        <aside className="pointer-events-auto bg-slate-950/70 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl w-72 sm:w-80 transition-transform font-sans">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3.5">
            <div className="flex items-center gap-2 text-[#5EEAD4] font-sans font-bold text-xs uppercase tracking-wider">
              <Shield className="w-4 h-4" />
              <span>CHASSIS & SPECS</span>
            </div>
            <span className="text-[10px] font-sans text-slate-400 bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-500/20">
              RIG-SPEC
            </span>
          </div>

          {/* Armor Integrity Segmented Bar */}
          <div className="mb-3.5">
            <div className="flex items-center justify-between text-xs mb-1.5 font-sans">
              <span className="text-slate-400 text-[11px]">ARMOR INTEGRITY</span>
              <span className="font-semibold text-[#5EEAD4]">
                <span className="font-mono tracking-tight">{armorIntegrity}%</span> [COMPOSITE]
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden flex gap-1 p-0.5 border border-white/5">
              <div
                className="h-full rounded-sm bg-gradient-to-r from-teal-400 to-cyan-400 shadow-[0_0_8px_#5eead4]"
                style={{ width: `${armorIntegrity}%` }}
              />
            </div>
          </div>

          {/* Metrics Grid: Triangles, Heading, Turret Pitch */}
          <div className="grid grid-cols-3 gap-2 py-1 text-center font-sans">
            {/* Triangles Count */}
            <div className="bg-slate-900/70 rounded-xl p-2 border border-white/5">
              <div className="text-[9px] text-slate-400 uppercase tracking-tight flex items-center justify-center gap-1">
                <Layers className="w-3 h-3 text-[#67E8F9]" />
                <span>TRIANGLES</span>
              </div>
              <div className="text-sm font-mono tracking-tight font-bold text-slate-200 mt-1">
                {triangleCount > 0 ? (triangleCount / 1000).toFixed(1) + 'k' : '142k'}
              </div>
            </div>

            {/* Compass Heading */}
            <div className="bg-slate-900/70 rounded-xl p-2 border border-white/5">
              <div className="text-[9px] text-slate-400 uppercase tracking-tight flex items-center justify-center gap-1">
                <Compass className="w-3 h-3 text-[#FDBA74]" />
                <span>HEADING</span>
              </div>
              <div className="text-sm font-mono tracking-tight font-bold text-[#FDBA74] mt-1">
                {heading}° <span className="text-[10px] font-sans text-slate-500 font-normal">N</span>
              </div>
            </div>

            {/* Turret Elevation */}
            <div className="bg-slate-900/70 rounded-xl p-2 border border-white/5">
              <div className="text-[9px] text-slate-400 uppercase tracking-tight flex items-center justify-center gap-1">
                <Sliders className="w-3 h-3 text-[#5EEAD4]" />
                <span>ELEVATION</span>
              </div>
              <div className="flex items-center justify-center gap-1 mt-1 font-sans">
                <button
                  onClick={() => handleClick(() => onTurretPitchChange(Math.max(-5, turretPitch - 2)))}
                  className="w-4 h-4 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 text-[10px] text-slate-300 transition-colors"
                  title="Lower Pitch"
                >
                  -
                </button>
                <span className="text-xs font-mono tracking-tight font-bold text-[#5EEAD4] min-w-[28px]">
                  {turretPitch >= 0 ? `+${turretPitch}°` : `${turretPitch}°`}
                </span>
                <button
                  onClick={() => handleClick(() => onTurretPitchChange(Math.min(35, turretPitch + 2)))}
                  className="w-4 h-4 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 text-[10px] text-slate-300 transition-colors"
                  title="Raise Pitch"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Camo Finish Selector Pills */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <span className="text-[10px] font-sans text-slate-400 uppercase tracking-wider block mb-2">
              ARMOR CAMO FINISH
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {CAMO_OPTIONS.map((opt) => {
                const isActive = camo === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleClick(() => onCamoChange(opt.id))}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[11px] font-sans transition-all text-left ${
                      isActive
                        ? 'bg-white/10 text-slate-100 border border-white/30 shadow-md font-semibold'
                        : 'bg-slate-900/50 text-slate-400 hover:text-slate-200 border border-white/5 font-normal'
                    }`}
                  >
                    <span
                      className={`w-3 h-3 rounded-full shrink-0 ${opt.bgClass} border`}
                      style={{ borderColor: opt.borderHex }}
                    />
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* ======================================================== */}
      {/* 3. BOTTOM DOCK (REFINED FLOATING GLASS PILL CONTAINER)   */}
      {/* ======================================================== */}
      <footer className="w-full flex justify-center">
        <div className="pointer-events-auto bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2.5 flex flex-wrap items-center justify-between gap-4 shadow-2xl max-w-4xl w-full">
          {/* Left: Camera View Presets */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-sans text-slate-400 uppercase tracking-wider hidden lg:inline mr-1">
              <Eye className="w-3.5 h-3.5 inline mr-1 text-slate-400" /> View:
            </span>
            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/5">
              {CAMERA_PRESETS.map((preset) => {
                const isActive = cameraPreset === preset;
                return (
                  <button
                    key={preset}
                    onClick={() => handleClick(() => onCameraPresetChange(preset))}
                    className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-sans font-medium transition-all ${
                      isActive
                        ? 'bg-[#FB923C] text-slate-950 font-semibold shadow-md shadow-orange-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Center: Tactical ENGAGE PROPULSION Push Button */}
          <div className="flex items-center justify-center">
            <button
              onClick={() => handleClick(onToggleEngage)}
              className={
                isEngaged
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 px-6 py-2.5 rounded-xl shadow-lg font-sans font-semibold text-xs sm:text-sm flex items-center gap-2.5 transition-all active:scale-95'
                  : 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-orange-500/20 hover:brightness-105 active:scale-95 transition-all font-sans text-xs sm:text-sm flex items-center gap-2.5'
              }
            >
              <Power className="w-4 h-4" />
              <span>{isEngaged ? 'STANDBY / DISENGAGE' : 'ENGAGE PROPULSION'}</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  isEngaged ? 'bg-rose-300 animate-ping' : 'bg-slate-950'
                }`}
              />
            </button>
          </div>

          {/* Right: Throttle / Speed Multipliers */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-sans text-slate-400 uppercase tracking-wider hidden lg:inline mr-1">
              Throttle:
            </span>
            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/5">
              {[
                { val: 0.5, label: '0.5x' },
                { val: 1.0, label: '1.0x' },
                { val: 2.0, label: '2.0x' },
              ].map(({ val, label }) => {
                const isActive = throttle === val;
                return (
                  <button
                    key={val}
                    onClick={() => handleClick(() => onThrottleChange(val))}
                    className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-sans font-medium transition-all ${
                      isActive
                        ? 'bg-teal-400 text-slate-950 font-semibold shadow-md shadow-teal-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { CanvasScene } from './components/CanvasScene';
import { TelemetryHUD } from './components/TelemetryHUD';
import { LoadingScreen } from './components/LoadingScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useTankAudio } from './hooks/useTankAudio';
import type {
  CamoType,
  DriveMode,
  CameraViewPreset,
  TelemetryState,
} from './types/telemetry';

export function App() {
  // Main Telemetry State
  const [telemetry, setTelemetry] = useState<TelemetryState>({
    isEngaged: false,
    throttle: 1.0,
    driveMode: 'LAND',
    wireframe: false,
    camo: 'camo-green',
    cameraPreset: 'TACTICAL ORBIT',
    armorIntegrity: 98,
    rpm: 820,
    speedKmh: 0,
    speedKnots: 0,
    heading: 42,
    turretPitch: 14,
    triangleCount: 0,
    isMuted: false,
  });

  // Audio Engine Hook
  const { isMuted, toggleMute, playTacticalClick } = useTankAudio({
    isEngaged: telemetry.isEngaged,
    throttle: telemetry.throttle,
    driveMode: telemetry.driveMode,
  });

  // Keep audio mute state synchronized
  useEffect(() => {
    setTelemetry((prev) => ({ ...prev, isMuted }));
  }, [isMuted]);

  // Smooth simulation loop for realistic RPM and Speed dynamics
  useEffect(() => {
    let animId: number;

    const updateSimulation = () => {
      setTelemetry((prev) => {
        let targetRpm = 820; // Idle RPM
        let targetSpeedKmh = 0;

        if (prev.isEngaged) {
          if (prev.throttle === 0.5) {
            targetRpm = 2100;
            targetSpeedKmh = prev.driveMode === 'WATER' ? 14 : 26;
          } else if (prev.throttle === 1.0) {
            targetRpm = 3400;
            targetSpeedKmh = prev.driveMode === 'WATER' ? 28 : 58;
          } else if (prev.throttle === 2.0) {
            targetRpm = 5200;
            targetSpeedKmh = prev.driveMode === 'WATER' ? 44 : 94;
          }
        }

        // Natural mechanical RPM jitter
        const jitter = prev.isEngaged ? (Math.random() - 0.5) * 35 : (Math.random() - 0.5) * 12;
        const newRpm = prev.rpm + (targetRpm + jitter - prev.rpm) * 0.08;
        const newSpeedKmh = prev.speedKmh + (targetSpeedKmh - prev.speedKmh) * 0.05;
        const newSpeedKnots = newSpeedKmh * 0.539957;

        return {
          ...prev,
          rpm: Math.max(0, newRpm),
          speedKmh: Math.max(0, newSpeedKmh),
          speedKnots: Math.max(0, newSpeedKnots),
        };
      });

      animId = requestAnimationFrame(updateSimulation);
    };

    animId = requestAnimationFrame(updateSimulation);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Handlers for HUD events
  const handleToggleEngage = useCallback(() => {
    setTelemetry((prev) => ({ ...prev, isEngaged: !prev.isEngaged }));
  }, []);

  const handleThrottleChange = useCallback((throttle: number) => {
    setTelemetry((prev) => ({ ...prev, throttle }));
  }, []);

  const handleDriveModeChange = useCallback((driveMode: DriveMode) => {
    setTelemetry((prev) => ({ ...prev, driveMode }));
  }, []);

  const handleWireframeToggle = useCallback(() => {
    setTelemetry((prev) => ({ ...prev, wireframe: !prev.wireframe }));
  }, []);

  const handleCamoChange = useCallback((camo: CamoType) => {
    setTelemetry((prev) => ({ ...prev, camo }));
  }, []);

  const handleCameraPresetChange = useCallback((preset: CameraViewPreset) => {
    setTelemetry((prev) => ({ ...prev, cameraPreset: preset }));
  }, []);

  const handleResetCamera = useCallback(() => {
    setTelemetry((prev) => ({ ...prev, cameraPreset: 'TACTICAL ORBIT' }));
  }, []);

  const handleTurretPitchChange = useCallback((turretPitch: number) => {
    setTelemetry((prev) => ({ ...prev, turretPitch }));
  }, []);

  const handleTrianglesCalculated = useCallback((triangleCount: number) => {
    setTelemetry((prev) => ({ ...prev, triangleCount }));
  }, []);

  const handleHeadingChange = useCallback((heading: number) => {
    setTelemetry((prev) => (prev.heading === heading ? prev : { ...prev, heading }));
  }, []);

  // Keyboard Tactical Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          playTacticalClick();
          handleToggleEngage();
          break;
        case 'Digit1':
          playTacticalClick();
          handleThrottleChange(0.5);
          break;
        case 'Digit2':
          playTacticalClick();
          handleThrottleChange(1.0);
          break;
        case 'Digit3':
          playTacticalClick();
          handleThrottleChange(2.0);
          break;
        case 'KeyM':
          playTacticalClick();
          setTelemetry((prev) => ({
            ...prev,
            driveMode: prev.driveMode === 'LAND' ? 'WATER' : 'LAND',
          }));
          break;
        case 'KeyW':
          playTacticalClick();
          handleWireframeToggle();
          break;
        case 'KeyR':
          playTacticalClick();
          handleResetCamera();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    playTacticalClick,
    handleToggleEngage,
    handleThrottleChange,
    handleWireframeToggle,
    handleResetCamera,
  ]);

  return (
    <ErrorBoundary>
      <div className="relative w-screen h-screen overflow-hidden bg-[#08090b] tactical-grid-bg">
        {/* Tactical Corner HUD Reticles */}
        <div className="pointer-events-none fixed top-4 left-4 z-10 w-8 h-8 border-t-2 border-l-2 border-amber-500/40" />
        <div className="pointer-events-none fixed top-4 right-4 z-10 w-8 h-8 border-t-2 border-r-2 border-amber-500/40" />
        <div className="pointer-events-none fixed bottom-4 left-4 z-10 w-8 h-8 border-b-2 border-l-2 border-amber-500/40" />
        <div className="pointer-events-none fixed bottom-4 right-4 z-10 w-8 h-8 border-b-2 border-r-2 border-amber-500/40" />

        {/* Crosshair Center Reference */}
        <div className="pointer-events-none fixed inset-0 z-10 flex items-center justify-center opacity-20">
          <div className="w-12 h-12 border border-cyan-400 rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
          </div>
        </div>

        {/* 3D Scene Layer Wrapped in React.Suspense with LoadingScreen */}
        <React.Suspense fallback={<LoadingScreen />}>
          <CanvasScene
            isEngaged={telemetry.isEngaged}
            throttle={telemetry.throttle}
            driveMode={telemetry.driveMode}
            wireframe={telemetry.wireframe}
            camo={telemetry.camo}
            turretPitch={telemetry.turretPitch}
            cameraPreset={telemetry.cameraPreset}
            onTrianglesCalculated={handleTrianglesCalculated}
            onHeadingChange={handleHeadingChange}
          />
        </React.Suspense>

        {/* Tactical Telemetry HUD Cockpit Overlay */}
        <TelemetryHUD
          state={telemetry}
          onToggleEngage={handleToggleEngage}
          onThrottleChange={handleThrottleChange}
          onDriveModeChange={handleDriveModeChange}
          onWireframeToggle={handleWireframeToggle}
          onCamoChange={handleCamoChange}
          onCameraPresetChange={handleCameraPresetChange}
          onResetCamera={handleResetCamera}
          onToggleMute={toggleMute}
          onTurretPitchChange={handleTurretPitchChange}
          onPlayClickSound={playTacticalClick}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;

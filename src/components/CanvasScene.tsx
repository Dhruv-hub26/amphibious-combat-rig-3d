import { useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { TankModel } from './TankModel';
import type { CamoType, DriveMode, CameraViewPreset } from '../types/telemetry';

interface CanvasSceneProps {
  isEngaged: boolean;
  throttle: number;
  driveMode: DriveMode;
  wireframe: boolean;
  camo: CamoType;
  turretPitch: number;
  cameraPreset: CameraViewPreset;
  onTrianglesCalculated: (triangles: number) => void;
  onHeadingChange?: (heading: number) => void;
}

// Camera controller smoothly transitioning between tactical camera presets
function CameraController({
  preset,
  onHeadingChange,
}: {
  preset: CameraViewPreset;
  onHeadingChange?: (heading: number) => void;
}) {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const targetPositions: Record<CameraViewPreset, { pos: THREE.Vector3; lookAt: THREE.Vector3 }> = {
    'TACTICAL ORBIT': {
      pos: new THREE.Vector3(18, 12, 22),
      lookAt: new THREE.Vector3(0, 1.2, 0),
    },
    'TURRET VIEW': {
      pos: new THREE.Vector3(8.5, 5.0, 10.5),
      lookAt: new THREE.Vector3(0, 1.8, 0),
    },
    'TREAD TRACKS': {
      pos: new THREE.Vector3(11.5, 2.2, 8.5),
      lookAt: new THREE.Vector3(0, 0.8, 0),
    },
    "BIRD'S EYE": {
      pos: new THREE.Vector3(0.01, 32, 0.01),
      lookAt: new THREE.Vector3(0, 0.5, 0),
    },
  };

  useEffect(() => {
    if (!controlsRef.current) return;
    const target = targetPositions[preset];
    if (target) {
      controlsRef.current.target.copy(target.lookAt);
      controlsRef.current.object.position.copy(target.pos);
      controlsRef.current.update();
    }
  }, [preset]);

  useFrame(() => {
    if (controlsRef.current && onHeadingChange) {
      const camera = controlsRef.current.object;
      const angleRad = Math.atan2(camera.position.x, camera.position.z);
      let angleDeg = Math.round((angleRad * 180) / Math.PI);
      if (angleDeg < 0) angleDeg += 360;
      onHeadingChange(angleDeg);
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping={true}
      dampingFactor={0.05}
      enableZoom={true}
      minDistance={8}
      maxDistance={50}
      maxPolarAngle={Math.PI / 2 - 0.02} // Prevent flipping beneath the ground plane
      target={[0, 1.2, 0]}
    />
  );
}

// Tactical Military Ground Grid / Surface
function TacticalGround({ driveMode, isEngaged, throttle }: { driveMode: DriveMode; isEngaged: boolean; throttle: number }) {
  const waterRef = useRef<THREE.Mesh>(null);
  const gridHelperRef = useRef<THREE.GridHelper>(null);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    if (driveMode === 'WATER' && waterRef.current) {
      const mat = waterRef.current.material as THREE.MeshStandardMaterial;
      if (mat.roughness) {
        mat.roughness = 0.12 + Math.sin(time * 2) * 0.04;
      }
    }

    if (gridHelperRef.current && isEngaged) {
      // Rotate grid slowly or pulse when engaged
      gridHelperRef.current.rotation.y += delta * 0.02 * throttle;
    }
  });

  return (
    <group position={[0, -0.05, 0]}>
      {driveMode === 'WATER' ? (
        // Tactical Oceanic Water Surface
        <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[180, 180, 64, 64]} />
          <meshStandardMaterial
            color="#071822"
            emissive="#031018"
            roughness={0.15}
            metalness={0.88}
            transparent
            opacity={0.92}
          />
        </mesh>
      ) : (
        // High-Tech Ballistic Ground Plane
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[160, 160]} />
            <meshStandardMaterial
              color="#0b0e14"
              roughness={0.85}
              metalness={0.3}
            />
          </mesh>

          {/* Tactical Target Rings */}
          <gridHelper
            ref={gridHelperRef}
            args={[80, 40, '#F59E0B', '#1e293b']}
            position={[0, 0.01, 0]}
          />

          {/* Concentric HUD range rings */}
          {[10, 20, 30].map((radius, idx) => (
            <mesh key={idx} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
              <ringGeometry args={[radius - 0.05, radius + 0.05, 64]} />
              <meshBasicMaterial
                color={idx === 1 ? '#06B6D4' : '#F59E0B'}
                transparent
                opacity={idx === 1 ? 0.25 : 0.15}
              />
            </mesh>
          ))}
        </>
      )}

      {/* Soft Contact Shadows beneath the tank tracks */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.75}
        scale={24}
        blur={2.4}
        far={6}
        color="#000000"
      />
    </group>
  );
}

export function CanvasScene({
  isEngaged,
  throttle,
  driveMode,
  wireframe,
  camo,
  turretPitch,
  cameraPreset,
  onTrianglesCalculated,
  onHeadingChange,
}: CanvasSceneProps) {
  return (
    <div className="absolute inset-0 w-full h-full bg-[#08090b]">
      <Canvas
        camera={{ position: [18, 12, 22], fov: 40 }}
        shadows
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
      >
        {/* Soft atmospheric distance fog matching background #08090b */}
        <fog attach="fog" args={['#08090b', 24, 85]} />
        <color attach="background" args={['#08090b']} />

        {/* Studio Tactical Lighting Setup */}
        {/* Ambient fill */}
        <ambientLight intensity={0.85} color="#cbd5e1" />

        {/* Key directional spotlight highlighting armor plates and turret contours */}
        <directionalLight
          position={[12, 18, 14]}
          intensity={2.6}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={1}
          shadow-camera-far={60}
          shadow-camera-left={-12}
          shadow-camera-right={12}
          shadow-camera-top={12}
          shadow-camera-bottom={-12}
          shadow-bias={-0.0001}
        />

        {/* Dual colored tactical rim lights */}
        {/* Rim 1: Tactical Cyan highlighting metallic treads */}
        <spotLight
          position={[-18, 10, -14]}
          intensity={4.2}
          color="#06B6D4"
          angle={0.65}
          penumbra={0.8}
        />

        {/* Rim 2: Tactical Amber / Gold highlighting rear exhaust & contours */}
        <spotLight
          position={[16, 6, -16]}
          intensity={3.8}
          color="#F59E0B"
          angle={0.7}
          penumbra={0.8}
        />

        {/* Frontal Tactical Headlamps when Engaged */}
        {isEngaged && (
          <>
            <spotLight
              position={[0, 3.5, 8]}
              target-position={[0, 0, 22]}
              intensity={4.5 * throttle}
              color="#e0f2fe"
              angle={0.45}
              penumbra={0.6}
              distance={40}
            />
            <pointLight position={[0, 3, 5]} intensity={1.5} color="#38bdf8" distance={8} />
          </>
        )}

        {/* Tank 3D Model with normalized scale & centered bounding inside Suspense */}
        <Suspense fallback={null}>
          <TankModel
            isEngaged={isEngaged}
            throttle={throttle}
            driveMode={driveMode}
            wireframe={wireframe}
            camo={camo}
            turretPitch={turretPitch}
            onTrianglesCalculated={onTrianglesCalculated}
          />
        </Suspense>

        {/* Tactical Ground / Water Environment */}
        <TacticalGround driveMode={driveMode} isEngaged={isEngaged} throttle={throttle} />

        {/* Smooth OrbitControls with Camera Presets */}
        <CameraController preset={cameraPreset} onHeadingChange={onHeadingChange} />
      </Canvas>
    </div>
  );
}

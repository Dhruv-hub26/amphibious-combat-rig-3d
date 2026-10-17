import { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import type { CamoType, DriveMode } from '../types/telemetry';

interface TankModelProps {
  isEngaged: boolean;
  throttle: number;
  driveMode: DriveMode;
  wireframe: boolean;
  camo: CamoType;
  turretPitch: number; // degrees
  onTrianglesCalculated?: (triangles: number) => void;
}

const CAMO_PALETTE: Record<CamoType, { color: string; metalness: number; roughness: number }> = {
  'camo-green': {
    color: '#384333',
    metalness: 0.35,
    roughness: 0.65,
  },
  'urban-slate': {
    color: '#475569',
    metalness: 0.6,
    roughness: 0.45,
  },
  'desert-sand': {
    color: '#a38a6a',
    metalness: 0.25,
    roughness: 0.75,
  },
  'stealth-obsidian': {
    color: '#1a1d24',
    metalness: 0.85,
    roughness: 0.35,
  },
};

export function TankModel({
  isEngaged,
  throttle,
  driveMode,
  wireframe,
  camo,
  onTrianglesCalculated,
}: TankModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);

  // Load GLB using standard @react-three/drei hook
  const { scene, animations = [] } = useGLTF('/amphibious_tank.glb');
  const safeAnimations = useMemo(() => (Array.isArray(animations) ? animations : []), [animations]);
  const { actions, names } = useAnimations(safeAnimations, groupRef);

  // Clone scene with safety checks
  const clonedScene = useMemo(() => {
    if (!scene) return null;
    try {
      const clone = scene.clone(true);

      clone.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material = mesh.material.map((m) => (m ? m.clone() : m));
            } else {
              mesh.material = mesh.material.clone();
            }
          }
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      });

      return clone;
    } catch (e) {
      console.warn('Failed to clone scene, using direct scene reference:', e);
      return scene;
    }
  }, [scene]);

  // Normalize scale and center model at (0, 0, 0)
  const { centeredOffset, autoScale } = useMemo(() => {
    if (!clonedScene) {
      return { centeredOffset: new THREE.Vector3(0, 0, 0), autoScale: 1 };
    }

    try {
      const box = new THREE.Box3().setFromObject(clonedScene);
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      box.getCenter(center);
      box.getSize(size);

      const maxDim = Math.max(size.x, size.y, size.z);
      // Target comfortable bounding dimension ~11 units
      const scale = maxDim > 0 && Number.isFinite(maxDim) ? 11 / maxDim : 1;

      // Centered offset so lowest point rests nicely above ground plane
      const offset = new THREE.Vector3(-center.x, -box.min.y, -center.z);

      return {
        centeredOffset: offset,
        autoScale: scale,
      };
    } catch (e) {
      console.error('Error calculating bounding box:', e);
      return { centeredOffset: new THREE.Vector3(0, 0, 0), autoScale: 1 };
    }
  }, [clonedScene]);

  // Compute exact triangle count across all meshes
  useEffect(() => {
    if (!clonedScene) return;

    let triangles = 0;
    try {
      clonedScene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          if (mesh.geometry) {
            if (mesh.geometry.index) {
              triangles += mesh.geometry.index.count / 3;
            } else if (mesh.geometry.attributes?.position) {
              triangles += mesh.geometry.attributes.position.count / 3;
            }
          }
        }
      });

      if (onTrianglesCalculated && triangles > 0) {
        onTrianglesCalculated(Math.round(triangles));
      }
    } catch (e) {
      console.warn('Error counting triangles:', e);
    }
  }, [clonedScene, onTrianglesCalculated]);

  // Synchronize animations with smooth play/fade and speed scaling
  useEffect(() => {
    if (!actions || !names || names.length === 0) return;

    if (isEngaged) {
      names.forEach((name) => {
        const action = actions[name];
        if (action) {
          action.reset();
          action.setEffectiveTimeScale(throttle);
          action.fadeIn(0.4);
          action.play();
        }
      });
    } else {
      names.forEach((name) => {
        const action = actions[name];
        if (action) {
          action.fadeOut(0.5);
        }
      });
    }
  }, [actions, names, isEngaged, throttle]);

  // Update speed of currently playing animations dynamically when throttle changes
  useEffect(() => {
    if (!actions || !names || names.length === 0 || !isEngaged) return;
    names.forEach((name) => {
      const action = actions[name];
      if (action) {
        action.setEffectiveTimeScale(throttle);
      }
    });
  }, [actions, names, throttle, isEngaged]);

  // Apply Camo Finish and Wireframe Inspection to materials
  useEffect(() => {
    if (!clonedScene) return;

    const camoSpec = CAMO_PALETTE[camo] || CAMO_PALETTE['camo-green'];
    const camoColor = new THREE.Color(camoSpec.color);

    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (!mesh.material) return;
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

        materials.forEach((mat) => {
          if (!mat) return;
          if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
            mat.wireframe = wireframe;
            if (wireframe) {
              mat.wireframeLinewidth = 1.2;
              mat.color.set('#06B6D4'); // High-contrast tactical cyan wireframe
              mat.emissive.set('#043845');
              mat.emissiveIntensity = 0.5;
            } else {
              mat.emissive.set('#000000');
              mat.emissiveIntensity = 0;
              mat.color.lerp(camoColor, 0.45);
              mat.metalness = THREE.MathUtils.lerp(mat.metalness, camoSpec.metalness, 0.6);
              mat.roughness = THREE.MathUtils.lerp(mat.roughness, camoSpec.roughness, 0.6);
            }
            mat.needsUpdate = true;
          }
        });
      }
    });
  }, [clonedScene, camo, wireframe]);

  // Dynamic frame loop for tactical physics
  useFrame((state, delta) => {
    if (!innerRef.current) return;
    const time = state.clock.getElapsedTime();

    if (driveMode === 'WATER') {
      // Amphibious water buoyancy oscillation
      const buoyancy = Math.sin(time * 1.8) * 0.08;
      const pitch = Math.sin(time * 1.2) * 0.025;
      const roll = Math.cos(time * 1.5) * 0.018;

      innerRef.current.position.y = buoyancy;
      innerRef.current.rotation.x = pitch;
      innerRef.current.rotation.z = roll;
    } else {
      // Land crawl: subtle chassis vibration when engine is engaged
      if (isEngaged) {
        const vibration = Math.sin(time * 50 * throttle) * (0.004 * throttle);
        const slightJolt = Math.sin(time * 6 * throttle) * 0.008;
        innerRef.current.position.y = vibration + slightJolt;
        innerRef.current.rotation.x = Math.sin(time * 4 * throttle) * 0.004;
        innerRef.current.rotation.z = 0;
      } else {
        // Smoothly settle back to level ground
        innerRef.current.position.y = THREE.MathUtils.damp(innerRef.current.position.y, 0, 8, delta);
        innerRef.current.rotation.x = THREE.MathUtils.damp(innerRef.current.rotation.x, 0, 8, delta);
        innerRef.current.rotation.z = THREE.MathUtils.damp(innerRef.current.rotation.z, 0, 8, delta);
      }
    }
  });

  if (!clonedScene) {
    return null;
  }

  return (
    <group ref={groupRef} dispose={null}>
      <group ref={innerRef}>
        <primitive
          object={clonedScene}
          position={[centeredOffset.x * autoScale, centeredOffset.y * autoScale, centeredOffset.z * autoScale]}
          scale={[autoScale, autoScale, autoScale]}
        />
      </group>
    </group>
  );
}

// Preload the GLB model for instant loading outside component
useGLTF.preload('/amphibious_tank.glb');

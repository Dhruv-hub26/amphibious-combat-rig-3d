export type DriveMode = 'LAND' | 'WATER';

export type CamoType = 'camo-green' | 'urban-slate' | 'desert-sand' | 'stealth-obsidian';

export interface CamoPreset {
  id: CamoType;
  label: string;
  colorHex: string;
  metalness: number;
  roughness: number;
}

export type CameraViewPreset = 'TACTICAL ORBIT' | 'TURRET VIEW' | 'TREAD TRACKS' | "BIRD'S EYE";

export interface TelemetryState {
  isEngaged: boolean;
  throttle: number; // 0.5, 1.0, 2.0
  driveMode: DriveMode;
  wireframe: boolean;
  camo: CamoType;
  cameraPreset: CameraViewPreset;
  armorIntegrity: number; // 0 - 100
  rpm: number;
  speedKmh: number;
  speedKnots: number;
  heading: number; // 0 - 360 deg
  turretPitch: number; // -10 deg to +35 deg
  triangleCount: number;
  isMuted: boolean;
}

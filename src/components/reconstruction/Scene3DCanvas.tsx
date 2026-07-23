import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Text, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { SimulationState, ReconstructionData, InvestigationScene, CinematicCameraMode } from '../../types';
import {
  RestaurantScene,
  ResortScene,
  RoadScene,
  CafeScene,
  LohegaonCliffScene
} from './DoomedTriangleScenes';

interface Scene3DCanvasProps {
  simulationState: SimulationState;
  reconData?: ReconstructionData;
  activeStageIndex: number;
  cinematicMode?: CinematicCameraMode;
  onSelectObject?: (objId: string, label: string, details: string) => void;
  onOcclusionUpdate?: (blockPercentage: number) => void;
}

// ==========================================
// 1. BALLISTIC 7.62mm SNIPER TRAJECTORY LAB (STAGE 5 ONLY)
// ==========================================
const Stage5Ballistics: React.FC<{
  simulationState: SimulationState;
  reconData?: ReconstructionData;
  onSelectObject?: (objId: string, label: string, details: string) => void;
}> = ({ simulationState, reconData, onSelectObject }) => {
  const { currentTime } = simulationState;
  const bulletRef = useRef<THREE.Mesh>(null!);

  const sniperStart = useMemo(() => new THREE.Vector3(-8.5, 3.8, -4.5), []);
  const victimImpact = useMemo(() => new THREE.Vector3(2.5, 2.0, 1.2), []);

  useFrame(() => {
    if (bulletRef.current) {
      const progress = Math.max(0, Math.min(1, (currentTime % 100) / 100));
      bulletRef.current.position.lerpVectors(sniperStart, victimImpact, progress);
    }
  });

  return (
    <group>
      {/* 7.62mm Sniper Trajectory Ray */}
      <Line
        points={[sniperStart.toArray(), victimImpact.toArray()]}
        color="#ff1744"
        lineWidth={4}
        dashed={true}
        dashScale={10}
      />

      {/* Animated Projectile Bullet Mesh */}
      <mesh ref={bulletRef} position={sniperStart.toArray()}>
        <Sphere args={[0.15, 16, 16]}>
          <meshBasicMaterial color="#ffffff" />
        </Sphere>
      </mesh>

      {/* Entry Wound Impact Marker */}
      <group
        position={victimImpact.toArray()}
        onClick={() =>
          onSelectObject?.(
            'SCAPULAR_WOUND',
            'Scapular Gunshot Entry Wound',
            'Autopsy Report #881 (Dr. Neha Patwardhan): 7.62mm scapular bullet wound inflicted BEFORE 45m cliff fall.'
          )
        }
      >
        <Sphere args={[0.22, 32, 32]}>
          <meshStandardMaterial color="#ff1744" emissive="#ff1744" emissiveIntensity={0.9} />
        </Sphere>
        <Text position={[0, 0.5, 0]} fontSize={0.28} color="#ffb4ac" anchorX="center">
          7.62mm Scapular Entry Wound (Angle: 34.2°)
        </Text>
      </group>
    </group>
  );
};

// ==========================================
// 2. CINEMATIC CAMERA CONTROLLER COMPONENT
// ==========================================
const CinematicCameraController: React.FC<{
  cinematicMode?: CinematicCameraMode;
  cameraPreset: SimulationState['cameraPreset'];
  activeScene?: InvestigationScene;
  currentTime: number;
}> = ({ cinematicMode, cameraPreset, activeScene, currentTime }) => {
  const controlsRef = useRef<any>(null!);

  useFrame(({ camera, clock }) => {
    const t = clock.getElapsedTime();

    if (cinematicMode === 'CINEMATIC_ORBIT') {
      const radius = 12;
      camera.position.x = Math.cos(t * 0.25) * radius;
      camera.position.z = Math.sin(t * 0.25) * radius;
      camera.position.y = 7;
      camera.lookAt(0, 1, 0);
    } else if (cinematicMode === 'SLOW_MOTION_BALLISTIC') {
      const progress = Math.max(0, Math.min(1, (currentTime % 100) / 100));
      const bulletX = -8.5 + progress * 11.0;
      const bulletY = 3.8 - progress * 1.8;
      const bulletZ = -4.5 + progress * 5.7;

      camera.position.set(bulletX - 2, bulletY + 1.2, bulletZ + 2);
      camera.lookAt(bulletX, bulletY, bulletZ);
    }
  });

  return null;
};

// ==========================================
// 3. MAIN 3D CANVAS & SCENE ROUTER COMPONENT
// ==========================================
export const Scene3DCanvas: React.FC<Scene3DCanvasProps> = ({
  simulationState,
  reconData,
  activeStageIndex,
  cinematicMode,
  onSelectObject,
  onOcclusionUpdate
}) => {
  const { cameraPreset, lightingMode, showMeasurements, currentTime, isPlaying } = simulationState;

  // Active stage dataset lookup
  const activeScene: InvestigationScene | undefined = useMemo(() => {
    if (reconData?.scenes && reconData.scenes.length >= activeStageIndex) {
      return reconData.scenes[activeStageIndex - 1];
    }
    return undefined;
  }, [reconData, activeStageIndex]);

  // Camera settings
  const cameraSettings = useMemo(() => {
    const defaultCam = activeScene?.cameraDefault || { position: [-10, 8, 10], target: [0, 1.5, 0] };

    switch (cameraPreset) {
      case 'TOP':
        return { position: [0, 14, 0] as [number, number, number], fov: 45, target: defaultCam.target };
      case 'FRONT':
        return { position: [0, 3, 12] as [number, number, number], fov: 50, target: defaultCam.target };
      case 'BULLET_CAM':
        return { position: [-8.5, 3.8, -4.5] as [number, number, number], fov: 40, target: [2.5, 2.0, 1.2] as [number, number, number] };
      case 'ISOMETRIC':
      default:
        return { position: defaultCam.position as [number, number, number], fov: 50, target: defaultCam.target as [number, number, number] };
    }
  }, [cameraPreset, activeScene]);

  return (
    <div className="w-full h-full relative select-none bg-[#070a12] rounded-lg overflow-hidden border border-primary/40 shadow-[0_0_30px_rgba(0,0,0,0.9)]">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={cameraSettings.position} fov={cameraSettings.fov} />
        <OrbitControls
          makeDefault
          target={cameraSettings.target}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={3}
          maxDistance={30}
        />

        <CinematicCameraController
          cinematicMode={cinematicMode}
          cameraPreset={cameraPreset}
          activeScene={activeScene}
          currentTime={currentTime}
        />

        {/* Dynamic Multi-Spectral Lighting Modes */}
        {lightingMode === 'UV' ? (
          <>
            <ambientLight intensity={0.1} color="#0d1b2a" />
            <pointLight position={[0, 4, 0]} intensity={3.5} color="#3a0ca3" distance={15} />
            <pointLight position={[1.8, 1.5, 0.5]} intensity={2.0} color="#00ffff" distance={6} />
          </>
        ) : lightingMode === 'INFRARED' ? (
          <>
            <ambientLight intensity={0.2} color="#38040e" />
            <pointLight position={[-2.4, 2, 3.1]} intensity={4.0} color="#ff0000" distance={10} />
            <pointLight position={[1.8, 1.5, 0.5]} intensity={3.0} color="#ff4d4d" distance={8} />
          </>
        ) : (
          <>
            <ambientLight intensity={0.65} color="#ffffff" />
            <directionalLight position={[10, 15, 10]} intensity={1.2} castShadow />
            <pointLight position={[-2.4, 3, 3.1]} intensity={0.8} color="#ff544c" />
          </>
        )}

        {/* Dynamic Scene Environment Switcher */}
        {activeStageIndex === 1 && (
          <RestaurantScene
            lightingMode={lightingMode}
            characters={activeScene?.characters || []}
            objects={activeScene?.objects || []}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onSelectObject={onSelectObject}
          />
        )}

        {activeStageIndex === 2 && (
          <ResortScene
            lightingMode={lightingMode}
            characters={activeScene?.characters || []}
            objects={activeScene?.objects || []}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onSelectObject={onSelectObject}
          />
        )}

        {activeStageIndex === 3 && (
          <RoadScene
            lightingMode={lightingMode}
            characters={activeScene?.characters || []}
            objects={activeScene?.objects || []}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onSelectObject={onSelectObject}
          />
        )}

        {activeStageIndex === 4 && (
          <CafeScene
            lightingMode={lightingMode}
            characters={activeScene?.characters || []}
            objects={activeScene?.objects || []}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onSelectObject={onSelectObject}
          />
        )}

        {activeStageIndex === 5 && (
          <>
            <LohegaonCliffScene
              lightingMode={lightingMode}
              characters={activeScene?.characters || []}
              objects={activeScene?.objects || []}
              currentTime={currentTime}
              isPlaying={isPlaying}
              onSelectObject={onSelectObject}
            />
            <Stage5Ballistics
              simulationState={simulationState}
              reconData={reconData}
              onSelectObject={onSelectObject}
            />
          </>
        )}

        {/* Tactical Distance Measurement Grid */}
        {showMeasurements && (
          <group position={[0, 0.01, 0]}>
            <Grid
              args={[20, 20]}
              cellSize={1}
              cellThickness={1}
              cellColor="#ff544c"
              sectionSize={4}
              sectionThickness={1.5}
              sectionColor="#ffb4ac"
              fadeDistance={30}
              fadeStrength={1}
            />
          </group>
        )}
      </Canvas>
    </div>
  );
};

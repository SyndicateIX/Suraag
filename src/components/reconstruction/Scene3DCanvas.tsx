import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Text, Line, Sphere, Box, MeshReflectorMaterial, Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import { SimulationState } from '../../types';

interface Scene3DCanvasProps {
  simulationState: SimulationState;
  onSelectObject?: (objId: string, label: string, details: string) => void;
}

const RoomGeometry: React.FC<{
  lightingMode: SimulationState['lightingMode'];
  onSelectObject?: (objId: string, label: string, details: string) => void;
}> = ({ lightingMode, onSelectObject }) => {
  const wallMaterialProps = useMemo(() => {
    if (lightingMode === 'UV') {
      return { color: '#0b162c', emissive: '#1d3557', roughness: 0.8, wireframe: false };
    }
    if (lightingMode === 'INFRARED') {
      return { color: '#2a0808', emissive: '#4a0e17', roughness: 0.9, wireframe: false };
    }
    if (lightingMode === 'WIREFRAME') {
      return { color: '#ff544c', wireframe: true };
    }
    return { color: '#1a1a1a', roughness: 0.7, wireframe: false };
  }, [lightingMode]);

  return (
    <group>
      {/* Floor with reflective material */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial {...wallMaterialProps} color={lightingMode === 'UV' ? '#070d18' : '#111111'} />
      </mesh>

      {/* Back Wall (Wall A) */}
      <mesh position={[0, 2.5, -8]} receiveShadow>
        <boxGeometry args={[16, 5, 0.2]} />
        <meshStandardMaterial {...wallMaterialProps} />
      </mesh>

      {/* Left Wall (Wall B - North Doorway Area where Dr. Vance claimed to stand) */}
      <mesh
        position={[-8, 2.5, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
        onClick={() =>
          onSelectObject?.(
            'WALL_B_DOOR',
            'North Doorway (Wall B Corridor)',
            'Claimed witness position of Dr. Julian Vance at 23:14:00 UTC.'
          )
        }
      >
        <boxGeometry args={[16, 5, 0.2]} />
        <meshStandardMaterial {...wallMaterialProps} color={lightingMode === 'UV' ? '#1a2c4e' : '#1f1f1f'} />
      </mesh>

      {/* North Doorway Frame Highlight on Wall B */}
      <mesh position={[-7.8, 1.5, -2]}>
        <boxGeometry args={[0.3, 3, 1.6]} />
        <meshStandardMaterial color="#ff544c" emissive="#ff544c" emissiveIntensity={0.3} />
      </mesh>
      <Text position={[-7.5, 3.3, -2]} rotation={[0, Math.PI / 2, 0]} fontSize={0.3} color="#ffb4ac" anchorX="center">
        North Doorway (Wall B)
      </Text>

      {/* Structural Server Racks & Columns that Occlude Line-of-Sight */}
      {/* Server Rack #4 (The Primary Occlusion Obstacle) */}
      <mesh
        position={[-4, 1.8, -1]}
        castShadow
        receiveShadow
        onClick={() =>
          onSelectObject?.(
            'SERVER_RACK_4',
            'Structural Server Rack #4 (Occlusion Obstacle)',
            'Blocks 100% raycast visibility from Wall B North Doorway to Vault Lock.'
          )
        }
      >
        <boxGeometry args={[1.2, 3.6, 2.4]} />
        <meshStandardMaterial color={lightingMode === 'WIREFRAME' ? '#ab8985' : '#252525'} roughness={0.4} />
      </mesh>
      <Text position={[-4, 3.8, -1]} fontSize={0.25} color="#ff544c" anchorX="center">
        Server Rack #4 (Occlusion Block)
      </Text>

      {/* Additional Vault Columns */}
      <mesh position={[2, 2.5, -3]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.5, 5, 16]} />
        <meshStandardMaterial color="#2c2c2c" />
      </mesh>
      <mesh position={[2, 2.5, 3]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.5, 5, 16]} />
        <meshStandardMaterial color="#2c2c2c" />
      </mesh>
    </group>
  );
};

const BallisticTrajectoryLab: React.FC<{
  simulationState: SimulationState;
  onSelectObject?: (objId: string, label: string, details: string) => void;
}> = ({ simulationState, onSelectObject }) => {
  const { isPlaying, currentTime, playbackSpeed, lightingMode, showVisibilityCone } = simulationState;
  const bulletRef = useRef<THREE.Mesh>(null!);

  const startVec = useMemo(() => new THREE.Vector3(-2.4, 1.7, 3.1), []);
  const impactVec = useMemo(() => new THREE.Vector3(1.8, 1.2, 0.5), []);
  const ricochetVec = useMemo(() => new THREE.Vector3(4.5, 0.4, -2.0), []);

  // Animate bullet moving along path if simulation is playing
  useFrame((_, delta) => {
    if (isPlaying && bulletRef.current) {
      const progress = (currentTime % 100) / 100;
      bulletRef.current.position.lerpVectors(startVec, impactVec, progress);
    }
  });

  return (
    <group>
      {/* 1. Attacker Position Node (Elevated Walkway Area) */}
      <group
        position={[-2.4, 1.7, 3.1]}
        onClick={() =>
          onSelectObject?.(
            'ATTACKER_NODE',
            'Attacker Estimated Coordinate',
            '[X: -2.4m, Y: 1.7m, Z: 3.1m] Elev: +1.7m above floor plane. Suppressed 9mm discharge point.'
          )
        }
      >
        <Sphere args={[0.25, 32, 32]}>
          <meshStandardMaterial color="#ff544c" emissive="#ff544c" emissiveIntensity={0.8} />
        </Sphere>
        {/* Pulsing ring around attacker */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.65, 0]}>
          <ringGeometry args={[0.4, 0.55, 32]} />
          <meshBasicMaterial color="#ff544c" side={THREE.DoubleSide} />
        </mesh>
        <Text position={[0, 0.6, 0]} fontSize={0.3} color="#ffb4ac" anchorX="center" anchorY="bottom">
          Attacker Origin [-2.4, 1.7, 3.1]
        </Text>
      </group>

      {/* 2. Victim & Primary Impact Point */}
      <group
        position={[1.8, 1.2, 0.5]}
        onClick={() =>
          onSelectObject?.(
            'IMPACT_POINT',
            'Victim & Wall Impact Point',
            '[X: 1.8m, Y: 1.2m, Z: 0.5m] Entry angle 34.2° downward. Subsonic bullet struck wall structure.'
          )
        }
      >
        <Sphere args={[0.2, 32, 32]}>
          <meshStandardMaterial color="#e53935" emissive="#e53935" emissiveIntensity={0.6} />
        </Sphere>
        <Text position={[0, 0.5, 0]} fontSize={0.28} color="#ffb4ac" anchorX="center">
          Primary Impact Point (Angle: 34.2°)
        </Text>
      </group>

      {/* 3. Ballistic Bullet Trajectory Laser Ray */}
      <Line
        points={[startVec.toArray(), impactVec.toArray()]}
        color="#ff544c"
        lineWidth={3.5}
        dashed={false}
      />
      {/* Ricochet Line */}
      <Line
        points={[impactVec.toArray(), ricochetVec.toArray()]}
        color="#ffb4ac"
        lineWidth={2}
        dashed={true}
        dashScale={5}
      />

      {/* Animated Projectile Bullet Mesh */}
      <mesh ref={bulletRef} position={[-2.4, 1.7, 3.1]}>
        <Sphere args={[0.1, 16, 16]}>
          <meshBasicMaterial color="#ffffff" />
        </Sphere>
      </mesh>

      {/* 4. High-Velocity Blood Spatter Droplets (UV Luminescence when UV mode is on) */}
      <group position={[1.8, 0.1, 0.5]}>
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i / 24) * Math.PI * 2;
          const dist = 0.3 + (i % 5) * 0.25;
          const x = Math.cos(angle) * dist;
          const z = Math.sin(angle) * dist;
          return (
            <mesh
              key={i}
              position={[x, 0.02, z]}
              rotation={[-Math.PI / 2, 0, angle]}
              onClick={() =>
                onSelectObject?.(
                  'BLOOD_SPATTER',
                  'High-Velocity Arterial Blood Spatter',
                  `Droplet #${i + 1} ellipsoid ratio confirms origin launch vector.`
                )
              }
            >
              <circleGeometry args={[0.06 + (i % 3) * 0.03, 16]} />
              <meshBasicMaterial
                color={lightingMode === 'UV' ? '#00ffff' : '#8b0000'}
              />
            </mesh>
          );
        })}
        <Text position={[0, 0.4, 0]} fontSize={0.24} color={lightingMode === 'UV' ? '#00ffff' : '#e53935'}>
          {lightingMode === 'UV' ? '✦ UV BLOOD LUMINESCENCE ✦' : 'Blood Spatter Pool (Type O+)'}
        </Text>
      </group>

      {/* 5. Recovered Glock 19 Pistol Node near Ventilation Duct */}
      <group
        position={[3.2, 0.15, -4.5]}
        onClick={() =>
          onSelectObject?.(
            'GLOCK_19',
            'Recovered Glock 19 Gen 5 Pistol',
            'Recovered inside North ventilation duct. Ballistics match spent 9mm casing.'
          )
        }
      >
        <Box args={[0.4, 0.15, 0.2]}>
          <meshStandardMaterial color="#444444" metalness={0.8} />
        </Box>
        <Text position={[0, 0.4, 0]} fontSize={0.25} color="#ffb4ac">
          [EV-1] Glock 19 Pistol
        </Text>
      </group>

      {/* 6. 3D Line-of-Sight Occlusion Cone & Raycast Vectors */}
      {showVisibilityCone && (
        <group>
          {/* Occlusion Ray aiming from North Doorway towards Vault Lock */}
          <group position={[-7.5, 1.7, -2]}>
            <Line
              points={[
                [0, 0, 0],
                [3.5, 0.1, 1.0], // hits Server Rack #4 at [-4, 1.8, -1]
              ]}
              color="#e53935"
              lineWidth={3}
              dashed
            />
            <Text position={[1.8, 0.4, 0.5]} fontSize={0.26} color="#e53935" anchorX="center">
              ⚠ OCCLUSIONAL RAYCAST: STRUCTURAL BLOCKAGE (0% VISIBILITY)
            </Text>
          </group>

          {/* Unobstructed Sniper / Attacker Line of Sight Vector */}
          <group position={[-2.4, 1.7, 3.1]}>
            <Line
              points={[
                [0, 0, 0],
                [4.2, -0.5, -2.6]
              ]}
              color="#00ffcc"
              lineWidth={2}
              dashed={false}
            />
            <Text position={[2.1, 0.3, -1.3]} fontSize={0.24} color="#00ffcc" anchorX="center">
              ✔ CLEAR BALLISTIC LINE OF SIGHT (100% VISIBILITY)
            </Text>
          </group>
        </group>
      )}
    </group>
  );
};

export const Scene3DCanvas: React.FC<Scene3DCanvasProps> = ({
  simulationState,
  onSelectObject,
}) => {
  const { cameraPreset, lightingMode, showMeasurements } = simulationState;

  const cameraSettings = useMemo(() => {
    switch (cameraPreset) {
      case 'TOP':
        return { position: [0, 14, 0] as [number, number, number], fov: 45 };
      case 'FRONT':
        return { position: [0, 3, 12] as [number, number, number], fov: 50 };
      case 'BULLET_CAM':
        return { position: [-3.5, 2.2, 4.5] as [number, number, number], fov: 40 };
      case 'ISOMETRIC':
      default:
        return { position: [-10, 8, 10] as [number, number, number], fov: 50 };
    }
  }, [cameraPreset]);

  return (
    <div className="w-full h-full relative select-none bg-[#090b10] rounded-lg overflow-hidden border border-primary/40 shadow-[0_0_30px_rgba(0,0,0,0.9)]">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={cameraSettings.position} fov={cameraSettings.fov} />
        <OrbitControls
          makeDefault
          target={[0, 1.5, 0]}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={3}
          maxDistance={25}
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
            <ambientLight intensity={0.6} color="#ffffff" />
            <directionalLight position={[10, 15, 10]} intensity={1.2} castShadow />
            <pointLight position={[-2.4, 3, 3.1]} intensity={0.8} color="#ff544c" />
          </>
        )}

        {/* Room Architectural Geometry */}
        <RoomGeometry lightingMode={lightingMode} onSelectObject={onSelectObject} />

        {/* Ballistics, Trajectory Ray, Blood Spatter, Line of Sight Cone */}
        <BallisticTrajectoryLab simulationState={simulationState} onSelectObject={onSelectObject} />

        {/* Precision Tactical Distance Measurement Grid & Ruler */}
        {showMeasurements && (
          <group position={[0, 0.01, 0]}>
            <Grid
              args={[16, 16]}
              cellSize={1}
              cellThickness={1}
              cellColor="#ff544c"
              sectionSize={4}
              sectionThickness={1.5}
              sectionColor="#ffb4ac"
              fadeDistance={25}
              fadeStrength={1}
            />
          </group>
        )}
      </Canvas>
    </div>
  );
};

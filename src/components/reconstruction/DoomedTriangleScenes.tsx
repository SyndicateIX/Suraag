import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere, Box, Cylinder, Line } from '@react-three/drei';
import * as THREE from 'three';
import {
  SceneCharacter,
  SceneObject,
  SimulationState,
  CharacterAnimationState,
  CharacterWaypoint
} from '../../types';

interface SceneProps {
  lightingMode: SimulationState['lightingMode'];
  characters: SceneCharacter[];
  objects: SceneObject[];
  currentTime: number;
  isPlaying: boolean;
  onSelectObject?: (objId: string, label: string, details: string) => void;
}

// ==========================================
// 1. WAYPOINT KINEMATIC INTERPOLATION ENGINE
// ==========================================
export function computeCharacterPoseAtTime(
  character: SceneCharacter,
  progress: number // 0.0 to 1.0
): {
  position: [number, number, number];
  headingAngle: number;
  animationState: CharacterAnimationState;
  attachedItem?: string;
} {
  const waypoints = character.waypoints;
  if (!waypoints || waypoints.length === 0) {
    return {
      position: character.position,
      headingAngle: 0,
      animationState: 'IDLE',
      attachedItem: character.attachedItem
    };
  }

  // Clamped progress
  const p = Math.max(0, Math.min(1, progress));

  if (p <= waypoints[0].timeProgress) {
    return {
      position: waypoints[0].position,
      headingAngle: waypoints[0].headingAngle || 0,
      animationState: waypoints[0].animationState,
      attachedItem: waypoints[0].attachedItem || character.attachedItem
    };
  }

  if (p >= waypoints[waypoints.length - 1].timeProgress) {
    const lastWp = waypoints[waypoints.length - 1];
    return {
      position: lastWp.position,
      headingAngle: lastWp.headingAngle || 0,
      animationState: lastWp.animationState,
      attachedItem: lastWp.attachedItem || character.attachedItem
    };
  }

  // Find segment
  let idx = 0;
  while (idx < waypoints.length - 1 && waypoints[idx + 1].timeProgress < p) {
    idx++;
  }

  const wp1 = waypoints[idx];
  const wp2 = waypoints[idx + 1];

  const segDuration = wp2.timeProgress - wp1.timeProgress;
  const segT = segDuration > 0 ? (p - wp1.timeProgress) / segDuration : 0;

  // Lerp position
  const x = wp1.position[0] + (wp2.position[0] - wp1.position[0]) * segT;
  const y = wp1.position[1] + (wp2.position[1] - wp1.position[1]) * segT;
  const z = wp1.position[2] + (wp2.position[2] - wp1.position[2]) * segT;

  const h1 = wp1.headingAngle || 0;
  const h2 = wp2.headingAngle || 0;
  const headingAngle = h1 + (h2 - h1) * segT;

  return {
    position: [x, y, z],
    headingAngle,
    animationState: wp1.animationState,
    attachedItem: wp1.attachedItem || character.attachedItem
  };
}

// ==========================================
// 2. PROCEDURAL ARTICULATED HUMANOID RIG
// ==========================================
export const AnimatedHumanoidRig: React.FC<{
  character: SceneCharacter;
  currentTime: number;
  onSelectObject?: (objId: string, label: string, details: string) => void;
}> = ({ character, currentTime, onSelectObject }) => {
  const progress = (currentTime % 100) / 100;
  const pose = computeCharacterPoseAtTime(character, progress);
  const [x, y, z] = pose.position;

  // Joint Refs for Procedural Kinematic Animation
  const groupRef = useRef<THREE.Group>(null!);
  const leftArmRef = useRef<THREE.Group>(null!);
  const rightArmRef = useRef<THREE.Group>(null!);
  const leftLegRef = useRef<THREE.Group>(null!);
  const rightLegRef = useRef<THREE.Group>(null!);
  const torsoRef = useRef<THREE.Group>(null!);
  const headRef = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (!torsoRef.current) return;

    // Reset default transforms
    torsoRef.current.position.set(0, 0.45, 0);
    torsoRef.current.rotation.set(0, 0, 0);
    if (headRef.current) headRef.current.rotation.set(0, 0, 0);

    // Apply procedural kinematics according to active animation state
    switch (pose.animationState) {
      case 'WALK': {
        const gait = Math.sin(t * 8);
        if (leftLegRef.current) leftLegRef.current.rotation.x = gait * 0.45;
        if (rightLegRef.current) rightLegRef.current.rotation.x = -gait * 0.45;
        if (leftArmRef.current) leftArmRef.current.rotation.x = -gait * 0.4;
        if (rightArmRef.current) rightArmRef.current.rotation.x = gait * 0.4;
        torsoRef.current.position.y = 0.45 + Math.abs(Math.sin(t * 16)) * 0.04;
        break;
      }

      case 'RUN': {
        const gait = Math.sin(t * 14);
        if (leftLegRef.current) leftLegRef.current.rotation.x = gait * 0.75;
        if (rightLegRef.current) rightLegRef.current.rotation.x = -gait * 0.75;
        if (leftArmRef.current) leftArmRef.current.rotation.x = -gait * 0.7;
        if (rightArmRef.current) rightArmRef.current.rotation.x = gait * 0.7;
        torsoRef.current.rotation.x = 0.35; // Lean forward
        torsoRef.current.position.y = 0.42 + Math.abs(Math.sin(t * 28)) * 0.08;
        break;
      }

      case 'SIT': {
        torsoRef.current.position.y = 0.22; // Lower hip
        if (leftLegRef.current) leftLegRef.current.rotation.x = -Math.PI / 2.2;
        if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.PI / 2.2;
        if (leftArmRef.current) leftArmRef.current.rotation.x = -Math.PI / 4;
        if (rightArmRef.current) rightArmRef.current.rotation.x = -Math.PI / 4;
        break;
      }

      case 'AIM': {
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -Math.PI / 2;
          rightArmRef.current.rotation.y = 0.1;
        }
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = -Math.PI / 2.3;
          leftArmRef.current.rotation.y = -0.3;
        }
        torsoRef.current.rotation.y = 0.2;
        break;
      }

      case 'PUSH': {
        const pushThrust = Math.sin(t * 12);
        if (leftArmRef.current) leftArmRef.current.rotation.x = -Math.PI / 2 + pushThrust * 0.2;
        if (rightArmRef.current) rightArmRef.current.rotation.x = -Math.PI / 2 + pushThrust * 0.2;
        torsoRef.current.rotation.x = 0.4;
        break;
      }

      case 'ATTACK': {
        const attackCycle = Math.sin(t * 10);
        if (rightArmRef.current) rightArmRef.current.rotation.x = -Math.PI / 1.5 + attackCycle * 0.5;
        torsoRef.current.rotation.y = attackCycle * 0.3;
        break;
      }

      case 'TURN': {
        if (headRef.current) headRef.current.rotation.y = Math.sin(t * 4) * 0.6;
        torsoRef.current.rotation.y = Math.sin(t * 4) * 0.2;
        break;
      }

      case 'FALL': {
        torsoRef.current.rotation.x = -Math.PI / 3;
        torsoRef.current.rotation.z = Math.sin(t * 10) * 0.5;
        if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(t * 12) * 0.6;
        if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.sin(t * 12) * 0.6;
        break;
      }

      case 'DEATH': {
        torsoRef.current.position.y = -0.25;
        torsoRef.current.rotation.x = -Math.PI / 2; // Flat on floor
        if (leftArmRef.current) leftArmRef.current.rotation.z = 0.8;
        if (rightArmRef.current) rightArmRef.current.rotation.z = -0.8;
        break;
      }

      case 'IDLE':
      default: {
        const breath = Math.sin(t * 3) * 0.03;
        torsoRef.current.position.y = 0.45 + breath;
        if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * 3) * 0.08;
        if (rightArmRef.current) rightArmRef.current.rotation.x = -Math.sin(t * 3) * 0.08;
        if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
        if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
        break;
      }
    }
  });

  return (
    <group
      ref={groupRef}
      position={[x, y, z]}
      rotation={[0, pose.headingAngle, 0]}
      onClick={() =>
        onSelectObject?.(
          character.id,
          `${character.name} (${character.role})`,
          `Animation State: ${pose.animationState} // Activity: ${character.activity}`
        )
      }
    >
      {/* Torso Pivot Group */}
      <group ref={torsoRef} position={[0, 0.45, 0]}>
        {/* Chest Mesh */}
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[0.36, 0.45, 0.22]} />
          <meshStandardMaterial color={character.color} roughness={0.4} />
        </mesh>

        {/* Head & Neck Group */}
        <group ref={headRef} position={[0, 0.58, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.16, 16, 16]} />
            <meshStandardMaterial color={character.color} emissive={character.color} emissiveIntensity={0.3} />
          </mesh>
          {/* Face Visor / Eyes Orientation */}
          <mesh position={[0, 0.02, 0.14]}>
            <boxGeometry args={[0.18, 0.06, 0.04]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>

        {/* Left Arm Assembly */}
        <group ref={leftArmRef} position={[-0.23, 0.4, 0]}>
          <mesh position={[0, -0.2, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.05, 0.4, 12]} />
            <meshStandardMaterial color={character.color} />
          </mesh>
        </group>

        {/* Right Arm Assembly & Item Attachment Anchor */}
        <group ref={rightArmRef} position={[0.23, 0.4, 0]}>
          <mesh position={[0, -0.2, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.05, 0.4, 12]} />
            <meshStandardMaterial color={character.color} />
          </mesh>

          {/* Right Hand Attached Items */}
          {pose.attachedItem === 'POISON_BOTTLE' && (
            <group position={[0, -0.42, 0.05]}>
              <Cylinder args={[0.04, 0.04, 0.15, 12]}>
                <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={0.8} />
              </Cylinder>
            </group>
          )}

          {pose.attachedItem === 'TACTICAL_KNIFE' && (
            <group position={[0, -0.42, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
              <Box args={[0.04, 0.35, 0.06]}>
                <meshStandardMaterial color="#ff1744" emissive="#ff1744" emissiveIntensity={0.9} />
              </Box>
            </group>
          )}

          {pose.attachedItem === 'SNIPER_RIFLE' && (
            <group position={[0, -0.2, 0.3]} rotation={[0, 0, 0]}>
              <Box args={[0.08, 0.12, 0.9]}>
                <meshStandardMaterial color="#e53935" metalness={0.8} />
              </Box>
              {/* Barrel */}
              <Cylinder args={[0.02, 0.02, 0.6, 12]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.6]}>
                <meshStandardMaterial color="#111111" />
              </Cylinder>
            </group>
          )}
        </group>

        {/* Left Leg Assembly */}
        <group ref={leftLegRef} position={[-0.1, -0.05, 0]}>
          <mesh position={[0, -0.22, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.06, 0.45, 12]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
        </group>

        {/* Right Leg Assembly */}
        <group ref={rightLegRef} position={[0.1, -0.05, 0]}>
          <mesh position={[0, -0.22, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.06, 0.45, 12]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
        </group>
      </group>

      {/* Role Floor Ring Indicator */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.35, 0.45, 32]} />
        <meshBasicMaterial color={character.color} side={THREE.DoubleSide} />
      </mesh>

      {/* Floating Name & Activity Tag */}
      <Text position={[0, 1.35, 0]} fontSize={0.24} color="#ffffff" anchorX="center" anchorY="bottom">
        {character.name}
      </Text>
      <Text position={[0, 1.15, 0]} fontSize={0.16} color={character.color} anchorX="center" anchorY="bottom">
        [{pose.animationState}] {character.role}
      </Text>
    </group>
  );
};

// ==========================================
// STAGE 1: OLIVE TERRACE RESTAURANT (APRIL 14)
// ==========================================
export const RestaurantScene: React.FC<SceneProps> = ({
  lightingMode,
  characters,
  objects,
  currentTime,
  onSelectObject
}) => {
  // Stage 1 Kinematic Waypoint Definitions
  const stage1Characters: SceneCharacter[] = useMemo(() => {
    return [
      {
        id: 'DIYA',
        name: 'Diya Gupta',
        role: 'SUSPECT',
        position: [-1.2, 0, 0.5],
        color: '#ff544c',
        activity: 'Administering Thallium sulphate in red wine',
        waypoints: [
          { timeProgress: 0.0, position: [-6.0, 0, 4.0], animationState: 'WALK', headingAngle: Math.PI / 4 },
          { timeProgress: 0.35, position: [-1.2, 0, 0.5], animationState: 'WALK', headingAngle: Math.PI / 2 },
          { timeProgress: 0.45, position: [-1.2, 0, 0.5], animationState: 'SIT', headingAngle: Math.PI / 2 },
          { timeProgress: 1.0, position: [-1.2, 0, 0.5], animationState: 'SIT', headingAngle: Math.PI / 2 }
        ]
      },
      {
        id: 'KESHAN',
        name: 'Keshan Malhotra',
        role: 'VICTIM',
        position: [1.2, 0, 0.5],
        color: '#00e676',
        activity: 'Consuming poisoned dinner course',
        waypoints: [
          { timeProgress: 0.0, position: [-6.0, 0, 4.0], animationState: 'WALK', headingAngle: Math.PI / 4 },
          { timeProgress: 0.38, position: [1.2, 0, 0.5], animationState: 'WALK', headingAngle: -Math.PI / 2 },
          { timeProgress: 0.48, position: [1.2, 0, 0.5], animationState: 'SIT', headingAngle: -Math.PI / 2 },
          { timeProgress: 1.0, position: [1.2, 0, 0.5], animationState: 'SIT', headingAngle: -Math.PI / 2 }
        ]
      },
      {
        id: 'CHETANY',
        name: 'Chetany Sharma',
        role: 'SUSPECT',
        position: [-5.5, 0, -4.0],
        color: '#e53935',
        activity: 'Purchasing Thallium sulphate at Sanjivani Medico counter',
        waypoints: [
          { timeProgress: 0.0, position: [-8.0, 0, -4.0], animationState: 'WALK', headingAngle: 0 },
          { timeProgress: 0.25, position: [-5.5, 0, -4.0], animationState: 'IDLE', headingAngle: 0, attachedItem: 'POISON_BOTTLE' },
          { timeProgress: 0.65, position: [-5.5, 0, -4.0], animationState: 'IDLE', headingAngle: 0, attachedItem: 'POISON_BOTTLE' },
          { timeProgress: 1.0, position: [-8.5, 0, -4.0], animationState: 'WALK', headingAngle: Math.PI, attachedItem: 'POISON_BOTTLE' }
        ]
      }
    ];
  }, []);

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial color={lightingMode === 'UV' ? '#060d19' : '#1a100c'} roughness={0.6} />
      </mesh>

      {/* Restaurant Table 4 */}
      <group
        position={[0, 0.45, 0.5]}
        onClick={() =>
          onSelectObject?.('TABLE_4', 'Olive Terrace Table 4', 'Reserved by Diya Gupta. Location of initial acute Thallium sulphate poisoning.')
        }
      >
        <cylinderGeometry args={[1.2, 1.2, 0.1, 32]} />
        <meshStandardMaterial color="#3e2723" roughness={0.3} />
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.8, 16]} />
          <meshStandardMaterial color="#1a0c08" />
        </mesh>
      </group>

      <Text position={[0, 1.6, 0.5]} fontSize={0.28} color="#ff544c" anchorX="center">
        Olive Terrace Table 4 (Poisoning Site)
      </Text>

      {/* Sanjivani Pharmacy Counter */}
      <group position={[-5.5, 0.5, -4.0]}>
        <Box args={[2.5, 1.0, 0.8]}>
          <meshStandardMaterial color="#00bcd4" opacity={0.8} transparent />
        </Box>
        <Text position={[0, 0.9, 0]} fontSize={0.22} color="#00bcd4">
          Sanjivani Medico Counter (EVID-004)
        </Text>
      </group>

      {/* Characters */}
      {stage1Characters.map((c) => (
        <AnimatedHumanoidRig key={c.id} character={c} currentTime={currentTime} onSelectObject={onSelectObject} />
      ))}

      {/* Objects */}
      {objects.map((obj) => (
        <group
          key={obj.id}
          position={obj.position}
          onClick={() => onSelectObject?.(obj.id, obj.label, obj.details)}
        >
          <Sphere args={[0.12, 16, 16]}>
            <meshStandardMaterial color="#ff544c" emissive="#ff544c" emissiveIntensity={0.8} />
          </Sphere>
          <Text position={[0, 0.3, 0]} fontSize={0.2} color="#ffb4ac">
            {obj.label}
          </Text>
        </group>
      ))}
    </group>
  );
};

// ==========================================
// STAGE 2: SKYLINE RESORT ROOM 304 (MAY 13)
// ==========================================
export const ResortScene: React.FC<SceneProps> = ({
  lightingMode,
  characters,
  objects,
  currentTime,
  onSelectObject
}) => {
  const stage2Characters: SceneCharacter[] = useMemo(() => {
    return [
      {
        id: 'CHETANY',
        name: 'Chetany Sharma',
        role: 'SUSPECT',
        position: [-3.2, 0, -1.0],
        color: '#e53935',
        activity: 'Stealth corridor entry & tactical knife assault',
        waypoints: [
          { timeProgress: 0.0, position: [-8.0, 0, -1.0], animationState: 'WALK', headingAngle: Math.PI / 2, attachedItem: 'TACTICAL_KNIFE' },
          { timeProgress: 0.35, position: [-3.2, 0, -1.0], animationState: 'ATTACK', headingAngle: Math.PI / 2, attachedItem: 'TACTICAL_KNIFE' },
          { timeProgress: 0.55, position: [-2.2, 0, -1.0], animationState: 'IDLE', headingAngle: Math.PI },
          { timeProgress: 1.0, position: [-9.0, 0, -1.0], animationState: 'RUN', headingAngle: -Math.PI / 2 }
        ]
      },
      {
        id: 'KESHAN',
        name: 'Keshan Malhotra',
        role: 'VICTIM',
        position: [2.0, 0, 0.5],
        color: '#00e676',
        activity: 'Wounded inside Room 304',
        waypoints: [
          { timeProgress: 0.0, position: [2.0, 0, 0.5], animationState: 'SIT', headingAngle: 0 },
          { timeProgress: 0.4, position: [2.0, 0, 0.5], animationState: 'ATTACK', headingAngle: -Math.PI / 2 },
          { timeProgress: 1.0, position: [2.0, 0, 0.5], animationState: 'IDLE', headingAngle: 0 }
        ]
      },
      {
        id: 'ARCHITA',
        name: 'Archita Deshmukh (WIT-001)',
        role: 'WITNESS',
        position: [5.5, 0, -2.5],
        color: '#ab8985',
        activity: 'Observing suspect flee from Room 306 doorway',
        waypoints: [
          { timeProgress: 0.0, position: [5.5, 0, -2.5], animationState: 'IDLE', headingAngle: 0 },
          { timeProgress: 0.5, position: [5.5, 0, -2.5], animationState: 'TURN', headingAngle: -Math.PI / 4 },
          { timeProgress: 1.0, position: [5.5, 0, -2.5], animationState: 'TURN', headingAngle: -Math.PI / 4 }
        ]
      }
    ];
  }, []);

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial color={lightingMode === 'UV' ? '#09152b' : '#141414'} roughness={0.7} />
      </mesh>

      {/* Corridor 300 Wall */}
      <mesh position={[0, 2.5, -3]}>
        <boxGeometry args={[16, 5, 0.2]} />
        <meshStandardMaterial color="#222222" />
      </mesh>

      {/* Room 304 Door Frame */}
      <mesh position={[1.2, 1.5, -2.9]}>
        <boxGeometry args={[1.5, 3, 0.3]} />
        <meshStandardMaterial color="#ff544c" emissive="#ff544c" emissiveIntensity={0.3} />
      </mesh>
      <Text position={[1.2, 3.3, -2.7]} fontSize={0.3} color="#ff544c" anchorX="center">
        Skyline Resort Room 304 Door
      </Text>

      {/* Characters */}
      {stage2Characters.map((c) => (
        <AnimatedHumanoidRig key={c.id} character={c} currentTime={currentTime} onSelectObject={onSelectObject} />
      ))}

      {/* Objects */}
      {objects.map((obj) => (
        <group
          key={obj.id}
          position={obj.position}
          onClick={() => onSelectObject?.(obj.id, obj.label, obj.details)}
        >
          <Box args={[0.4, 0.1, 0.1]}>
            <meshStandardMaterial color="#ff544c" emissive="#ff544c" emissiveIntensity={0.6} />
          </Box>
          <Text position={[0, 0.3, 0]} fontSize={0.22} color="#ff544c">
            {obj.label}
          </Text>
        </group>
      ))}
    </group>
  );
};

// ==========================================
// STAGE 3: APEX TECH KHARADI ROAD (JUNE 10)
// ==========================================
export const RoadScene: React.FC<SceneProps> = ({
  lightingMode,
  characters,
  objects,
  currentTime,
  isPlaying,
  onSelectObject
}) => {
  const truckRef = useRef<THREE.Group>(null!);
  const progress = (currentTime % 100) / 100;

  // Truck position & steering curve kinematics
  const truckX = -10.0 + progress * 18.0;
  const truckZ = progress > 0.35 && progress < 0.65 ? Math.sin((progress - 0.35) * Math.PI * 3.3) * 1.5 : 0;
  const truckRotY = progress > 0.35 && progress < 0.65 ? 0.35 : 0;

  const stage3Characters: SceneCharacter[] = useMemo(() => {
    return [
      {
        id: 'KESHAN',
        name: 'Keshan Malhotra',
        role: 'VICTIM',
        position: [2.5, 0, 1.2],
        color: '#00e676',
        activity: 'Pedestrian crossing pavement',
        waypoints: [
          { timeProgress: 0.0, position: [3.5, 0, -3.0], animationState: 'WALK', headingAngle: 0 },
          { timeProgress: 0.45, position: [2.5, 0, 1.2], animationState: 'WALK', headingAngle: 0 },
          { timeProgress: 0.55, position: [3.5, 0.3, 2.2], animationState: 'FALL', headingAngle: Math.PI / 2 },
          { timeProgress: 1.0, position: [3.5, 0.0, 2.5], animationState: 'DEATH', headingAngle: Math.PI / 2 }
        ]
      }
    ];
  }, []);

  return (
    <group>
      {/* Asphalt Road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[22, 10]} />
        <meshStandardMaterial color="#111827" roughness={0.9} />
      </mesh>

      {/* Pedestrian Crossing Lines */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[2.5, 0.01, -3.5 + i * 1.4]}>
          <planeGeometry args={[1.8, 0.6]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* Tata 407 Cargo Truck */}
      <group
        ref={truckRef}
        position={[truckX, 1.2, truckZ]}
        rotation={[0, truckRotY, 0]}
        onClick={() =>
          onSelectObject?.('TRUCK', 'Tata 407 Cargo Truck (MH-12-QX-4412)', 'Vehicle accelerated to 62 km/h into pedestrian zone. Driver: Vikram Rathod.')
        }
      >
        <Box args={[2.2, 1.6, 1.8]} position={[1.0, 0.4, 0]}>
          <meshStandardMaterial color="#ff544c" metalness={0.5} />
        </Box>
        <Box args={[3.2, 1.8, 2.0]} position={[-1.5, 0.5, 0]}>
          <meshStandardMaterial color="#374151" />
        </Box>
        {/* Wheels */}
        <Cylinder args={[0.4, 0.4, 0.3, 16]} rotation={[Math.PI / 2, 0, 0]} position={[1.0, -0.4, 1.0]}>
          <meshStandardMaterial color="#000000" />
        </Cylinder>
        <Cylinder args={[0.4, 0.4, 0.3, 16]} rotation={[Math.PI / 2, 0, 0]} position={[1.0, -0.4, -1.0]}>
          <meshStandardMaterial color="#000000" />
        </Cylinder>
        <Text position={[0, 1.8, 0]} fontSize={0.3} color="#ffb4ac">
          Tata 407 Cargo Truck (EVID-012)
        </Text>
      </group>

      {/* Characters */}
      {stage3Characters.map((c) => (
        <AnimatedHumanoidRig key={c.id} character={c} currentTime={currentTime} onSelectObject={onSelectObject} />
      ))}
    </group>
  );
};

// ==========================================
// STAGE 4: BREW & BEAN CAFÉ (JUNE 19)
// ==========================================
export const CafeScene: React.FC<SceneProps> = ({
  lightingMode,
  characters,
  objects,
  currentTime,
  onSelectObject
}) => {
  const stage4Characters: SceneCharacter[] = useMemo(() => {
    return [
      {
        id: 'DIYA',
        name: 'Diya Gupta',
        role: 'SUSPECT',
        position: [-1.0, 0, 0.4],
        color: '#ff544c',
        activity: 'Reviewing Lohegaon topographic map',
        waypoints: [
          { timeProgress: 0.0, position: [-5.0, 0, 3.0], animationState: 'WALK', headingAngle: Math.PI / 4 },
          { timeProgress: 0.35, position: [-1.0, 0, 0.4], animationState: 'SIT', headingAngle: Math.PI / 2 },
          { timeProgress: 1.0, position: [-1.0, 0, 0.4], animationState: 'SIT', headingAngle: Math.PI / 2 }
        ]
      },
      {
        id: 'CHETANY',
        name: 'Chetany Sharma',
        role: 'SUSPECT',
        position: [1.0, 0, 0.4],
        color: '#e53935',
        activity: 'Confirming sniper ridge vantage point',
        waypoints: [
          { timeProgress: 0.0, position: [-5.0, 0, 3.0], animationState: 'WALK', headingAngle: Math.PI / 4 },
          { timeProgress: 0.38, position: [1.0, 0, 0.4], animationState: 'SIT', headingAngle: -Math.PI / 2 },
          { timeProgress: 1.0, position: [1.0, 0, 0.4], animationState: 'SIT', headingAngle: -Math.PI / 2 }
        ]
      }
    ];
  }, []);

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial color={lightingMode === 'UV' ? '#060d19' : '#1c1917'} roughness={0.6} />
      </mesh>

      {/* Café Table 4 */}
      <group position={[0, 0.45, 0.4]}>
        <cylinderGeometry args={[1.1, 1.1, 0.1, 32]} />
        <meshStandardMaterial color="#78350f" roughness={0.3} />
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.8, 16]} />
          <meshStandardMaterial color="#292524" />
        </mesh>
      </group>

      <Text position={[0, 1.6, 0.4]} fontSize={0.28} color="#ff544c" anchorX="center">
        Brew & Bean Café Table 4 (Conspiracy Planning)
      </Text>

      {/* Characters */}
      {stage4Characters.map((c) => (
        <AnimatedHumanoidRig key={c.id} character={c} currentTime={currentTime} onSelectObject={onSelectObject} />
      ))}
    </group>
  );
};

// ==========================================
// STAGE 5: LOHEGAON HILL SUNSET POINT (JUNE 21)
// ==========================================
export const LohegaonCliffScene: React.FC<SceneProps> = ({
  lightingMode,
  characters,
  objects,
  currentTime,
  onSelectObject
}) => {
  const stage5Characters: SceneCharacter[] = useMemo(() => {
    return [
      {
        id: 'CHETANY',
        name: 'Chetany Sharma (Sniper)',
        role: 'SUSPECT',
        position: [-8.5, 0, -4.5],
        color: '#e53935',
        activity: 'Discharging suppressed Remington 700 rifle from boulder ridge',
        waypoints: [
          { timeProgress: 0.0, position: [-12.0, 0, -4.5], animationState: 'WALK', headingAngle: 0 },
          { timeProgress: 0.25, position: [-8.5, 0, -4.5], animationState: 'SIT', headingAngle: Math.PI / 4 },
          { timeProgress: 0.55, position: [-8.5, 0, -4.5], animationState: 'AIM', headingAngle: Math.PI / 4, attachedItem: 'SNIPER_RIFLE' },
          { timeProgress: 0.65, position: [-8.5, 0, -4.5], animationState: 'ATTACK', headingAngle: Math.PI / 4, attachedItem: 'SNIPER_RIFLE' },
          { timeProgress: 1.0, position: [-14.0, 0, -8.0], animationState: 'RUN', headingAngle: -Math.PI / 2 }
        ]
      },
      {
        id: 'DIYA',
        name: 'Diya Gupta (Mastermind)',
        role: 'SUSPECT',
        position: [1.2, 0, 0.8],
        color: '#ff544c',
        activity: 'Positioning victim near cliff edge & executing push',
        waypoints: [
          { timeProgress: 0.0, position: [-3.0, 0, 4.0], animationState: 'WALK', headingAngle: Math.PI / 4 },
          { timeProgress: 0.45, position: [1.2, 0, 0.8], animationState: 'IDLE', headingAngle: 0 },
          { timeProgress: 0.65, position: [1.2, 0, 0.8], animationState: 'PUSH', headingAngle: 0 },
          { timeProgress: 1.0, position: [1.2, 0, 0.8], animationState: 'IDLE', headingAngle: 0 }
        ]
      },
      {
        id: 'KESHAN',
        name: 'Keshan Malhotra (Victim)',
        role: 'VICTIM',
        position: [2.5, 0, 1.2],
        color: '#00e676',
        activity: 'Struck by 7.62mm bullet & falling 45m',
        waypoints: [
          { timeProgress: 0.0, position: [-3.0, 0, 4.0], animationState: 'WALK', headingAngle: Math.PI / 4 },
          { timeProgress: 0.45, position: [2.5, 0, 1.2], animationState: 'IDLE', headingAngle: 0 },
          { timeProgress: 0.65, position: [2.5, 0, 1.2], animationState: 'IDLE', headingAngle: 0 },
          { timeProgress: 0.85, position: [4.5, -4.5, 1.5], animationState: 'FALL', headingAngle: Math.PI / 2 },
          { timeProgress: 1.0, position: [4.5, -4.5, 1.5], animationState: 'DEATH', headingAngle: Math.PI / 2 }
        ]
      }
    ];
  }, []);

  return (
    <group>
      {/* Ground & Cliff Topography */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial color={lightingMode === 'UV' ? '#09182a' : '#1f2937'} roughness={0.9} />
      </mesh>

      {/* Cliff Edge (45m Ravine Drop) */}
      <mesh position={[4.0, -2.5, 0.0]}>
        <boxGeometry args={[4.0, 5.0, 16.0]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      <Text position={[4.0, 1.2, 0.0]} fontSize={0.35} color="#ff1744" anchorX="center">
        ⚠ 45m CLIFF RAVINE EDGE (Sunset Point)
      </Text>

      {/* Boulder Ridge Sniper Perch */}
      <group position={[-8.5, 2.5, -4.5]}>
        <sphereGeometry args={[2.2, 16, 16]} />
        <meshStandardMaterial color="#374151" roughness={0.9} />
      </group>

      {/* Characters */}
      {stage5Characters.map((c) => (
        <AnimatedHumanoidRig key={c.id} character={c} currentTime={currentTime} onSelectObject={onSelectObject} />
      ))}
    </group>
  );
};

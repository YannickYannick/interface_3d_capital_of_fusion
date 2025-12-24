// Constantes de physique
export const MOUSE_FORCE = 1;
export const MOUSE_RADIUS = 1.5;
export const COLLISION_FORCE = 0.8;
export const DAMPING = 0.5; // Frottements augmentés (plus bas = plus de friction)
export const RETURN_FORCE = 0.015;
export const CAMERA_OFFSET = 3;
export const CAMERA_ANIMATION_DURATION = 1.2;

// Configuration des orbites (chemin carré)
export interface OrbitConfig {
  radius: number;
  speed: number;
  phase: number;
  centerX: number;
  centerY: number;
  centerZ: number;
}

export interface SphereConfig {
  id: string;
  type: 'wire' | 'dotted' | 'glass' | 'chrome' | 'network' | 'star';
  orbit: OrbitConfig;
  scale: number;
  rot?: number;
  color?: string;
}

export const ORBITS: SphereConfig[] = [
  { id: 'wire1', type: 'wire', orbit: { radius: 3, speed: 0.016, phase: 0, centerX: 0, centerY: 0, centerZ: -1 }, scale: 1.2, rot: 1.2 },
  { id: 'dot1', type: 'dotted', orbit: { radius: 3.5, speed: 0.012, phase: 0.36, centerX: 0, centerY: 0, centerZ: 0 }, scale: 1.5, rot: 0.8 },
  { id: 'glass1', type: 'glass', orbit: { radius: 4, speed: 0.014, phase: 0.72, centerX: 0, centerY: 0, centerZ: 0.5 }, scale: 0.9, color: '#1a1a2e' },
  { id: 'net1', type: 'network', orbit: { radius: 4.5, speed: 0.010, phase: 1.08, centerX: 0, centerY: 0, centerZ: -0.5 }, scale: 1.4, rot: 1.0 },
  { id: 'chrome1', type: 'chrome', orbit: { radius: 5, speed: 0.018, phase: 1.44, centerX: 0, centerY: 0, centerZ: 0 }, scale: 0.7 },
  { id: 'wire2', type: 'wire', orbit: { radius: 5.5, speed: 0.014, phase: 1.80, centerX: 0, centerY: 0, centerZ: 0 }, scale: 0.9, rot: 1.4 },
  { id: 'star1', type: 'star', orbit: { radius: 6, speed: 0.012, phase: 2.16, centerX: 0, centerY: 0, centerZ: 0.3 }, scale: 1.2 },
  { id: 'glass2', type: 'glass', orbit: { radius: 6.5, speed: 0.016, phase: 2.52, centerX: 0, centerY: 0, centerZ: 0 }, scale: 1.3, color: '#8b5cf6' },
  { id: 'net2', type: 'network', orbit: { radius: 7, speed: 0.012, phase: 2.88, centerX: 0, centerY: 0, centerZ: 0.2 }, scale: 1.1, rot: 0.8 },
  { id: 'dot2', type: 'dotted', orbit: { radius: 7.5, speed: 0.014, phase: 3.24, centerX: 0, centerY: 0, centerZ: -0.3 }, scale: 1, rot: 1.0 },
  { id: 'glass3', type: 'glass', orbit: { radius: 8, speed: 0.020, phase: 3.60, centerX: 0, centerY: 0, centerZ: 0.5 }, scale: 0.5, color: '#06b6d4' },
];

// Fonction pour calculer position sur chemin carré
export function getSquarePosition(t: number, centerX: number, centerY: number, centerZ: number, radius: number) {
  // Normaliser t dans [0, 4] pour parcourir les 4 côtés
  t = ((t % 4) + 4) % 4;
  let x: number, y: number, z = centerZ;
  
  if (t < 1) {
    // Côté gauche -> bas
    const localT = t;
    x = centerX - radius;
    y = centerY - radius + (radius * 2 * localT);
  } else if (t < 2) {
    // Côté bas -> droite
    const localT = t - 1;
    x = centerX - radius + (radius * 2 * localT);
    y = centerY + radius;
  } else if (t < 3) {
    // Côté droite -> haut
    const localT = t - 2;
    x = centerX + radius;
    y = centerY + radius - (radius * 2 * localT);
  } else {
    // Côté haut -> gauche
    const localT = t - 3;
    x = centerX + radius - (radius * 2 * localT);
    y = centerY - radius;
  }
  
  return { x, y, z };
}


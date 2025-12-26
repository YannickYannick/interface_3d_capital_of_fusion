// Constantes de physique
export const MOUSE_FORCE = 1;
export const MOUSE_RADIUS = 1.5;
export const COLLISION_FORCE = 0.8;
export const DAMPING = 0.5; // Frottements augmentés (plus bas = plus de friction)
export const RETURN_FORCE = 0.1; // Force de retour vers l'orbite de base (augmenté pour maintenir les planètes sur leur orbite)
export const CAMERA_OFFSET = 3;
export const CAMERA_ANIMATION_DURATION = 1.2;

// Configuration des orbites (chemin rectangulaire)
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
  type: 'wire' | 'dotted' | 'glass' | 'chrome' | 'network' | 'star' | 'glb';
  orbit: OrbitConfig;
  scale: number;
  rot?: number;
  color?: string;
  modelPath?: string; // Chemin vers le fichier GLB (ex: '/models/mon-modele.glb')
}


export const ORBITS: SphereConfig[] = [
    { 
      id: 'planet-1', 
      type: 'glb', 
      orbit: { radius: 3, speed: 0.016, phase: 0.9, centerX: 0, centerY: -1, centerZ: 0 }, 
      scale: 3.2, 
      rot: 1.2, 
      modelPath: '/models/mon-modele.glb' 
    },
    { 
      id: 'planet-2', 
      type: 'glb', 
      orbit: { radius: 3.5, speed: 0.012, phase: 0.36, centerX: 0, centerY: -1, centerZ: 0 }, 
      scale: 2.5, 
      rot: 0.8, 
      modelPath: '/models/mon-modele.glb' 
    },
    { 
      id: 'planet-3', 
      type: 'glb', 
      orbit: { radius: 4, speed: 0.014, phase: 0.72, centerX: 0, centerY: -1, centerZ: 0 }, 
      scale: 2.9, 
      rot: 1.0, // Ajouté par défaut pour cohérence
      modelPath: '/models/mon-modele.glb' 
    },
    { 
      id: 'planet-4', 
      type: 'glb', 
      orbit: { radius: 4.5, speed: 0.010, phase: 1.08, centerX: 0, centerY: -1, centerZ: -0 }, 
      scale: 2.4, 
      rot: 1.0, 
      modelPath: '/models/mon-modele.glb' 
    },
    { 
      id: 'planet-5', 
      type: 'glb', 
      orbit: { radius: 5, speed: 0.018, phase: 1.44, centerX: 0, centerY: -1, centerZ: 0 }, 
      scale: 2.7, 
      rot: 1.0, 
      modelPath: '/models/mon-modele.glb' 
    },
    { 
      id: 'planet-6', 
      type: 'glb', 
      orbit: { radius: 5.5, speed: 0.014, phase: 1.80, centerX: 0, centerY: -1, centerZ: 0 }, 
      scale: 2.9, 
      rot: 2.4, 
      modelPath: '/models/mon-modele.glb' 
    },
    { 
      id: 'planet-7', 
      type: 'glb', 
      orbit: { radius: 6, speed: 0.012, phase: 2.16, centerX: 0, centerY: -1, centerZ: 0 }, 
      scale: 2.2, 
      rot: 1.0, 
      modelPath: '/models/mon-modele.glb' 
    },
    { 
      id: 'planet-8', 
      type: 'glb', 
      orbit: { radius: 6.5, speed: 0.016, phase: 2.52, centerX: 0, centerY: -1, centerZ: 0 }, 
      scale: 2.3, 
      rot: 1.0, 
      modelPath: '/models/mon-modele.glb' 
    },
    { 
      id: 'planet-9', 
      type: 'glb', 
      orbit: { radius: 7, speed: 0.012, phase: 2.88, centerX: 0, centerY: -1, centerZ: 0 }, 
      scale: 2.1, 
      rot: 0.8, 
      modelPath: '/models/mon-modele.glb' 
    },
    { 
      id: 'planet-10', 
      type: 'glb', 
      orbit: { radius: 7.5, speed: 0.014, phase: 3.24, centerX: 0, centerY: -1, centerZ: -0 }, 
      scale: 2, 
      rot: 1.0, 
      modelPath: '/models/mon-modele.glb' 
    },
    { 
      id: 'planet-11', 
      type: 'glb', 
      orbit: { radius: 8, speed: 0.020, phase: 3.60, centerX: 0, centerY: -1, centerZ: 0 }, 
      scale: 2.5, 
      rot: 1.0, 
      modelPath: '/models/mon-modele.glb' 
    },
  ];
// Fonction pour calculer position sur chemin rectangulaire
// Largeur = radius * 1.5, Hauteur = radius * 1
export function getSquarePosition(t: number, centerX: number, centerY: number, centerZ: number, radius: number) {
  // Normaliser t dans [0, 4] pour parcourir les 4 côtés
  t = ((t % 4) + 4) % 4;
  let x: number, y: number, z = centerZ;
  
  // Dimensions du rectangle : largeur (x) = radius * 1.5, hauteur (y) = radius * 1
  const width = radius * 1.5;  // Largeur
  const height = radius * 1;    // Hauteur
  
  if (t < 1) {
    // Côté gauche -> bas
    const localT = t;
    x = centerX - width;
    y = centerY - height + (height * 2 * localT);
  } else if (t < 2) {
    // Côté bas -> droite
    const localT = t - 1;
    x = centerX - width + (width * 2 * localT);
    y = centerY + height;
  } else if (t < 3) {
    // Côté droite -> haut
    const localT = t - 2;
    x = centerX + width;
    y = centerY + height - (height * 2 * localT);
  } else {
    // Côté haut -> gauche
    const localT = t - 3;
    x = centerX + width - (width * 2 * localT);
    y = centerY - height;
  }
  
  return { x, y, z };
}


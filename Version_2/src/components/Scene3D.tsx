import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';
import {
  MOUSE_FORCE,
  MOUSE_RADIUS,
  COLLISION_FORCE,
  DAMPING,
  RETURN_FORCE,
  CAMERA_OFFSET,
  CAMERA_ANIMATION_DURATION,
  ORBITS,
  getSquarePosition,
  type SphereConfig,
} from '../lib/physics';

interface PhysicsState {
  velocity: THREE.Vector3;
  basePosition: THREE.Vector3;
  currentPosition: THREE.Vector3;
  radius: number;
}

export default function Scene3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const sphereRegistryRef = useRef<Map<string, PhysicsState>>(new Map());
  const meshRegistryRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const mousePosition3DRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const animationFrameRef = useRef<number>();
  const selectedObjectRef = useRef<THREE.Object3D | null>(null);
  const hoveredObjectRef = useRef<THREE.Object3D | null>(null);
  const highlightMeshRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 500);
    // Position de la caméra avec inclinaison de 20° vers le bas
    const distance = 20; // Augmenté de 15 à 20 pour reculer la caméra
    const angle = (20 * Math.PI) / 180; // 20 degrés en radians
    camera.position.set(0, Math.sin(angle) * distance, Math.cos(angle) * distance);
    camera.lookAt(0, 0, 0); // Regarder vers le centre
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // Fond transparent
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.pointerEvents = 'auto';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    // Désactiver tous les contrôles
    controls.enabled = false;
    controls.target.set(0, 0, 0); // Cible au centre
    controls.update();
    controlsRef.current = controls;

    // Lumières
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const light1 = new THREE.PointLight(0xffffff, 1);
    light1.position.set(10, 10, 10);
    scene.add(light1);
    const light2 = new THREE.PointLight(0x7c3aed, 0.4);
    light2.position.set(-10, -10, -10);
    scene.add(light2);
    const light3 = new THREE.PointLight(0x06b6d4, 0.4);
    light3.position.set(0, 5, 5);
    scene.add(light3);

    // Aura électrique pour la sphère survolée/sélectionnée
    const auraGroup = new THREE.Group();
    auraGroup.visible = false;
    scene.add(auraGroup);

    // Sphère d'aura principale (glow) - taille réduite par 5
    const auraSphereGeometry = new THREE.SphereGeometry(0.2, 32, 32);
    const auraSphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x00aaff,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide,
    });
    const auraSphere = new THREE.Mesh(auraSphereGeometry, auraSphereMaterial);
    auraGroup.add(auraSphere);

    // Sphère externe pour l'aura diffuse - taille réduite par 5
    const auraOuterGeometry = new THREE.SphereGeometry(0.23, 32, 32);
    const auraOuterMaterial = new THREE.MeshBasicMaterial({
      color: 0x0066ff,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    });
    const auraOuter = new THREE.Mesh(auraOuterGeometry, auraOuterMaterial);
    auraGroup.add(auraOuter);

    // Éclairs électriques (lightning bolts) - génération procédurale
    const lightningGroup = new THREE.Group();
    const lightningCount = 12;
    const lightningLines: THREE.Line[] = [];

    function generateLightningBolt(start: THREE.Vector3, end: THREE.Vector3, segments: number, offset: number = 0): THREE.Vector3[] {
      const points: THREE.Vector3[] = [start.clone()];
      const direction = new THREE.Vector3().subVectors(end, start);
      const length = direction.length();
      direction.normalize();
      
      for (let i = 1; i < segments; i++) {
        const t = i / segments;
        const basePoint = new THREE.Vector3().copy(start).add(direction.multiplyScalar(length * t));
        
        // Créer un effet zigzag pour les éclairs
        const perp1 = new THREE.Vector3(-direction.y, direction.x, direction.z).normalize();
        const perp2 = new THREE.Vector3().crossVectors(direction, perp1).normalize();
        
        const noise1 = (Math.random() - 0.5) * 0.15;
        const noise2 = (Math.random() - 0.5) * 0.15;
        const zigzag = Math.sin(t * Math.PI * 4 + offset) * 0.1;
        
        basePoint.add(perp1.multiplyScalar(noise1 + zigzag));
        basePoint.add(perp2.multiplyScalar(noise2));
        
        points.push(basePoint);
      }
      points.push(end.clone());
      return points;
    }

    for (let i = 0; i < lightningCount; i++) {
      const angle = (i / lightningCount) * Math.PI * 2;
      const verticalAngle = (Math.random() - 0.5) * Math.PI * 0.8;
      
      // Point de départ sur la sphère - taille réduite par 5
      const startRadius = 0.204;
      const start = new THREE.Vector3(
        Math.cos(angle) * Math.cos(verticalAngle) * startRadius,
        Math.sin(verticalAngle) * startRadius,
        Math.sin(angle) * Math.cos(verticalAngle) * startRadius
      );
      
      // Point d'arrivée légèrement plus loin - taille réduite par 5
      const endRadius = 0.23 + Math.random() * 0.02;
      const end = new THREE.Vector3(
        Math.cos(angle) * Math.cos(verticalAngle) * endRadius,
        Math.sin(verticalAngle) * endRadius,
        Math.sin(angle) * Math.cos(verticalAngle) * endRadius
      );
      
      const points = generateLightningBolt(start, end, 8, i * 0.5);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0x00aaff,
        transparent: true,
        opacity: 0.9,
        linewidth: 1,
      });
      const line = new THREE.Line(geometry, material);
      lightningLines.push(line);
      lightningGroup.add(line);
      
      // Ajouter des branches secondaires pour plus de réalisme
      if (Math.random() > 0.5) {
        const branchPoint = points[Math.floor(points.length / 2)];
        const branchEnd = new THREE.Vector3().copy(branchPoint).multiplyScalar(1.1 + Math.random() * 0.05);
        const branchPoints = generateLightningBolt(branchPoint, branchEnd, 5, i * 0.5 + 10);
        const branchGeometry = new THREE.BufferGeometry().setFromPoints(branchPoints);
        const branchLine = new THREE.Line(branchGeometry, material.clone());
        branchLine.material.opacity = 0.6;
        lightningLines.push(branchLine);
        lightningGroup.add(branchLine);
      }
    }
    auraGroup.add(lightningGroup);

    // Stocker les références pour l'animation
    highlightMeshRef.current = auraGroup as any;
    (auraGroup as any).lightningLines = lightningLines;
    (auraGroup as any).lightningGroup = lightningGroup;
    (auraGroup as any).auraSphere = auraSphere;
    (auraGroup as any).auraOuter = auraOuter;

    const tmpVec = new THREE.Vector3();

    // Matériaux
    const glassMat = new THREE.MeshPhysicalMaterial({
      transmission: 0.9,
      roughness: 0.1,
      metalness: 0.9,
      thickness: 1.5,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      opacity: 0.85,
      transparent: true,
      color: 0x7c3aed,
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe8e8e8,
      roughness: 0.05,
      metalness: 1,
      envMapIntensity: 1.2,
    });

    function register(id: string, obj: THREE.Object3D, radius: number) {
      meshRegistryRef.current.set(id, obj);
      sphereRegistryRef.current.set(id, {
        velocity: new THREE.Vector3(),
        basePosition: obj.position.clone(),
        currentPosition: obj.position.clone(),
        radius,
      });
    }

    // Générateurs de formes
    function makeWireframe(id: string, orbit: SphereConfig['orbit'], scale: number, rotSpeed: number) {
      const geo = new THREE.IcosahedronGeometry(1, 2);
      const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.6 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.scale.setScalar(scale);
      mesh.position.set(orbit.centerX, orbit.centerY, orbit.centerZ);
      mesh.name = id;
      mesh.userData.type = 'wire';
      mesh.userData.rotSpeed = rotSpeed;
      register(id, mesh, scale * 1.2);
      scene.add(mesh);
    }

    function makeDotted(id: string, orbit: SphereConfig['orbit'], scale: number, rotSpeed: number) {
      const group = new THREE.Group();
      const ptsCount = 1500;
      const positions = new Float32Array(ptsCount * 3);
      for (let i = 0; i < ptsCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 1;
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({ size: 0.015, color: 0xffffff, transparent: true, opacity: 0.8, sizeAttenuation: true });
      const points = new THREE.Points(geo, mat);
      points.scale.setScalar(scale);
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(scale, 16, 16), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }));
      sphere.visible = false;
      group.add(sphere);
      group.add(points);
      group.position.set(orbit.centerX, orbit.centerY, orbit.centerZ);
      group.name = id;
      group.userData.type = 'dotted';
      group.userData.rotSpeed = rotSpeed;
      register(id, group, scale * 1.2);
      scene.add(group);
    }

    function makeGlass(id: string, orbit: SphereConfig['orbit'], scale: number, color?: string) {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), glassMat.clone());
      mesh.material.color = new THREE.Color(color || '#7c3aed');
      mesh.scale.setScalar(scale);
      mesh.position.set(orbit.centerX, orbit.centerY, orbit.centerZ);
      mesh.name = id;
      mesh.userData.type = 'glass';
      register(id, mesh, scale * 1.2);
      scene.add(mesh);
    }

    function makeChrome(id: string, orbit: SphereConfig['orbit'], scale: number) {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), chromeMat);
      mesh.scale.setScalar(scale);
      mesh.position.set(orbit.centerX, orbit.centerY, orbit.centerZ);
      mesh.name = id;
      mesh.userData.type = 'chrome';
      register(id, mesh, scale * 1.1);
      scene.add(mesh);
    }

    function makeNetwork(id: string, orbit: SphereConfig['orbit'], scale: number, rotSpeed: number) {
      const group = new THREE.Group();
      const pts: THREE.Vector3[] = [];
      const radius = 1;
      for (let i = 0; i < 60; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        pts.push(new THREE.Vector3(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi)
        ));
      }
      const positions: number[] = [];
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          if (pts[i].distanceTo(pts[j]) < 0.5) {
            positions.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
          }
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      const lines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 }));
      lines.scale.setScalar(scale);
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(scale, 16, 16), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }));
      sphere.visible = false;
      group.add(sphere);
      group.add(lines);
      group.position.set(orbit.centerX, orbit.centerY, orbit.centerZ);
      group.name = id;
      group.userData.type = 'network';
      group.userData.rotSpeed = rotSpeed;
      register(id, group, scale * 1.1);
      scene.add(group);
    }

    function makeStarburst(id: string, orbit: SphereConfig['orbit'], scale: number) {
      const positions: number[] = [];
      for (let i = 0; i < 80; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const len = 0.4 + Math.random() * 0.6;
        positions.push(0, 0, 0);
        positions.push(
          len * Math.sin(phi) * Math.cos(theta),
          len * Math.sin(phi) * Math.sin(theta),
          len * Math.cos(phi)
        );
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      const lines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 }));
      const group = new THREE.Group();
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(scale, 16, 16), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }));
      sphere.visible = false;
      group.add(sphere);
      group.add(lines);
      group.scale.setScalar(scale);
      group.position.set(orbit.centerX, orbit.centerY, orbit.centerZ);
      group.name = id;
      group.userData.type = 'star';
      register(id, group, scale * 1.1);
      scene.add(group);
    }

    // Fonction pour charger un modèle GLB
    async function makeGLB(id: string, orbit: SphereConfig['orbit'], scale: number, modelPath: string, rotSpeed?: number) {
      const loader = new GLTFLoader();
      try {
        const gltf = await loader.loadAsync(modelPath);
        const model = gltf.scene;
        
        // Créer un groupe pour contenir le modèle
        const group = new THREE.Group();
        group.add(model);
        
        // Calculer la bounding box pour centrer et dimensionner le modèle
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        
        // Normaliser le modèle à une taille de base de 1 unité
        const normalizeScale = 1 / maxDim;
        model.scale.setScalar(normalizeScale);
        
        // Appliquer l'échelle souhaitée
        group.scale.setScalar(scale);
        group.position.set(orbit.centerX, orbit.centerY, orbit.centerZ);
        group.name = id;
        group.userData.type = 'glb';
        group.userData.rotSpeed = rotSpeed || 1;
        
        // Enregistrer le groupe dans le registre
        register(id, group, scale * 1.2);
        scene.add(group);
      } catch (error) {
        console.error(`Erreur lors du chargement du modèle GLB ${modelPath}:`, error);
        // Optionnel : créer une sphère de fallback
        const fallbackMesh = new THREE.Mesh(
          new THREE.SphereGeometry(1, 32, 32),
          new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        fallbackMesh.scale.setScalar(scale);
        fallbackMesh.position.set(orbit.centerX, orbit.centerY, orbit.centerZ);
        fallbackMesh.name = id;
        fallbackMesh.userData.type = 'glb';
        register(id, fallbackMesh, scale * 1.2);
        scene.add(fallbackMesh);
      }
    }

    // Fonction pour créer une trajectoire rectangulaire visible
    function makeOrbitPath(orbit: SphereConfig['orbit']) {
      const { centerX, centerY, centerZ, radius } = orbit;
      
      // Dimensions du rectangle : largeur (x) = radius * 1.5, hauteur (y) = radius * 1
      const width = radius * 1.5;
      const height = radius * 1;
      
      // Les 4 coins du rectangle
      const points = [
        new THREE.Vector3(centerX - width, centerY - height, centerZ), // Coin bas-gauche
        new THREE.Vector3(centerX - width, centerY + height, centerZ), // Coin haut-gauche
        new THREE.Vector3(centerX + width, centerY + height, centerZ), // Coin haut-droite
        new THREE.Vector3(centerX + width, centerY - height, centerZ), // Coin bas-droite
        new THREE.Vector3(centerX - width, centerY - height, centerZ), // Retour au début pour fermer le rectangle
      ];
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.3,
        linewidth: 1
      });
      const line = new THREE.Line(geometry, material);
      scene.add(line);
    }

    // Création des trajectoires visibles (désactivé)
    // ORBITS.forEach((item) => {
    //   makeOrbitPath(item.orbit);
    // });

    // Création des objets
    ORBITS.forEach((item) => {
      switch (item.type) {
        case 'wire':
          makeWireframe(item.id, item.orbit, item.scale, item.rot || 1);
          break;
        case 'dotted':
          makeDotted(item.id, item.orbit, item.scale, item.rot || 1);
          break;
        case 'glass':
          makeGlass(item.id, item.orbit, item.scale, item.color);
          break;
        case 'chrome':
          makeChrome(item.id, item.orbit, item.scale);
          break;
        case 'network':
          makeNetwork(item.id, item.orbit, item.scale, item.rot || 1);
          break;
        case 'star':
          makeStarburst(item.id, item.orbit, item.scale);
          break;
        case 'glb':
          makeGLB(item.id, item.orbit, item.scale, item.modelPath || '', item.rot || 1);
          break;
      }
    });

    // Mise à jour physique / chemin carré
    function stepPhysics(_dt: number, elapsed: number) {
      sphereRegistryRef.current.forEach((state, id) => {
        const mesh = meshRegistryRef.current.get(id);
        if (!mesh) return;
        const orbit = ORBITS.find((o) => o.id === id)?.orbit;
        if (!orbit) return;
        const t = elapsed * orbit.speed + orbit.phase;
        const squarePos = getSquarePosition(t, orbit.centerX, orbit.centerY, orbit.centerZ, orbit.radius);
        state.basePosition.set(squarePos.x, squarePos.y, squarePos.z);

        // Mouse repulsion
        const distToMouse = state.currentPosition.distanceTo(mousePosition3DRef.current);
        if (distToMouse < MOUSE_RADIUS && distToMouse > 0.01) {
          const force = (1 - distToMouse / MOUSE_RADIUS) * MOUSE_FORCE;
          const dir = tmpVec.subVectors(state.currentPosition, mousePosition3DRef.current).normalize();
          state.velocity.add(dir.multiplyScalar(force * 0.1));
        }

        // Collisions
        sphereRegistryRef.current.forEach((other, otherId) => {
          if (otherId === id) return;
          const dist = state.currentPosition.distanceTo(other.currentPosition);
          const minDist = state.radius + other.radius;
          if (dist < minDist && dist > 0.01) {
            const overlap = minDist - dist;
            const dir = tmpVec.subVectors(state.currentPosition, other.currentPosition).normalize();
            state.velocity.add(dir.multiplyScalar(overlap * COLLISION_FORCE * 0.1));
          }
        });

        // Retour ressort
        const returnDir = tmpVec.subVectors(state.basePosition, state.currentPosition);
        state.velocity.add(returnDir.multiplyScalar(RETURN_FORCE));
        // Damping + intégration
        state.velocity.multiplyScalar(DAMPING);
        state.currentPosition.add(state.velocity);

        // Appliquer
        mesh.position.copy(state.currentPosition);
        // Rotations lentes
        if (mesh.userData.rotSpeed) {
          mesh.rotation.x += mesh.userData.rotSpeed * 0.002;
          mesh.rotation.y += mesh.userData.rotSpeed * 0.003;
        }

        // Mise à jour de l'aura électrique pour la sphère survolée ou sélectionnée
        const targetObject = hoveredObjectRef.current || selectedObjectRef.current;
        if (highlightMeshRef.current && targetObject === mesh) {
          const auraGroup = highlightMeshRef.current as any;
          auraGroup.position.copy(state.currentPosition);
          auraGroup.visible = true;
          
          const config = ORBITS.find((o) => o.id === id);
          if (config) {
            const baseScale = config.scale * 1.2;
            const pulse = 1 + Math.sin(elapsed * 3) * 0.05; // Pulsation subtile
            
            // Mise à jour de l'échelle de l'aura
            auraGroup.scale.setScalar(baseScale * pulse);
            
            // Animation des éclairs (rotation et pulsation)
            if (auraGroup.lightningLines && auraGroup.lightningGroup) {
              auraGroup.lightningGroup.rotation.y += 0.015;
              auraGroup.lightningGroup.rotation.x += 0.005;
              auraGroup.lightningLines.forEach((line: THREE.Line, index: number) => {
                // Animation des éclairs avec variation d'opacité et scintillement
                const material = line.material as THREE.LineBasicMaterial;
                const flicker = Math.sin(elapsed * 8 + index * 0.5) * 0.3;
                material.opacity = 0.7 + flicker;
              });
            }
            
            // Pulsation de l'aura principale
            if (auraGroup.auraSphere) {
              const sphereMat = (auraGroup.auraSphere as THREE.Mesh).material as THREE.MeshBasicMaterial;
              sphereMat.opacity = 0.25 + Math.sin(elapsed * 3) * 0.1;
            }
            
            // Pulsation de l'aura externe
            if (auraGroup.auraOuter) {
              const outerMat = (auraGroup.auraOuter as THREE.Mesh).material as THREE.MeshBasicMaterial;
              outerMat.opacity = 0.1 + Math.sin(elapsed * 2.5) * 0.05;
            }
          }
        }
      });

      // Cacher l'aura si aucune sphère n'est survolée ou sélectionnée
      if (highlightMeshRef.current && hoveredObjectRef.current === null && selectedObjectRef.current === null) {
        const auraGroup = highlightMeshRef.current as any;
        auraGroup.visible = false;
      }
    }

    // Mouse tracking
    const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function updateMousePosition(clientX: number, clientY: number) {
      mouse.x = (clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const point = new THREE.Vector3();
      raycaster.ray.intersectPlane(planeZ, point);
      mousePosition3DRef.current.copy(point);
    }

    // Détection du survol (hover)
    function updateHoveredObject() {
      raycaster.setFromCamera(mouse, camera);
      const objects = Array.from(meshRegistryRef.current.values());
      const hits = raycaster.intersectObjects(objects, true);
      if (hits.length) {
        let obj = hits[0].object;
        while (obj && !meshRegistryRef.current.has(obj.name) && obj.parent) obj = obj.parent;
        if (obj && obj !== hoveredObjectRef.current) {
          hoveredObjectRef.current = obj;
        }
      } else {
        hoveredObjectRef.current = null;
      }
    }

    const handlePointerMove = (e: PointerEvent) => {
      updateMousePosition(e.clientX, e.clientY);
      updateHoveredObject();
    };
    window.addEventListener('pointermove', handlePointerMove);

    // Click -> focus camera
    function focusOnObject(obj: THREE.Object3D) {
      // Mettre à jour la sphère sélectionnée
      selectedObjectRef.current = obj;
      
      const targetPosition = new THREE.Vector3();
      obj.getWorldPosition(targetPosition);
      const direction = tmpVec.subVectors(camera.position, targetPosition).normalize();
      const cameraTarget = targetPosition.clone().add(direction.multiplyScalar(CAMERA_OFFSET));
      gsap.to(camera.position, {
        x: cameraTarget.x,
        y: cameraTarget.y,
        z: cameraTarget.z,
        duration: CAMERA_ANIMATION_DURATION,
        ease: 'power2.inOut',
        onUpdate: () => camera.updateProjectionMatrix(),
      });
      gsap.to(controls.target, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: CAMERA_ANIMATION_DURATION,
        ease: 'power2.inOut',
        onUpdate: () => {
          controls.update();
        },
      });
    }

    const handleClick = (e: MouseEvent) => {
      updateMousePosition(e.clientX, e.clientY);
      raycaster.setFromCamera(mouse, camera);
      const objects = Array.from(meshRegistryRef.current.values());
      const hits = raycaster.intersectObjects(objects, true);
      if (hits.length) {
        let obj = hits[0].object;
        while (obj && !meshRegistryRef.current.has(obj.name) && obj.parent) obj = obj.parent;
        if (obj) {
          focusOnObject(obj);
        }
      } else {
        // Désélectionner si on clique ailleurs
        selectedObjectRef.current = null;
        if (highlightMeshRef.current) {
          const auraGroup = highlightMeshRef.current as any;
          auraGroup.visible = false;
        }
      }
    };

    const handleDoubleClick = (e: MouseEvent) => {
      e.preventDefault();
      // Désélectionner la sphère
      selectedObjectRef.current = null;
      if (highlightMeshRef.current) {
        const auraGroup = highlightMeshRef.current as any;
        auraGroup.visible = false;
      }
      // Retour à la position initiale avec inclinaison de 20°
      const distance = 20; // Augmenté de 15 à 20 pour reculer la caméra
      const angle = (20 * Math.PI) / 180;
      gsap.to(camera.position, { 
        x: 0, 
        y: Math.sin(angle) * distance, 
        z: Math.cos(angle) * distance, 
        duration: CAMERA_ANIMATION_DURATION, 
        ease: 'power2.inOut',
        onUpdate: () => {
          camera.lookAt(0, 0, 0);
        }
      });
      gsap.to(controls.target, { x: 0, y: 0, z: 0, duration: CAMERA_ANIMATION_DURATION, ease: 'power2.inOut', onUpdate: () => { controls.update(); } });
    };

    renderer.domElement.addEventListener('click', handleClick);
    renderer.domElement.addEventListener('dblclick', handleDoubleClick);

    // Animation loop
    let last = performance.now();
    function animate(now: number) {
      const dt = Math.min((now - last) / 1000, 0.033);
      last = now;
      const elapsed = now * 0.001;
      // controls.update(); // Désactivé car les contrôles sont désactivés
      stepPhysics(dt, elapsed);
      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    animationFrameRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.domElement.removeEventListener('dblclick', handleDoubleClick);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (container && renderer.domElement.parentNode) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 w-full h-full" style={{ zIndex: 1, isolation: 'isolate' }} />;
}

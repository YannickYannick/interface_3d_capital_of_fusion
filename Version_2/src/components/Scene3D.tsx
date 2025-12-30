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
import { usePlanetsOptions } from '../contexts/PlanetsOptionsContext';

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
  const orbitLinesRef = useRef<THREE.Line[]>([]);
  const { orbitsVisible } = usePlanetsOptions();

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Éviter de créer un nouveau contexte si un existe déjà
    if (rendererRef.current) {
      console.warn('WebGL renderer already exists, skipping initialization');
      return;
    }

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
    
    // Réglages pour améliorer le rendu des textures et profondeurs
    renderer.outputColorSpace = THREE.SRGBColorSpace; // Espace colorimétrique correct
    renderer.toneMapping = THREE.ACESFilmicToneMapping; // Meilleur contraste et profondeur
    renderer.toneMappingExposure = 1.5; // Augmenter l'exposition
    renderer.shadowMap.enabled = true; // Activer les ombres
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Ombres douces
    
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

    // Lumières - intensités augmentées pour plus d'exposition
    scene.add(new THREE.AmbientLight(0xffffff, 0.6)); // Lumière ambiante douce
    
    // Lumière principale directionnelle (meilleure pour les ombres et profondeur)
    const mainLight = new THREE.DirectionalLight(0xffffff, 2.0);
    mainLight.position.set(10, 15, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    scene.add(mainLight);
    
    // Lumières ponctuelles pour ajouter de la couleur et des reflets
    const light1 = new THREE.PointLight(0xffffff, 1.5);
    light1.position.set(10, 10, 10);
    scene.add(light1);
    const light2 = new THREE.PointLight(0x7c3aed, 1.0); // Violet
    light2.position.set(-10, -10, -10);
    scene.add(light2);
    const light3 = new THREE.PointLight(0x06b6d4, 1.0); // Cyan
    light3.position.set(0, 5, 5);
    scene.add(light3);
    
    // Lumière de remplissage par le bas pour éviter les zones trop sombres
    const fillLight = new THREE.PointLight(0xffffff, 0.4);
    fillLight.position.set(0, -10, 0);
    scene.add(fillLight);

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
        
        // Améliorer les matériaux du modèle pour un meilleur rendu
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            // Activer les ombres
            child.castShadow = true;
            child.receiveShadow = true;
            
            // Améliorer le matériau
            if (child.material) {
              const materials = Array.isArray(child.material) ? child.material : [child.material];
              materials.forEach((mat) => {
                if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
                  mat.envMapIntensity = 1.5; // Augmenter les reflets
                  mat.needsUpdate = true;
                }
                // Forcer la mise à jour du matériau
                mat.needsUpdate = true;
              });
            }
          }
        });
        
        // Créer un groupe pour contenir le modèle
        const group = new THREE.Group();
        group.add(model);
        
        // Calculer la bounding box pour centrer et dimensionner le modèle
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        
        // Centrer le modèle
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        
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
          new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.5, metalness: 0.5 })
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
        opacity: orbitsVisible ? 0.8 : 0.3,
        linewidth: orbitsVisible ? 2 : 1
      });
      const line = new THREE.Line(geometry, material);
      line.visible = orbitsVisible;
      orbitLinesRef.current.push(line);
      scene.add(line);
    }

    // Création des trajectoires visibles
    ORBITS.forEach((item) => {
      makeOrbitPath(item.orbit);
    });

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

      });
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
      }
    };

    const handleDoubleClick = (e: MouseEvent) => {
      e.preventDefault();
      // Désélectionner la sphère
      selectedObjectRef.current = null;
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

    // Cleanup complet pour libérer les ressources WebGL
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.domElement.removeEventListener('dblclick', handleDoubleClick);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Libérer toutes les géométries et matériaux de la scène
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) {
            object.geometry.dispose();
          }
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
      
      // Vider les registres
      sphereRegistryRef.current.clear();
      meshRegistryRef.current.clear();
      
      // Supprimer le canvas du DOM
      if (container && renderer.domElement.parentNode) {
        container.removeChild(renderer.domElement);
      }
      
      // Libérer le contexte WebGL
      renderer.dispose();
      renderer.forceContextLoss();
      
      // Nettoyer les refs
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      controlsRef.current = null;
      selectedObjectRef.current = null;
      hoveredObjectRef.current = null;
    };
  }, []);

  // Mettre à jour la visibilité et l'opacité des trajectoires quand le toggle change
  useEffect(() => {
    orbitLinesRef.current.forEach((line) => {
      if (line.material instanceof THREE.LineBasicMaterial) {
        line.visible = orbitsVisible;
        line.material.opacity = orbitsVisible ? 0.8 : 0.3;
        line.material.linewidth = orbitsVisible ? 2 : 1;
        line.material.needsUpdate = true;
      }
    });
  }, [orbitsVisible]);

  return <div ref={containerRef} className="fixed inset-0 w-full h-full" style={{ zIndex: 9999, pointerEvents: 'auto' }} />;
}

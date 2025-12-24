import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
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

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 500);
    camera.position.set(0, 0, 10);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.minDistance = 3;
    controls.maxDistance = 20;
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
      }
    });

    // Mise à jour physique / chemin carré
    function stepPhysics(dt: number, elapsed: number) {
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

    const handlePointerMove = (e: PointerEvent) => updateMousePosition(e.clientX, e.clientY);
    window.addEventListener('pointermove', handlePointerMove);

    // Click -> focus camera
    function focusOnObject(obj: THREE.Object3D) {
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
        onUpdate: () => controls.update(),
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
        if (obj) focusOnObject(obj);
      }
    };

    const handleDoubleClick = () => {
      gsap.to(camera.position, { x: 0, y: 0, z: 10, duration: CAMERA_ANIMATION_DURATION, ease: 'power2.inOut' });
      gsap.to(controls.target, { x: 0, y: 0, z: 0, duration: CAMERA_ANIMATION_DURATION, ease: 'power2.inOut', onUpdate: () => controls.update() });
    };

    renderer.domElement.addEventListener('click', handleClick);
    renderer.domElement.addEventListener('dblclick', handleDoubleClick);

    // Animation loop
    let last = performance.now();
    function animate(now: number) {
      const dt = Math.min((now - last) / 1000, 0.033);
      last = now;
      controls.update();
      stepPhysics(dt, now * 0.001);
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

  return <div ref={containerRef} className="fixed inset-0 w-full h-full" />;
}


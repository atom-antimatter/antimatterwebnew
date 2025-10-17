import * as THREE from "three";
import { ParticleSystem } from "./particlesSetup";
import type { IndexRef, ProgressRef } from "./interactions";
import gsap from "gsap";

type AnimateParams = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  particleSystem: ParticleSystem;
  modelPositionsArray: THREE.Vector3[][];
  mouse: THREE.Vector2;
  morphProgressRef: ProgressRef;
  currentIndexRef: IndexRef;
  nextIndexRef: IndexRef;
  hoverColor: THREE.ColorRepresentation;
};

export function startAnimationLoop(params: AnimateParams): () => void {
  const {
    scene,
    camera,
    renderer,
    particleSystem,
    modelPositionsArray,
    mouse,
    morphProgressRef,
    currentIndexRef,
    nextIndexRef,
  } = params;

  const {
    instancedMesh,
    shapeGroup,
    basePositions,
    positions,
    velocities,
    hoverIntensity,
    baseSizes,
    baseColors,
    offsetVectors,
    particleCount,
  } = particleSystem;

  const stiffness = 60.0;
  const damping = 0.88;
  const impulseStrength = 4.5;
  const effectRadius = 6;
  const transitionSpeed = 0.1;
  const hoverRadius = effectRadius * 1.5;

  const clock = new THREE.Clock();

  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  const worldPos = new THREE.Vector3();
  const cameraWorldPos = new THREE.Vector3();
  const groupInverse = new THREE.Matrix4();
  const localMatrix = new THREE.Matrix4();
  const rayOrigin = new THREE.Vector3();
  const rayDir = new THREE.Vector3();
  const localPosVec = new THREE.Vector3();
  const closestPoint = new THREE.Vector3();
  const tmpVec = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();

  let rafId = 0;
  let t = 0;
  let isRunning = true;
  let lastFrameTime = 0;
  const targetFPS = 60;
  const frameInterval = 1000 / targetFPS;

  function frame(currentTime: number = 0) {
    if (!isRunning) return;
    
    // Throttle frame rate to prevent overwhelming on slower devices
    if (currentTime - lastFrameTime < frameInterval) {
      rafId = requestAnimationFrame(frame);
      return;
    }
    lastFrameTime = currentTime;
    
    rafId = requestAnimationFrame(frame);
    
    try {
      const dt = Math.min(clock.getDelta(), 0.05);
      const morphProgress = morphProgressRef.current;

    for (let i = 0; i < particleCount; i++) {
      hoverIntensity[i] = Math.max(0, hoverIntensity[i] - transitionSpeed);
    }

    const fromModel =
      modelPositionsArray[currentIndexRef.current] || basePositions;
    const toModel = modelPositionsArray[nextIndexRef.current] || basePositions;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // morphed base (lerp between current and next model)
      const morph = new THREE.Vector3().lerpVectors(
        fromModel[i],
        toModel[i],
        morphProgress
      );

      const offset = offsetVectors[i];
      const targetX = morph.x + Math.sin(t + i) * offset.x * 100;
      const targetY = morph.y + Math.cos(t + i) * offset.y * 100;
      const targetZ = morph.z + Math.sin(t * 0.5 + i) * offset.z * 100;

      const px = positions[i3];
      const py = positions[i3 + 1];
      const pz = positions[i3 + 2];

      const fx = (targetX - px) * stiffness * dt;
      const fy = (targetY - py) * stiffness * dt;
      const fz = (targetZ - pz) * stiffness * dt;

      velocities[i3] += fx;
      velocities[i3 + 1] += fy;
      velocities[i3 + 2] += fz;

      velocities[i3] *= damping;
      velocities[i3 + 1] *= damping;
      velocities[i3 + 2] *= damping;

      positions[i3] += velocities[i3] * dt;
      positions[i3 + 1] += velocities[i3 + 1] * dt;
      positions[i3 + 2] += velocities[i3 + 2] * dt;
    }

    // PROXIMITY HOVER: compute ray origin & direction
    raycaster.setFromCamera(mouse, camera);
    rayOrigin.copy(raycaster.ray.origin);
    rayDir.copy(raycaster.ray.direction);

    shapeGroup.updateMatrixWorld(true);
    groupInverse.copy(shapeGroup.matrixWorld).invert();
    camera.getWorldPosition(cameraWorldPos);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // const intensity = hoverIntensity[i];

      // local position in group space
      localPosVec.set(positions[i3], positions[i3 + 1], positions[i3 + 2]);

      // convert to world space
      worldPos.copy(localPosVec).applyMatrix4(shapeGroup.matrixWorld);

      tmpVec.subVectors(worldPos, rayOrigin);
      const tOnRay = tmpVec.dot(rayDir);
      closestPoint.copy(rayDir).multiplyScalar(tOnRay).add(rayOrigin);

      const distToRay = worldPos.distanceTo(closestPoint);

      if (distToRay < effectRadius && distToRay > 0.0001) {
        const inv = 1 - distToRay / effectRadius;
        const impulse = impulseStrength * inv;

        const closestLocal = closestPoint.clone();
        shapeGroup.worldToLocal(closestLocal);
        const dirLocal = new THREE.Vector3(
          positions[i3] - closestLocal.x,
          positions[i3 + 1] - closestLocal.y,
          positions[i3 + 2] - closestLocal.z
        ).normalize();

        velocities[i3] += dirLocal.x * impulse;
        velocities[i3 + 1] += dirLocal.y * impulse;
        velocities[i3 + 2] += dirLocal.z * impulse;
      }

      if (distToRay < hoverRadius) {
        const intensityNew = 1 - Math.min(1, distToRay / hoverRadius);
        hoverIntensity[i] = Math.min(
          1,
          hoverIntensity[i] + intensityNew * transitionSpeed * 3
        );
      }

      color
        .copy(baseColors[i])
        .lerp(new THREE.Color(params.hoverColor), hoverIntensity[i]);
      const size = baseSizes[i] * (1 + hoverIntensity[i] * (2.0 - 1));

      dummy.position.copy(worldPos);
      dummy.lookAt(cameraWorldPos);
      dummy.scale.set(size, size, 1);
      dummy.updateMatrixWorld(true);

      localMatrix.multiplyMatrices(groupInverse, dummy.matrixWorld);

      instancedMesh.setMatrixAt(i, localMatrix);
      instancedMesh.setColorAt(i, color);
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
    if (instancedMesh.instanceColor)
      instancedMesh.instanceColor.needsUpdate = true;

      t += 0.02;
      
      // Check if renderer context is still valid
      if (renderer.domElement && !renderer.domElement.isConnected) {
        console.warn("3D renderer disconnected, stopping animation");
        isRunning = false;
        return;
      }
      
      renderer.render(scene, camera);

      if (currentIndexRef.current > 1) {
        // shapeGroup.rotation.y = (shapeGroup.rotation.y % 2) * Math.PI;
        gsap.to(shapeGroup.rotation, {
          y: Math.PI,
          duration: 1,
          ease: "power1.out",
        });
      } else {
        shapeGroup.rotation.y += 0.001;
        if (shapeGroup.rotation.y >= 2 * Math.PI) {
          shapeGroup.rotation.y -= 2 * Math.PI;
        }
      }
    } catch (error) {
      console.error("3D animation error:", error);
      isRunning = false;
    }
  }

  frame();

  return () => {
    isRunning = false;
    cancelAnimationFrame(rafId);
  };
}

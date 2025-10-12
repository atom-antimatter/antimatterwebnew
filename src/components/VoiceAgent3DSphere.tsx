"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface VoiceAgent3DSphereProps {
  isActive: boolean;
  isSpeaking: boolean;
}

export default function VoiceAgent3DSphere({
  isActive,
  isSpeaking,
}: VoiceAgent3DSphereProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    instancedMesh: THREE.InstancedMesh;
    particleCount: number;
    basePositions: THREE.Vector3[];
    baseSizes: Float32Array;
    dummy: THREE.Object3D;
    animationId?: number;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 25;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Create particle system
    const particleCount = 2000;
    const radius = 8;
    const icoGeo = new THREE.IcosahedronGeometry(radius, 15);
    const icoPos = icoGeo.attributes.position.array as Float32Array;

    const basePositions: THREE.Vector3[] = [];
    const baseSizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const vertexIndex =
        (Math.floor(Math.random() * (icoPos.length / 3)) * 3) | 0;
      const x = icoPos[vertexIndex];
      const y = icoPos[vertexIndex + 1];
      const z = icoPos[vertexIndex + 2];
      basePositions.push(new THREE.Vector3(x, y, z));
      baseSizes[i] = 0.3 + Math.random() * 0.3;
    }

    // Create instanced mesh
    const geometry = new THREE.PlaneGeometry(1, 1);
    const texture = new THREE.TextureLoader().load("/images/glowingCircle2.png");
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.01,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const instancedMesh = new THREE.InstancedMesh(
      geometry,
      material,
      particleCount
    );

    const dummy = new THREE.Object3D();
    const baseColor = new THREE.Color(0xd7d7d7);

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      dummy.position.copy(basePositions[i]);
      dummy.scale.set(baseSizes[i], baseSizes[i], 1);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
      instancedMesh.setColorAt(i, baseColor);
    }
    instancedMesh.instanceMatrix.needsUpdate = true;
    if (instancedMesh.instanceColor)
      instancedMesh.instanceColor.needsUpdate = true;

    scene.add(instancedMesh);

    sceneRef.current = {
      scene,
      camera,
      renderer,
      instancedMesh,
      particleCount,
      basePositions,
      baseSizes,
      dummy,
    };

    // Animation loop
    let time = 0;
    const animate = () => {
      if (!sceneRef.current) return;
      
      time += 0.01;
      
      const { instancedMesh, particleCount, basePositions, baseSizes, dummy } =
        sceneRef.current;

      // Rotate only when not in active conversation
      if (!isActive) {
        instancedMesh.rotation.y += 0.002;
      }

      // Oscillate particles when speaking
      for (let i = 0; i < particleCount; i++) {
        const basePos = basePositions[i];
        
        if (isSpeaking) {
          // Create wave effect when speaking
          const distance = basePos.length();
          const wave = Math.sin(time * 3 + distance * 0.5) * 0.5 + 1;
          const scale = baseSizes[i] * wave;
          
          dummy.position.copy(basePos);
          dummy.position.multiplyScalar(1 + Math.sin(time * 2 + i * 0.1) * 0.1);
          dummy.scale.set(scale, scale, 1);
        } else {
          // Normal state
          dummy.position.copy(basePos);
          dummy.scale.set(baseSizes[i], baseSizes[i], 1);
        }
        
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
      }

      instancedMesh.instanceMatrix.needsUpdate = true;
      
      renderer.render(scene, camera);
      sceneRef.current.animationId = requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !sceneRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      sceneRef.current.camera.aspect = width / height;
      sceneRef.current.camera.updateProjectionMatrix();
      sceneRef.current.renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (sceneRef.current) {
        if (sceneRef.current.animationId) {
          cancelAnimationFrame(sceneRef.current.animationId);
        }
        sceneRef.current.renderer.dispose();
        sceneRef.current.scene.traverse((object: any) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((mat: any) => mat.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
        if (container.contains(sceneRef.current.renderer.domElement)) {
          container.removeChild(sceneRef.current.renderer.domElement);
        }
      }
    };
  }, [isSpeaking, isActive]);

  // Update colors when active state changes
  useEffect(() => {
    if (!sceneRef.current) return;

    const { instancedMesh, particleCount } = sceneRef.current;
    const baseColor = new THREE.Color(0xd7d7d7);
    const activeColor = new THREE.Color(0x8587e3);
    const targetColor = isActive ? activeColor : baseColor;

    for (let i = 0; i < particleCount; i++) {
      instancedMesh.setColorAt(i, targetColor);
    }

    if (instancedMesh.instanceColor) {
      instancedMesh.instanceColor.needsUpdate = true;
    }
  }, [isActive]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ minHeight: "300px" }}
    />
  );
}


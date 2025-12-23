"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import * as THREE from "three";
import { createSceneSetup } from "./lib/initialSetup";
import { createParticleSystem, ParticleSystem } from "./lib/particlesSetup";
import { loadModelPointsCancellable } from "./lib/modelLoader";
import { setupInteractions } from "./lib/interactions";
import { startAnimationLoop } from "./lib/animations";
import { useActiveIndex, useLoading } from "@/store";

export default function Particles3D() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationCancelRef = useRef<() => void>(() => {});
  const setisLoading = useLoading((s) => s.setisLoading);
  const setActiveIndex = useActiveIndex((s) => s.setActiveIndex);
  const mountedRef = useRef(false);
  const pathname = usePathname(); // Re-init animation on route changes

  useEffect(() => {
    if (!containerRef.current) return;
    mountedRef.current = true;

    const { scene, camera, renderer, resizeToContainer, disposeRenderer } =
      createSceneSetup(containerRef.current);

    const baseColor = 0xd7d7d7;
    const hoverColor = 0xbbbcf7;
    
    // Optimize particle count based on device performance
    const isMobile = window.innerWidth < 768;
    const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
    const particleCount = isMobile || isLowEndDevice ? 2000 : 4000;

    const particleSystem: ParticleSystem = createParticleSystem({
      particleCount,
      texturePath: "./images/glowingCircle2.png",
      radius: 20,
      baseColor,
    });

    scene.add(particleSystem.shapeGroup);

    const modelPositionsArray: THREE.Vector3[][] = [
      particleSystem.basePositions,
    ];

    // cancellable model loads (keeps original loadModelPoints available)
    const loaders = [
      loadModelPointsCancellable("./models/CubeHollow.glb", particleCount, 13),
      loadModelPointsCancellable("./models/development.glb", particleCount, 12),
      loadModelPointsCancellable("./models/marketing.glb", particleCount, 12),
      loadModelPointsCancellable("./models/DNA2.glb", particleCount, 7),
      loadModelPointsCancellable("./models/AImodel.glb", particleCount, 12),
      loadModelPointsCancellable("./models/security.glb", particleCount, 14),
    ];

    Promise.all(loaders.map((l) => l.promise))
      .then((models) => {
        if (!mountedRef.current) return;
        modelPositionsArray.push(...models);
      })
      .catch((err) => {
        console.error("Model load error:", err);
      })
      .finally(() => {
        if (mountedRef.current) setTimeout(() => setisLoading(false), 0);
      });

    const {
      mouse,
      morphProgressRef,
      currentIndexRef,
      nextIndexRef,
      onResize,
      dispose: disposeInteractions,
    } = setupInteractions(
      modelPositionsArray,
      containerRef.current,
      setActiveIndex
    );

    const resizeHandler = () => {
      resizeToContainer();
      onResize(camera, renderer, containerRef.current!);
    };
    window.addEventListener("resize", resizeHandler);

    animationCancelRef.current = startAnimationLoop({
      scene,
      camera,
      renderer,
      particleSystem,
      modelPositionsArray,
      mouse,
      morphProgressRef,
      currentIndexRef,
      nextIndexRef,
      hoverColor,
    });

    return () => {
      mountedRef.current = false;

      // cancel RAF & tweens
      animationCancelRef.current();

      // listeners
      window.removeEventListener("resize", resizeHandler);

      // interactions (GSAP + window events)
      disposeInteractions();

      // particle system resources
      // also remove from scene to drop refs
      scene.remove(particleSystem.shapeGroup);
      particleSystem.dispose?.();

      // defensive cleanup in case anything else was added

      scene.traverse((o: any) => {
        if (o.geometry?.dispose) o.geometry.dispose();
        const mat = o.material;
        const disposeMat = (m: any) => {
          if (!m) return;
          for (const k in m) {
            const v = m[k];
            if (v && v.isTexture && v.dispose) v.dispose();
          }
          m.dispose?.();
        };
        if (Array.isArray(mat)) mat.forEach(disposeMat);
        else disposeMat(mat);
      });
      while (scene.children.length) scene.remove(scene.children[0]);

      // renderer (remove canvas + force context loss + dispose)
      disposeRenderer();

      // abort any inflight model loads
      loaders.forEach((l) => l.abort());
    };
  }, [setActiveIndex, setisLoading, pathname]); // Re-init on pathname change for reliable navigation

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%" }}
      className="relative z-10 "
    />
  );
}

import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export type IndexRef = { current: number };
export type ProgressRef = { current: number };

export function setupInteractions(
  container: HTMLDivElement,
  morphToShape: (index: number) => void
) {
  const mouse = new THREE.Vector2(-10, -10);
  const currentIndexRef: IndexRef = { current: 0 };
  const nextIndexRef: IndexRef = { current: 1 };
  const morphProgressRef: ProgressRef = { current: 0 };

  const onMouseMove = (event: MouseEvent) => {
    const b = container.getBoundingClientRect();
    mouse.x = ((event.clientX - b.left) / b.width) * 2 - 1;
    mouse.y = -((event.clientY - b.top) / b.height) * 2 + 1;
  };

  const onTouchMove = (event: TouchEvent) => {
    const b = container.getBoundingClientRect();
    mouse.x = ((event.touches[0].clientX - b.left) / b.width) * 2 - 1;
    mouse.y = -((event.touches[0].clientY - b.top) / b.height) * 2 + 1;
  };

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("touchmove", onTouchMove, { passive: true });

  // ---- GSAP timelines with ScrollTriggers

  const ctx = gsap.context(() => {
    const media = gsap.matchMedia();
    media.add(
      {
        // Treat below 1024px as mobile
        isDesktop: "(min-width: 1536px)",
        isScreen1: "(min-width: 1350px)",
        isTabletUp: "(min-width: 1024px)",
      },
      (context) => {
        const { isDesktop, isScreen1, isTabletUp } = context.conditions!;

        // On phones (<1024px), do NOT transform the particles or morph on scroll
        if (!isTabletUp) {
          // Ensure sphere stays centered and static on mobile
          gsap.set("#particles3d", { clearProps: "x,y", x: 0, y: 0 });
          return;
        }

        const xValue = isDesktop ? "-55%" : isScreen1 ? "-60%" : "-50%";

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "+=90%",
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (self.progress > 0.6) morphToShape(1);
              if (self.progress < 0.5) morphToShape(0);
            },
          },
        });

        timeline.to(
          "#particles3d",
          { duration: 1, ease: "power1.inOut", x: xValue },
          0
        );
      }
    );

    const isTabletUpForExit = window.matchMedia("(min-width: 1024px)").matches;
    const scrollTriggerExit: ScrollTrigger.Vars | undefined = isTabletUpForExit
      ? {
          trigger: "#service-section",
          start: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
        }
      : undefined;
    const timeline3 = gsap.timeline({ scrollTrigger: scrollTriggerExit });

    if (window.matchMedia("(min-width: 1024px)").matches) {
      timeline3.to("#particles3d", {
        duration: 1,
        delay: 0.2,
        ease: "none",
        y: "-100%",
      });
    }
  });

  function onResize(
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer,
    container: HTMLDivElement
  ) {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  function dispose() {
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("touchmove", onTouchMove);
    ctx.revert();
  }

  return {
    mouse,
    morphProgressRef,
    currentIndexRef,
    nextIndexRef,
    onResize,
    morphToShape,
    dispose,
  };
}

import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export type IndexRef = { current: number };
export type ProgressRef = { current: number };
export function setupInteractions(
  modelPositionsArray: THREE.Vector3[][],
  container: HTMLDivElement,
  setActiveIndex: (index: number) => void
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
  window.addEventListener("touchmove", onTouchMove);
  let animating = false;
  const morphToShape = (index: number) => {
    const clamped = Math.max(
      0,
      Math.min(index, modelPositionsArray.length - 1)
    );
    if (animating || clamped === currentIndexRef.current) return;
    animating = true;
    nextIndexRef.current = clamped;
    const timeline = gsap.timeline({
      defaults: { duration: 1, ease: "power2.inOut" },
      onComplete: () => {
        currentIndexRef.current = clamped;
        morphProgressRef.current = 0;
        animating = false;
      },
    });
    timeline.to(morphProgressRef, { current: 1 }, 0);
  };
  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: "body",
      start: "top top",
      endTrigger: "#services",
      end: "center center",
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (self.progress > 0.6) {
          morphToShape(1);
        }
        if (self.progress < 0.5) {
          morphToShape(0);
        }
      },
    },
  });
  timeline
    .to(
      "#particles3d",
      {
        duration: 1,
        ease: "power1.inOut",
        x: -500,
      },
      0
    )
    .to(
      "#hero-title",
      {
        duration: 1,
        ease: "power1.out",
        y: -200,
      },
      0
    )
    .to(
      "#hero-stats",
      {
        duration: 0.2,
        delay: 0.1,
        ease: "power1.inOut",
        opacity: 0,
        y: 50,
      },
      0
    );
  timeline.to(
    "#hero-stats",
    {
      pointerEvents: "none",
      delay: 0.2,
    },
    0
  );
  const cardElements = gsap.utils.toArray(".service-card") as HTMLElement[];
  const timeline2 = gsap.timeline({
    scrollTrigger: {
      trigger: "#services",
      start: "center center",
      end: "+=4000",
      pinSpacing: true,
      pin: true,
      markers: true,
      scrub: true,
    },
  });
  const pauseDuration = 1;
  cardElements.forEach((el, index) => {
    if (index === cardElements.length - 1) return;
    const cardWidth = el.offsetWidth;
    timeline2.to(
      "#service-cards",
      {
        x: -(cardWidth * (1 + index)),
        duration: 1,
        onComplete: () => {
          setActiveIndex(index + 1);
          morphToShape(index + 2);
        },
        onReverseComplete: () => {
          setActiveIndex(index);
          morphToShape(index + 1);
        },
      },
      `+=${pauseDuration}`
    );
    timeline2.to(
      cardElements[index],
      { opacity: 0, scale: 0.5, delay: 1, duration: 0.5, ease: "power1.inOut" },
      "<-0.7"
    );
  });
  const timeline3 = gsap.timeline({
    scrollTrigger: {
      trigger: "#service-section",
      start: "bottom bottom",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
  timeline3.to("#particles3d", {
    duration: 1,
    delay: 0.2,
    ease: "none",
    y: "-100%",
  });
  function onResize(
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer,
    container: HTMLDivElement
  ) {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  return {
    mouse,
    morphProgressRef,
    currentIndexRef,
    nextIndexRef,
    onResize,
    morphToShape,
  };
}

export function setupInteractions1(
  modelPositionsArray: THREE.Vector3[][],
  container: HTMLDivElement,
  setActiveIndex: (index: number) => void
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

  let animating = false;
  const morphToShape = (index: number) => {
    const clamped = Math.max(
      0,
      Math.min(index, modelPositionsArray.length - 1)
    );
    if (animating || clamped === currentIndexRef.current) return;
    animating = true;
    nextIndexRef.current = clamped;

    const timeline = gsap.timeline({
      defaults: { duration: 1, ease: "power2.inOut" },
      onComplete: () => {
        currentIndexRef.current = clamped;
        morphProgressRef.current = 0;
        animating = false;
      },
    });

    timeline.to(morphProgressRef, { current: 1 }, 0);
  };

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

        if (isTabletUp) {
          const cardElements = gsap.utils.toArray(
            ".service-card"
          ) as HTMLElement[];
          const scrollTriggerCards: ScrollTrigger.Vars | undefined = {
            trigger: "#services",
            start: "center center",
            end: "+=3000",
            pinSpacing: true,
            pin: true,
            scrub: true,
          };

          const timeline2 = gsap.timeline({
            scrollTrigger: scrollTriggerCards,
          });

          const pauseDuration = 0.5;

          cardElements.forEach((el, index) => {
            if (index === cardElements.length - 1) return;
            const cardWidth = el.offsetWidth;

            timeline2.to(
              "#service-cards",
              {
                x: -(cardWidth * (1 + index)),
                duration: 1,
                onComplete: () => {
                  setActiveIndex(index + 1);
                  morphToShape(index + 2);
                },
                onReverseComplete: () => {
                  setActiveIndex(index);
                  morphToShape(index + 1);
                },
              },
              `+=${pauseDuration}`
            );
            timeline2.to(
              cardElements[index],
              {
                opacity: 0,
                scale: 0.5,
                delay: 1,
                duration: 0.5,
                ease: "power1.inOut",
              },
              "<-0.7"
            );
          });

          const scrollTriggerExit: ScrollTrigger.Vars = {
            trigger: "#service-section",
            start: "bottom bottom",
            scrub: true,
            invalidateOnRefresh: true,
          };

          const timeline3 = gsap.timeline({ scrollTrigger: scrollTriggerExit });

          timeline3.to("#particles3d", {
            duration: 1,
            delay: 0.2,
            ease: "none",
            y: "-100%",
          });
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

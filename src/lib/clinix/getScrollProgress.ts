/**
 * Scroll progress for the Clinix pinned section.
 * progress 0 = section top at top of viewport; progress 1 = section bottom at top of viewport.
 */

export function getScrollProgress(
  sectionTop: number,
  sectionHeight: number,
  viewportHeight: number,
  scrollY: number
): number {
  const scrollableHeight = sectionHeight - viewportHeight;
  if (scrollableHeight <= 0) return 0;
  const progress = (scrollY - sectionTop) / scrollableHeight;
  return Math.max(0, Math.min(1, progress));
}

export function getFrameIndex(progress: number, totalFrames: number): number {
  if (totalFrames <= 1) return 0;
  const index = Math.floor(progress * (totalFrames - 1));
  return Math.max(0, Math.min(totalFrames - 1, index));
}

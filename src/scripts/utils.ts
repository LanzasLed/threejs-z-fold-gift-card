import {
  Scene,
  AmbientLight,
  DirectionalLight,
  RectAreaLight,
  PCFSoftShadowMap,
  Color
} from 'three';

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Cubic ease-in-out function for smooth animations
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Setup lighting for the Three.js scene
 */
export function setupLighting(scene: Scene, enableShadows: boolean): void {
  // Strong ambient light for bright base illumination
  const ambientLight = new AmbientLight(new Color(0xffffff), 1.4);
  scene.add(ambientLight);

  // Bright wide horizontal RectAreaLight simulating fluorescent tube lighting
  const rectLight = new RectAreaLight(new Color(0xffffff), 4.0, 2000, 400); // Increased intensity
  rectLight.position.set(0, 500, 1200); // In front, elevated
  rectLight.lookAt(0, 0, 0); // Point at card
  scene.add(rectLight);
}

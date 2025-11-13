/**
 * Card state enum
 */
export enum CardState {
  FOLDED = 'folded',
  UNFOLDED = 'unfolded'
}

/**
 * Configuration interface for ZFoldCard
 */
export interface ICardConfig {
  canvasSelector: string;  // Canvas element query selector
  duration: number;        // Animation duration in milliseconds
  cameraDistance: number;  // Camera Z position
  enableShadows: boolean;  // Enable shadow rendering
}

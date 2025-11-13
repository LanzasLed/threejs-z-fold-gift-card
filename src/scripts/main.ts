import { ZFoldCard } from './ZFoldCard';
import { ICardConfig } from './types';

/**
 * Entry point - Initialize the Z-Fold Gift Card
 */
const config: ICardConfig = {
  canvasSelector: '#canvas',
  duration: 800,           // 800ms animation duration
  cameraDistance: 1000,    // Adjusted to keep card visible and fit when unfolded
  enableShadows: false     // Disable shadows for cleaner look
};

// Instantiate card when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ZFoldCard(config);
  });
} else {
  new ZFoldCard(config);
}


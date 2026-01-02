/**
 * Landing Pages Module
 * Exports all landing page variations and their configurations
 */

export type { LandingPageConfig, LandingPageComponent, BackHandler } from './types';

export { LandingV1Minimal, configV1 } from './landing-v1-minimal';
export { LandingV2Showcase, configV2 } from './landing-v2-showcase';
export { LandingV3Immersive, configV3 } from './landing-v3-immersive';

import { configV1 } from './landing-v1-minimal';
import { configV2 } from './landing-v2-showcase';
import { configV3 } from './landing-v3-immersive';

/** All available landing page configurations */
export const LANDING_PAGE_CONFIGS = [configV1, configV2, configV3];

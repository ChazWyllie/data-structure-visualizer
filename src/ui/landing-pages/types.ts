/**
 * Landing Page Types
 * Shared types for landing page variations
 */

export interface LandingPageConfig {
  id: string;
  name: string;
  description: string;
  style: 'minimal' | 'showcase' | 'immersive';
}

export interface LandingPageComponent {
  mount(): void;
  unmount(): void;
  isMounted(): boolean;
}

export type BackHandler = () => void;

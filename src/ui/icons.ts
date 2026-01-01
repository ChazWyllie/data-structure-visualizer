/**
 * SVG Icon System
 * Clean, scalable icons for professional UI
 * Designed to match Apple's SF Symbols style
 */

export interface IconProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
}

const defaultProps: Required<IconProps> = {
  size: 20,
  strokeWidth: 1.5,
  className: '',
};

/**
 * Create an SVG element with consistent attributes
 */
function createSvg(props: IconProps, pathContent: string): string {
  const { size, strokeWidth, className } = { ...defaultProps, ...props };
  return `<svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="${size}" 
    height="${size}" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="${strokeWidth}" 
    stroke-linecap="round" 
    stroke-linejoin="round"
    class="icon ${className}"
    aria-hidden="true"
  >${pathContent}</svg>`;
}

// =============================================================================
// Playback Control Icons
// =============================================================================

/** Play icon - right-pointing triangle */
export function iconPlay(props: IconProps = {}): string {
  return createSvg(props, '<polygon points="5 3 19 12 5 21 5 3"></polygon>');
}

/** Pause icon - two vertical bars */
export function iconPause(props: IconProps = {}): string {
  return createSvg(
    props,
    '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>'
  );
}

/** Step backward icon - left arrow with bar */
export function iconStepBack(props: IconProps = {}): string {
  return createSvg(
    props,
    '<polygon points="11 19 2 12 11 5 11 19"></polygon><line x1="22" y1="12" x2="11" y2="12"></line>'
  );
}

/** Step forward icon - right arrow with bar */
export function iconStepForward(props: IconProps = {}): string {
  return createSvg(
    props,
    '<polygon points="13 19 22 12 13 5 13 19"></polygon><line x1="2" y1="12" x2="13" y2="12"></line>'
  );
}

/** Skip to start icon - double left arrows with bar */
export function iconSkipStart(props: IconProps = {}): string {
  return createSvg(
    props,
    '<polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line>'
  );
}

/** Skip to end icon - double right arrows with bar */
export function iconSkipEnd(props: IconProps = {}): string {
  return createSvg(
    props,
    '<polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line>'
  );
}

// =============================================================================
// Theme Icons
// =============================================================================

/** Sun icon - for light mode */
export function iconSun(props: IconProps = {}): string {
  return createSvg(
    props,
    `
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  `
  );
}

/** Moon icon - for dark mode */
export function iconMoon(props: IconProps = {}): string {
  return createSvg(props, '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>');
}

// =============================================================================
// UI Icons
// =============================================================================

/** Chevron down icon - for dropdowns */
export function iconChevronDown(props: IconProps = {}): string {
  return createSvg(props, '<polyline points="6 9 12 15 18 9"></polyline>');
}

/** Chevron up icon - for collapsible panels */
export function iconChevronUp(props: IconProps = {}): string {
  return createSvg(props, '<polyline points="18 15 12 9 6 15"></polyline>');
}

/** Check icon - for confirmations */
export function iconCheck(props: IconProps = {}): string {
  return createSvg(props, '<polyline points="20 6 9 17 4 12"></polyline>');
}

/** X/Close icon */
export function iconX(props: IconProps = {}): string {
  return createSvg(
    props,
    '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>'
  );
}

/** Refresh/Reset icon */
export function iconRefresh(props: IconProps = {}): string {
  return createSvg(
    props,
    '<polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>'
  );
}

/** Home icon */
export function iconHome(props: IconProps = {}): string {
  return createSvg(
    props,
    '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>'
  );
}

/** Arrow right icon - for navigation */
export function iconArrowRight(props: IconProps = {}): string {
  return createSvg(
    props,
    '<line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>'
  );
}

// =============================================================================
// Category Icons (for landing page cards)
// =============================================================================

/** Sort icon - for sorting algorithms */
export function iconSort(props: IconProps = {}): string {
  return createSvg(
    props,
    '<line x1="4" y1="6" x2="16" y2="6"></line><line x1="4" y1="12" x2="12" y2="12"></line><line x1="4" y1="18" x2="8" y2="18"></line>'
  );
}

/** Graph/Network icon - for graph algorithms */
export function iconGraph(props: IconProps = {}): string {
  return createSvg(
    props,
    `
    <circle cx="6" cy="6" r="3"></circle>
    <circle cx="18" cy="6" r="3"></circle>
    <circle cx="6" cy="18" r="3"></circle>
    <circle cx="18" cy="18" r="3"></circle>
    <line x1="8.5" y1="7.5" x2="15.5" y2="16.5"></line>
    <line x1="15.5" y1="7.5" x2="8.5" y2="16.5"></line>
  `
  );
}

/** Layers/Stack icon - for data structures */
export function iconLayers(props: IconProps = {}): string {
  return createSvg(
    props,
    `
    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
    <polyline points="2 17 12 22 22 17"></polyline>
    <polyline points="2 12 12 17 22 12"></polyline>
  `
  );
}

/** Tree icon - for tree structures */
export function iconTree(props: IconProps = {}): string {
  return createSvg(
    props,
    `
    <circle cx="12" cy="5" r="2"></circle>
    <circle cx="6" cy="13" r="2"></circle>
    <circle cx="18" cy="13" r="2"></circle>
    <circle cx="3" cy="20" r="2"></circle>
    <circle cx="9" cy="20" r="2"></circle>
    <circle cx="15" cy="20" r="2"></circle>
    <circle cx="21" cy="20" r="2"></circle>
    <line x1="12" y1="7" x2="6" y2="11"></line>
    <line x1="12" y1="7" x2="18" y2="11"></line>
    <line x1="6" y1="15" x2="3" y2="18"></line>
    <line x1="6" y1="15" x2="9" y2="18"></line>
    <line x1="18" y1="15" x2="15" y2="18"></line>
    <line x1="18" y1="15" x2="21" y2="18"></line>
  `
  );
}

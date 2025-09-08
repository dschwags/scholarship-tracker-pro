/**
 * Utility functions for consistent alternating row colors across the application
 */

export interface AlternatingColorOptions {
  /** Custom even row background (defaults to gray) */
  evenBackground?: string;
  /** Custom odd row background (defaults to white) */
  oddBackground?: string;
  /** Custom even row hover (defaults to blue) */
  evenHover?: string;
  /** Custom odd row hover (defaults to yellow) */
  oddHover?: string;
  /** Whether to include hover effects */
  includeHover?: boolean;
}

/**
 * Get alternating row classes for consistent styling across components
 */
export function getAlternatingRowClasses(
  index: number, 
  options: AlternatingColorOptions = {}
): string {
  const {
    evenBackground = 'bg-gray-50/50 dark:bg-gray-800/30',
    oddBackground = 'bg-white dark:bg-gray-900',
    evenHover = 'hover:bg-blue-50 dark:hover:bg-blue-900/30',
    oddHover = 'hover:bg-yellow-50 dark:hover:bg-yellow-900/30',
    includeHover = true
  } = options;

  const isEven = index % 2 === 0;
  
  const baseClasses = isEven ? evenBackground : oddBackground;
  const hoverClasses = includeHover 
    ? (isEven ? evenHover : oddHover)
    : '';
  
  return `${baseClasses} ${hoverClasses}`.trim();
}

/**
 * Get alternating colors for form fields and settings items
 */
export function getFormItemClasses(index: number): string {
  return getAlternatingRowClasses(index, {
    evenBackground: 'bg-gray-50/30 dark:bg-gray-800/20',
    oddBackground: 'bg-white/50 dark:bg-gray-900/50',
    evenHover: 'hover:bg-blue-50/50 dark:hover:bg-blue-900/20',
    oddHover: 'hover:bg-yellow-50/50 dark:hover:bg-yellow-900/20',
    includeHover: true
  });
}

/**
 * Get alternating colors for requirement lists
 */
export function getRequirementItemClasses(index: number): string {
  return getAlternatingRowClasses(index, {
    evenBackground: 'bg-gray-50/40 dark:bg-gray-800/25',
    oddBackground: 'bg-white/60 dark:bg-gray-900/40',
    evenHover: 'hover:bg-blue-50/60 dark:hover:bg-blue-900/25',
    oddHover: 'hover:bg-yellow-50/60 dark:hover:bg-yellow-900/25',
    includeHover: true
  });
}
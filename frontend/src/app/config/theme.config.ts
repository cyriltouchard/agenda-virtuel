export interface Theme {
  name: string;
  properties: {
    [key: string]: string;
  };
}

export const lightTheme: Theme = {
  name: 'light',
  properties: {
    // Couleurs primaires modernes
    '--primary-50': '#f0f9ff',
    '--primary-100': '#e0f2fe',
    '--primary-200': '#bae6fd',
    '--primary-300': '#7dd3fc',
    '--primary-400': '#38bdf8',
    '--primary-500': '#0ea5e9',
    '--primary-600': '#0284c7',
    '--primary-700': '#0369a1',
    '--primary-800': '#075985',
    '--primary-900': '#0c4a6e',

    // Couleurs d'accent
    '--accent-50': '#fdf4ff',
    '--accent-100': '#fae8ff',
    '--accent-200': '#f5d0fe',
    '--accent-300': '#f0abfc',
    '--accent-400': '#e879f9',
    '--accent-500': '#d946ef',
    '--accent-600': '#c026d3',
    '--accent-700': '#a21caf',
    '--accent-800': '#86198f',
    '--accent-900': '#701a75',

    // Couleurs de fond et surfaces
    '--background': '#ffffff',
    '--surface': '#f8fafc',
    '--surface-variant': '#f1f5f9',
    '--surface-elevated': '#ffffff',

    // Couleurs de texte
    '--on-background': '#0f172a',
    '--on-surface': '#334155',
    '--on-surface-variant': '#64748b',
    '--on-primary': '#ffffff',
    '--on-accent': '#ffffff',

    // Couleurs de bordure
    '--border': '#e2e8f0',
    '--border-light': '#f1f5f9',
    '--divider': '#e2e8f0',

    // Couleurs d'état
    '--success': '#059669',
    '--success-light': '#ecfdf5',
    '--warning': '#d97706',
    '--warning-light': '#fffbeb',
    '--error': '#dc2626',
    '--error-light': '#fef2f2',
    '--info': '#2563eb',
    '--info-light': '#eff6ff',

    // Ombres modernes
    '--shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    '--shadow': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    '--shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    '--shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    '--shadow-xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',

    // Rayons de bordure
    '--radius-sm': '0.125rem',
    '--radius': '0.375rem',
    '--radius-md': '0.5rem',
    '--radius-lg': '0.75rem',
    '--radius-xl': '1rem',
    '--radius-full': '9999px',

    // Espacement
    '--spacing-xs': '0.25rem',
    '--spacing-sm': '0.5rem',
    '--spacing-md': '1rem',
    '--spacing-lg': '1.5rem',
    '--spacing-xl': '2rem',
    '--spacing-2xl': '3rem',
  }
};

export const darkTheme: Theme = {
  name: 'dark',
  properties: {
    // Couleurs primaires pour thème sombre
    '--primary-50': '#0c4a6e',
    '--primary-100': '#075985',
    '--primary-200': '#0369a1',
    '--primary-300': '#0284c7',
    '--primary-400': '#0ea5e9',
    '--primary-500': '#38bdf8',
    '--primary-600': '#7dd3fc',
    '--primary-700': '#bae6fd',
    '--primary-800': '#e0f2fe',
    '--primary-900': '#f0f9ff',

    // Couleurs d'accent pour thème sombre
    '--accent-50': '#701a75',
    '--accent-100': '#86198f',
    '--accent-200': '#a21caf',
    '--accent-300': '#c026d3',
    '--accent-400': '#d946ef',
    '--accent-500': '#e879f9',
    '--accent-600': '#f0abfc',
    '--accent-700': '#f5d0fe',
    '--accent-800': '#fae8ff',
    '--accent-900': '#fdf4ff',

    // Couleurs de fond et surfaces
    '--background': '#0f172a',
    '--surface': '#1e293b',
    '--surface-variant': '#334155',
    '--surface-elevated': '#475569',

    // Couleurs de texte
    '--on-background': '#f8fafc',
    '--on-surface': '#e2e8f0',
    '--on-surface-variant': '#cbd5e1',
    '--on-primary': '#0f172a',
    '--on-accent': '#0f172a',

    // Couleurs de bordure
    '--border': '#475569',
    '--border-light': '#334155',
    '--divider': '#475569',

    // Couleurs d'état
    '--success': '#10b981',
    '--success-light': '#064e3b',
    '--warning': '#f59e0b',
    '--warning-light': '#78350f',
    '--error': '#ef4444',
    '--error-light': '#7f1d1d',
    '--info': '#3b82f6',
    '--info-light': '#1e3a8a',

    // Ombres pour thème sombre
    '--shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.3)',
    '--shadow': '0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)',
    '--shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
    '--shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
    '--shadow-xl': '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)',

    // Rayons de bordure (identiques)
    '--radius-sm': '0.125rem',
    '--radius': '0.375rem',
    '--radius-md': '0.5rem',
    '--radius-lg': '0.75rem',
    '--radius-xl': '1rem',
    '--radius-full': '9999px',

    // Espacement (identiques)
    '--spacing-xs': '0.25rem',
    '--spacing-sm': '0.5rem',
    '--spacing-md': '1rem',
    '--spacing-lg': '1.5rem',
    '--spacing-xl': '2rem',
    '--spacing-2xl': '3rem',
  }
};

// Configuration des animations
export const animations = {
  // Durées
  'duration-fast': '150ms',
  'duration-normal': '300ms',
  'duration-slow': '500ms',
  
  // Easings
  'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
  'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
  'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  'ease-spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
};

// Breakpoints responsive
export const breakpoints = {
  'xs': '480px',
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
};
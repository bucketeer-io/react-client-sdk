// Extend globalThis interface to include platform-specific globals
declare global {
  // React Native global
  const __DEV__: boolean | undefined;
  // Node.js global (for React web)
  const process:
    | {
        env: {
          NODE_ENV?: string;
          [key: string]: string | undefined;
        };
      }
    | undefined;
}

// Helper function to safely check if we should log debug info
export const shouldLogDebug = (): boolean => {
  try {
    // Check for React Native __DEV__ global first
    if (typeof __DEV__ !== 'undefined') {
      return __DEV__;
    }

    // Check if we're running on localhost (Vite dev server)
    if (typeof window !== 'undefined' && window.location) {
      const hostname = window.location.hostname;
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '0.0.0.0'
      ) {
        return true;
      }
    }

    // Fallback to NODE_ENV for React web and other environments
    if (typeof process !== 'undefined' && process?.env?.NODE_ENV) {
      return process.env.NODE_ENV === 'development';
    }
  } catch {
    // If all checks fail, default to false for production safety
  }
  return false;
};

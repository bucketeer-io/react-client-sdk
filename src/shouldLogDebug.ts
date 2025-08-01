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
    // Fallback to NODE_ENV for React web
    if (typeof process !== 'undefined' && process?.env?.NODE_ENV) {
      return process.env.NODE_ENV === 'development';
    }
  } catch {
    // If all checks fail, default to false for production safety
  }
  return false;
};

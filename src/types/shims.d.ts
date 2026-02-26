declare module "react-router-dom";

// Minimal process typing for SSR/build usage without requiring @types/node at runtime
declare const process: {
  env?: Record<string, string | undefined>;
};

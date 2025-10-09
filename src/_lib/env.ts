export const getEnv = (key: string): string | undefined => {
  return import.meta.env[key] || process.env[key];
};
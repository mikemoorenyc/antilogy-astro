export const getEnv = (key: string): string  => {
  if(process) {
    return process.env[key]||""
  }
  return import.meta.env[key] || ""

};
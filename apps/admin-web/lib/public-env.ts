export function getPublicEnv(name: string, fallback?: string) {
  const value =
    (typeof process !== "undefined" ? process.env[name] : undefined) ||
    (fallback && typeof process !== "undefined" ? process.env[fallback] : undefined);

  return value || "";
}

export function assertPublicEnv(name: string, fallback?: string) {
  const value = getPublicEnv(name, fallback);
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

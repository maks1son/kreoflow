export function safeReturnPath(value: string | null | undefined, fallback = "/studio") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

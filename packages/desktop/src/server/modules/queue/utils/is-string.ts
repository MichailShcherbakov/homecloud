export function isString(maybeString: any) {
  return maybeString instanceof String || typeof maybeString === "string";
}

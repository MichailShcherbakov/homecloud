export function toJSON(
  data: Record<string, any>,
  options: { compress: boolean } = { compress: false }
): string {
  if (options.compress) return JSON.stringify(data);

  return JSON.stringify(data, null, 4);
}

export function fromJSON<TData extends Record<string, any> = object>(
  json: string
): TData {
  return JSON.parse(json);
}

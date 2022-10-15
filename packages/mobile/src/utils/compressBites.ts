export function compressBites(n: number) {
  let gb = n;
  while (gb > 1024) gb /= 1024;
  return gb;
}

const Dimensions = ["bytes", "KB", "MB", "GB", "TB"];

export function compressBitesWithDimension(
  n: number,
  maxDimension: "bytes" | "KB" | "MB" | "GB" | "TB" = "TB"
): string {
  let gb = n;
  let i = 0;

  while (gb > 1024) {
    gb /= 1024;

    if (maxDimension && Dimensions[i] === maxDimension) break;

    i++;
  }
  return `${gb.toFixed(2)} ${Dimensions[i]}`;
}

import { dirname, parse } from "path";

export function getInfoFromPath(
  absoluteRootPath: string,
  absolutePath: string
) {
  const relativePath = absolutePath.replace(absoluteRootPath, "");

  const { name } = parse(absolutePath);

  return {
    filename: name,
    relativePath,
    relativeDirPath: dirname(relativePath),
  };
}

export function getInfoFromPath(
  absoluteRootPath: string,
  absolutePath: string
) {
  const relativePath = absolutePath
    .replaceAll("\\", "/")
    .replace(absoluteRootPath, "");

  const rawRelativePath = relativePath.split("/");

  const filename = rawRelativePath[rawRelativePath.length - 1].replace(
    /\.[^/.]+$/,
    ""
  );

  rawRelativePath.pop();

  const relativeDirPath = rawRelativePath.join("/");

  return {
    filename,
    relativePath,
    relativeDirPath,
  };
}

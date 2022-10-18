import { access as fsAccess } from "fs/promises";

export function access(path: string) {
  return fsAccess(path)
    .then(() => true)
    .catch(() => false);
}

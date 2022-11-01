import { access as fsAccess } from "fs/promises";
import { accessSync as fsAccessSync, constants } from "fs";

const MODE = constants.R_OK | constants.W_OK;

export function access(path: string) {
  return fsAccess(path, MODE)
    .then(() => true)
    .catch(() => false);
}

export function accessSync(path: string) {
  try {
    fsAccessSync(path, MODE);
    return true;
  } catch (err) {
    return false;
  }
}

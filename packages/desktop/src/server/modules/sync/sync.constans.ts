export const SYNC_QUEUE_NAME = "sync";

export enum SyncWorkerProcessEnum {
  ADD_FILE = "ADD_FILE",
  RENAME_FILE = "RENAME_FILE",
  MOVE_FILE = "MOVE_FILE",
  REMOVE_FILE = "REMOVE_FILE",
  ADD_DIR = "ADD_DIR",
  RENAME_DIR = "RENAME_DIR",
  MOVE_DIR = "MOVE_DIR",
  REMOVE_DIR = "REMOVE_DIR",
}

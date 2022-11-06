export interface IDropItem {
  kind: string;
}

export interface TextDropItem extends IDropItem {
  kind: "text";
  types: Set<string>;
  getText: (type: string) => Promise<string | undefined>;
}

export interface FileDropItem extends IDropItem {
  kind: "file";
  name: string;
  type: string;
  getFile: () => Promise<File>;
}

export interface DirectoryDropItem extends IDropItem {
  kind: "directory";
  name: string;
  getEntries: () => AsyncIterable<FileDropItem | DirectoryDropItem>;
}

export type DropItem = TextDropItem | FileDropItem | DirectoryDropItem;

export interface IDropEvent {
  type: string;
  x: number;
  y: number;
}

export interface DropEnterEvent extends IDropEvent {
  type: "dropenter";
}

export interface DropStartEvent extends IDropEvent {
  type: "dropstart";
}

export interface DropOverEvent extends IDropEvent {
  type: "dropover";
}

export interface DropLeaveEvent extends IDropEvent {
  type: "dropleave";
}

export interface DropEvent extends IDropEvent {
  type: "drop";
  items: DropItem[];
}

export interface DragItem {
  [key: string]: string;
}

export interface IDragEvent {
  type: string;
  x: number;
  y: number;
}

export interface DragStartEvent extends IDragEvent {
  type: "dragstart";
}

export interface DragMoveEvent extends IDragEvent {
  type: "dragmove";
}

export interface DragEndEvent extends IDragEvent {
  type: "dragend";
}

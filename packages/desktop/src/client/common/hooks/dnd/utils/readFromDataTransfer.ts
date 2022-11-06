import { fromJSON } from "@/server/utils/json";
import { CUSTOM_DRAG_TYPE, GENERIC_TYPE } from "../constants";
import { DirectoryDropItem, DropItem, FileDropItem } from "../types";

export function readFromDataTransfer(dataTransfer: DataTransfer) {
  const items: DropItem[] = [];

  let hasCustomType = false;

  if (dataTransfer.types.includes(CUSTOM_DRAG_TYPE)) {
    try {
      const data = dataTransfer.getData(CUSTOM_DRAG_TYPE);
      const raw = fromJSON<Record<string, any>>(data);
      for (const item of Object.values(raw)) {
        items.push({
          kind: "text",
          types: new Set<string>(Object.keys(item)),
          getText: type => Promise.resolve(item[type]),
        });
      }

      hasCustomType = true;
    } catch (e) {
      // ignore
    }
  }

  if (!hasCustomType) {
    const stringItems = new Map<string, string>();

    for (const item of dataTransfer.items) {
      if (item.kind === "string") {
        // The data for all formats must be read here because the data transfer gets
        // cleared out after the event handler finishes. If the item has an empty string
        // as a type, the mime type is unknown. Map to a generic mime type instead.
        stringItems.set(
          item.type ?? GENERIC_TYPE,
          dataTransfer.getData(item.type)
        );
      } else if (item.kind === "file") {
        if (typeof item.webkitGetAsEntry === "function") {
          const entry = item.webkitGetAsEntry();

          if (!entry) continue;

          if (entry.isFile) {
            const file = item.getAsFile();

            if (!file) continue;

            items.push(createFileItem(file));
          } else if (entry.isDirectory) {
            items.push(createDirectoryItem(entry));
          }
        }
      }
    }

    // All string items are different representations of the same item. There's no way to have
    // multiple string items at once in the current DataTransfer API.
    if (stringItems.size > 0) {
      items.push({
        kind: "text",
        types: new Set(stringItems.keys()),
        getText: type => Promise.resolve(stringItems.get(type)),
      });
    }
  }

  return items;
}

export function createFileItem(file: File): FileDropItem {
  return {
    kind: "file",
    type: file.type,
    name: file.name,
    getFile: () => Promise.resolve(file),
  };
}

export function createDirectoryItem(entry: any): DirectoryDropItem {
  return {
    kind: "directory",
    name: entry.name,
    getEntries: () => getEntries(entry),
  };
}

async function* getEntries(
  item: FileSystemDirectoryEntry
): AsyncIterable<FileDropItem | DirectoryDropItem> {
  const reader = item.createReader();

  let entries: FileSystemEntry[];
  do {
    entries = await new Promise((resolve, reject) => {
      reader.readEntries(resolve, reject);
    });

    for (let entry of entries) {
      if (entry.isFile) {
        const file = await getEntryFile(entry as FileSystemFileEntry);
        yield createFileItem(file);
      } else if (entry.isDirectory) {
        yield createDirectoryItem(entry);
      }
    }
  } while (entries.length > 0);
}

function getEntryFile(entry: FileSystemFileEntry): Promise<File> {
  return new Promise((resolve, reject) => entry.file(resolve, reject));
}

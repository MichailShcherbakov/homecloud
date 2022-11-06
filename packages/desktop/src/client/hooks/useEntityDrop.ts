import { Entity } from "@/server/modules/file-system/type";
import { fromJSON } from "@/server/utils/json";
import { DropEvent } from "../common/hooks/dnd/types";
import { useDrop } from "../common/hooks/dnd/useDrop";
import { QueueDestination, QueueTarget } from "../store/reducers/queue.reducer";
import { v4 as uuidv4 } from "uuid";

export const ALLOWED_FILE_TYPES = new Set([
  "video/x-msvideo", // .avi
  "video/mp4",
  "video/webm",
  "video/x-matroska",
]);

export type UploadTarget = QueueTarget;

export type UploadDestination = QueueDestination;

export interface EntitiesUpload {
  targets: QueueTarget[];
  destination: UploadDestination;
}

export interface UseEntityDropProps<TElement extends HTMLElement> {
  /** */
  dropRef: React.RefObject<TElement>;
  /** */
  isDisabled?: boolean;
  /** */
  onDrop?: (targets: UploadTarget[]) => void;
}

export function useEntityDrop<TElement extends HTMLElement>(
  props: UseEntityDropProps<TElement>
) {
  const { dropRef, isDisabled, onDrop } = props;

  const { dropProps, dropIndicatorProps, isDropTarget } = useDrop({
    dropRef,
    isDisabled,
    async onDrop(e: DropEvent) {
      const targets: UploadTarget[] = [];

      for (const item of e.items) {
        switch (item.kind) {
          case "text": {
            try {
              const json = await item.getText("application/json");

              if (!json) break;

              const { entity } = fromJSON<{ entity: Entity }>(json);

              if (!entity.uuid) break;

              targets.push({ uuid: uuidv4(), type: "entity", entity });
            } catch (e) {
              // ignore
            }

            break;
          }
          case "file": {
            if (!ALLOWED_FILE_TYPES.has(item.type)) break;

            const file = await item.getFile();

            targets.push({ uuid: uuidv4(), type: "file", file });
            break;
          }
          case "directory": {
            for await (const dirItem of item.getEntries()) {
              if (
                dirItem.kind !== "file" ||
                !ALLOWED_FILE_TYPES.has(dirItem.type)
              )
                break;

              const file = await dirItem.getFile();

              targets.push({ uuid: uuidv4(), type: "file", file });
            }
            break;
          }
        }
      }

      onDrop?.(targets);
    },
  });

  return {
    dropProps,
    dropIndicatorProps,
    isDropTarget,
  };
}

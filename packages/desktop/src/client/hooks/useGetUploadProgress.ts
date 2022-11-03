import React from "react";
import { StorageGatewayEventsEnum } from "@/server/modules/storage/storage.events";
import { File } from "@server/modules/file-system/type";
import { useSubscribe } from "../common/SubscriptionsContext";

export const useGetUploadProgress = () => {
  const uploadFileProgress = React.useMemo(() => new Map<string, number>(), []);

  const [progress, setProgress] = React.useState(0);

  useSubscribe(
    StorageGatewayEventsEnum.ON_NEW_ENTITY_UPLOAD_PROGRESS,
    (data: { file: File; progress: number }) => {
      const { file, progress } = data;

      uploadFileProgress.set(file.uuid, progress);

      const currentUploadFiles = uploadFileProgress.size;
      const currentProgressPercent = Array.from(uploadFileProgress).reduce(
        (amount, [, progress]) => amount + progress,
        0
      );

      setProgress(currentProgressPercent / currentUploadFiles);
    }
  );

  return {
    progress,
  };
};

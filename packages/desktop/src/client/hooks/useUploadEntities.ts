import React from "react";
import axios from "axios";
import { useMutation } from "react-query";
import { UploadDestination, UploadTarget } from "./useEntityDrop";
import { File as FileEntity } from "@/server/modules/file-system/type";

export interface UseUploadEntitiesOptions {
  /** */
  target: UploadTarget;
  /** */
  destination: UploadDestination | null;
  /** */
  onUploadProgress?: (target: UploadTarget, progress: number) => void;
  /** */
  onFulfilled?: (target: UploadTarget, file: FileEntity) => void;
}

export const useUploadEntities = () => {
  const [targetProgress, setTargetProgress] = React.useState(
    new Map<UploadTarget, number>()
  );

  const mutation = useMutation(
    ["upload-entities"],
    (options: UseUploadEntitiesOptions) => {
      const { target, destination, onFulfilled, onUploadProgress } = options;

      const formData = new FormData();

      if (target.type === "file") formData.append("file", target.file);
      if (target.type === "entity")
        formData.append("targetUUID", target.entity.uuid);
      if (destination) formData.append("destinationUUID", destination.uuid);

      return axios(`http://localhost:12536/storage/upload/`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        data: formData,
        onUploadProgress: progress => {
          const { total = 0, loaded } = progress;
          const totalSize = total / 1000000; // in MB
          const loadedSize = loaded / 1000000; //  in MB
          const uploadPercentage = (loadedSize / totalSize) * 100;

          setTargetProgress(targetProgress.set(target, uploadPercentage));

          onUploadProgress?.(target, uploadPercentage);
        },
      }).then(response => onFulfilled?.(target, response.data));
    }
  );

  return {
    targetProgress,
    upload: mutation.mutate,
    isLoading: mutation.isLoading,
    isSuccess: mutation.isSuccess,
  };
};

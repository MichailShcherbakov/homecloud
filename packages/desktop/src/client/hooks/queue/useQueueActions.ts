import React from "react";
import { useAppDispatch } from "../../store/hook";
import {
  addQueueJob,
  setQueueJobProgress,
  QueueJobStageEnum,
  QueueTarget,
  setQueueJobStage,
  QueueDestination,
} from "../../store/reducers/queue.reducer";
import { useUploadEntities } from "../useUploadEntities";

export interface UseQueueActionsOptions {}

export function useQueueActions(options: UseQueueActionsOptions = {}) {
  const dispatch = useAppDispatch();

  const { upload } = useUploadEntities();

  const addQueueJobHandler = React.useCallback(
    (
      target: QueueTarget,
      destination: QueueDestination | null,
      stage: QueueJobStageEnum
    ) => {
      dispatch(
        addQueueJob({
          target,
          destination,
          progress: 0,
          stage,
        })
      );

      if (stage !== QueueJobStageEnum.UPLOADING) return;

      upload({
        target,
        destination,
        onUploadProgress(target, progress) {
          dispatch(
            setQueueJobProgress({
              criteria: {
                target,
                destination,
              },
              progress,
            })
          );
        },
        onFulfilled(target) {
          dispatch(
            setQueueJobStage({
              criteria: {
                target,
                destination,
              },
              stage: QueueJobStageEnum.COMPLETED,
            })
          );
        },
      });
    },
    []
  );

  return {
    addQueueJob: addQueueJobHandler,
  };
}

import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
  File as FileEntity,
  Directory as DirectoryEntity,
  Directory,
} from "@/server/modules/file-system/type";

/*
[{
  target: File
  destination: Directory
  stage: 'upload'
  progress: 50
},
{
  target: FileEntity
  destination: Directory
  stage: 'processing'
  progress: 20
}]
*/

export interface IQueueTarget {
  uuid: string;
  type: string;
}

export interface FileQueueTarget extends IQueueTarget {
  type: "file";
  file: File;
}

export interface FileEntityQueueTarget extends IQueueTarget {
  type: "entity";
  entity: FileEntity | DirectoryEntity;
}

export type QueueTarget = FileQueueTarget | FileEntityQueueTarget;

export type QueueDestination = Directory;

export enum QueueJobStageEnum {
  UPLOADING = "UPLOADING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export interface QueueJob {
  target: QueueTarget;
  destination: QueueDestination | null;
  progress: number;
  stage: QueueJobStageEnum;
}

export interface QueueState {
  jobs: QueueJob[];
}

export const initialState: QueueState = {
  jobs: [],
};

export const queueSlice = createSlice({
  name: "queue",
  initialState,
  reducers: {
    addQueueJob(state, action: PayloadAction<QueueJob>) {
      const newJob = action.payload;

      const foundJob = getUncompletedQueueJob(state, {
        target: newJob.target,
        destination: newJob.destination,
      });

      if (foundJob) {
        foundJob.stage = newJob.stage;

        return;
      }

      state.jobs.unshift(action.payload);
    },
    setQueueJobProgress(
      state,
      action: PayloadAction<{
        criteria: Pick<QueueJob, "target" | "destination">;
        progress: number;
      }>
    ) {
      const { criteria, progress } = action.payload;

      const foundJob = getUncompletedQueueJob(state, criteria);

      if (!foundJob) return;

      foundJob.progress = progress;
    },
    setQueueJobStage(
      state,
      action: PayloadAction<{
        criteria: Pick<QueueJob, "target" | "destination">;
        stage: QueueJobStageEnum;
      }>
    ) {
      const { criteria, stage } = action.payload;

      const foundJob = getUncompletedQueueJob(state, criteria);

      if (!foundJob) return;

      foundJob.stage = stage;
    },
    updateQueueJobStage(
      state,
      action: PayloadAction<{
        criteria: Pick<QueueJob, "target" | "destination">;
        job: Partial<QueueJob>;
      }>
    ) {
      const { criteria, job: newJob } = action.payload;

      const foundJob = getUncompletedQueueJob(state, criteria);

      if (!foundJob) return;

      foundJob.target = newJob.target ?? foundJob.target;
      foundJob.destination = newJob.destination ?? foundJob.destination;
      foundJob.progress = newJob.progress ?? foundJob.progress;
      foundJob.stage = newJob.stage ?? foundJob.stage;
    },
  },
});

export const {
  addQueueJob,
  setQueueJobStage,
  setQueueJobProgress,
  updateQueueJobStage,
} = queueSlice.actions;

export const getUncompletedQueueJob = (
  state: QueueState,
  criteria: Pick<QueueJob, "target" | "destination">
) =>
  state.jobs.find(
    j =>
      j.target.uuid === criteria.target.uuid &&
      j.destination?.uuid === criteria.destination?.uuid &&
      j.stage !== QueueJobStageEnum.COMPLETED
  );

export default queueSlice.reducer;

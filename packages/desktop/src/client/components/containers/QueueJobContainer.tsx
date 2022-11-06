import React from "react";
import {
  LinearProgress,
  linearProgressClasses,
  Stack,
  Typography,
} from "@mui/material";
import { Entity } from "@/server/modules/file-system/type";
import { makeStyles } from "tss-react/mui";
import { useGetUploadProgress } from "@/client/hooks/useGetUploadProgress";
import { useQueue } from "@/client/hooks/queue/useQueue";
import { QueueJob } from "@/client/store/reducers/queue.reducer";
import { QueueJobCard } from "../cards/QueueJobCard";

export interface QueueJobContainerProps {}

export const QueueJobContainer: React.FC<QueueJobContainerProps> = () => {
  const { classes } = useStyle();

  const { queue } = useQueue();

  if (!queue.length) return null;

  return (
    <Stack className={classes.root}>
      <Stack className={classes.headerContainer}>
        <Typography className={classes.headerTitle}>Upload queue</Typography>
      </Stack>
      <Stack className={classes.queueContainer} spacing={1.5}>
        {queue.map(job => (
          <QueueJobCard
            key={`${job.target.uuid}_${job.destination?.uuid}`}
            job={job}
          />
        ))}
      </Stack>
      <LinearProgress
        variant="determinate"
        value={50}
        className={classes.progress}
      />
    </Stack>
  );
};

const useStyle = makeStyles()({
  root: {
    position: "absolute",
    bottom: 8,
    right: 8,
    maxWidth: 440,
    border: "1px solid #d1d1d1",
    borderRadius: 8,
    boxShadow: "0px 0px 14px 0px #ccc",
    backgroundColor: "#fff",
    zIndex: 32,
  },
  headerContainer: {
    padding: 12,
    borderBottom: "1px solid #d1d1d1",
  },
  headerTitle: {
    color: "#5a6474",
    fontSize: 14,
    fontWeight: 500,
  },
  queueContainer: {
    padding: 12,
    maxHeight: 196,
    overflow: "auto",
  },
  progress: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,

    [`& .${linearProgressClasses.bar}`]: {
      backgroundColor: "#3772ff",
    },

    [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor: "#C5D8F1",
    },
  },
});

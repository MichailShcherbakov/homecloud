import React from "react";
import { makeStyles } from "tss-react/mui";
import { CircularProgress, Stack, Typography } from "@mui/material";

import { ReactComponent as DirectoryIcon } from "@client/assets/folder.svg";
import { ReactComponent as FileIcon } from "@client/assets/file.svg";
import {
  QueueJob,
  QueueJobStageEnum,
} from "@/client/store/reducers/queue.reducer";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import { compressBitesWithDimension } from "@/common/utils/compressBites";

export interface EQueueJobCardProps {
  job: QueueJob;
}

export const QueueJobCard: React.FC<EQueueJobCardProps> = React.memo(
  ({ job }) => {
    const { classes } = useStyle();

    const icon =
      job.target.type === "file" || job.target.entity.isFile ? (
        <FileIcon className={classes.icon} />
      ) : (
        <DirectoryIcon className={classes.icon} />
      );

    const name =
      job.target.type === "file"
        ? job.target.file.name
        : job.target.entity.name;

    const lastModified =
      job.target.type === "file"
        ? new Date(job.target.file.lastModified)
        : new Date(job.target.entity.updatedAt);

    const size = compressBitesWithDimension(
      job.target.type === "file" ? job.target.file.size : job.target.entity.size
    );

    return (
      <Stack
        direction="row"
        alignItems="center"
        className={classes.root}
        spacing={1.5}
      >
        <Stack
          direction="column"
          alignItems="center"
          justifyContent="center"
          spacing={1}
          className={classes.iconContainer}
        >
          {icon}
        </Stack>
        <Stack direction="column" className={classes.textContainer}>
          <Typography className={classes.title}>{name}</Typography>
          <Typography className={classes.subtitle}>
            {size} | {lastModified.toISOString()}
          </Typography>
        </Stack>
        <Stack className={classes.spinnerContainer}>
          {job.stage === QueueJobStageEnum.COMPLETED ? (
            <CheckCircleIcon className={classes.badgeSuccess} />
          ) : job.stage === QueueJobStageEnum.FAILED ? (
            <ErrorRoundedIcon className={classes.badgeError} />
          ) : (
            <CircularProgress
              disableShrink
              size={24}
              thickness={5}
              className={classes.spinner}
            />
          )}
        </Stack>
      </Stack>
    );
  }
);
const useStyle = makeStyles()({
  root: {
    position: "relative",
  },
  iconContainer: {
    padding: 8,
    border: "1px solid #d1d1d1",
    borderRadius: 8,
  },
  icon: {
    width: 24,
    height: 24,
  },
  textContainer: {
    width: "100%",
    overflow: "hidden",
  },
  title: {
    color: "#0d2862",
    fontWeight: 700,
    fontSize: 16,
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
  subtitle: {
    color: "#8693b1",
    fontWeight: 400,
    fontSize: 13,
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
  badgeSuccess: {
    fill: "#2eb082",
  },
  badgeError: {
    fill: "#ee6a61",
  },
  spinner: {
    color: "#3772ff",
    borderRadius: 5,
  },
  spinnerContainer: {
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: "50%",
  },
});

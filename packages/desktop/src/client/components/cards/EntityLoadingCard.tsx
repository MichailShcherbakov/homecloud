import React from "react";
import { makeStyles } from "tss-react/mui";
import { CircularProgress, Stack, Typography } from "@mui/material";
import { Entity } from "@/server/modules/file-system/type";
import { ReactComponent as DirectoryIcon } from "@client/assets/folder.svg";
import { ReactComponent as FileIcon } from "@client/assets/file.svg";

export interface EntityLoadingCardProps {
  entity: Entity;
}

export const EntityLoadingCard: React.FC<EntityLoadingCardProps> = React.memo(
  ({ entity }) => {
    const { classes } = useStyle();
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
          {entity.isDirectory && <DirectoryIcon className={classes.icon} />}
          {entity.isFile && <FileIcon className={classes.icon} />}
        </Stack>
        <Stack direction="column" alignItems="center" width="100%">
          <Typography className={classes.title}>{entity.name}</Typography>
          <Typography className={classes.subtitle}>
            {"10/30/2022, 12:08"}
          </Typography>
        </Stack>
        <Stack className={classes.spinnerContainer}>
          <CircularProgress
            disableShrink
            size={24}
            thickness={5}
            className={classes.spinner}
          />
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
  title: {
    color: "#0d2862",
    fontWeight: 700,
    fontSize: 16,
    width: "100%",
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
  subtitle: {
    color: "#8693b1",
    fontWeight: 400,
    fontSize: 13,
    width: "100%",
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
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

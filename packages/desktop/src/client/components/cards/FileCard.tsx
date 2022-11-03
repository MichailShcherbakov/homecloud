import { Stack, Typography } from "@mui/material";
import React from "react";
import { makeStyles } from "tss-react/mui";
import { ReactComponent as FileIcon } from "@client/assets/file.svg";
import { File } from "@/server/modules/file-system/type";

export interface FileCardProps {
  file: File;
}

export const FileCard: React.FC<FileCardProps> = ({ file }) => {
  const { classes } = useStyle();
  return (
    <Stack
      component="button"
      direction="column"
      alignItems="center"
      justifyContent="center"
      spacing={1}
      className={classes.root}
    >
      <FileIcon className={classes.icon} />
      <Stack direction="column" alignItems="center" width="100%">
        <Typography className={classes.title}>{file.name}</Typography>
        <Typography className={classes.subtitle}>
          {"10/30/2022, 12:08"}
        </Typography>
      </Stack>
    </Stack>
  );
};

const useStyle = makeStyles()({
  root: {
    width: 196,
    height: 196,
    padding: 16,
    backgroundColor: "#fff",
    cursor: "pointer",
    border: "1px solid #eee",
    borderRadius: 8,

    "&:hover": {
      backgroundColor: "#e7eef8",
    },
  },
  icon: {
    width: 84,
    height: 84,
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
});

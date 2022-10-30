import { Stack, Typography } from "@mui/material";
import React from "react";
import { makeStyles } from "tss-react/mui";
import { ReactComponent as FolderIcon } from "@client/assets/folder.svg";

export interface FolderCardProps {
  name: string;
  uploadedTime: string;
}

export const FolderCard: React.FC<FolderCardProps> = ({
  name,
  uploadedTime,
}) => {
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
      <FolderIcon className={classes.icon} />
      <Stack direction="column" alignItems="center">
        <Typography className={classes.title}>{name}</Typography>
        <Typography className={classes.subtitle}>{uploadedTime}</Typography>
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
  },
  subtitle: {
    color: "#8693b1",
    fontWeight: 400,
    fontSize: 13,
  },
});

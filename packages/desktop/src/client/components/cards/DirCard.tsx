import { Stack, Typography } from "@mui/material";
import React from "react";
import { makeStyles } from "tss-react/mui";
import { ReactComponent as DirIcon } from "@client/assets/folder.svg";
import { Directory } from "@/server/modules/file-system/type";
import { useNavigate } from "react-router-dom";

export interface DirCardProps {
  dir: Directory;
}

export const DirCard: React.FC<DirCardProps> = ({ dir }) => {
  const { classes } = useStyle();
  const navigate = useNavigate();
  return (
    <Stack
      component="button"
      direction="column"
      alignItems="center"
      justifyContent="center"
      spacing={1}
      className={classes.root}
      onClick={() => navigate(`/dirs/${dir.uuid}`)}
    >
      <DirIcon className={classes.icon} />
      <Stack direction="column" alignItems="center" width="100%">
        <Typography className={classes.title}>{dir.name}</Typography>
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

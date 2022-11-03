import React from "react";
import { makeStyles } from "tss-react/mui";
import { Stack, Typography } from "@mui/material";
import { Entity } from "@/server/modules/file-system/type";
import { ReactComponent as DirectoryIcon } from "@client/assets/folder.svg";
import { ReactComponent as FileIcon } from "@client/assets/file.svg";

export interface EntityCardProps {
  entity: Entity;
  isActive?: boolean;
  onClick?: (
    entity: Entity,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  onDoubleClick?: (
    entity: Entity,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
}

export const EntityCard: React.FC<EntityCardProps> = React.memo(
  ({ entity, isActive, onClick, onDoubleClick }) => {
    const { classes, cx } = useStyle();
    return (
      <Stack
        component="button"
        direction="column"
        alignItems="center"
        justifyContent="center"
        spacing={1}
        className={cx(classes.root, isActive && classes.rootActive)}
        onClick={event => onClick?.(entity, event)}
        onDoubleClick={event => onDoubleClick?.(entity, event)}
      >
        {entity.isDirectory && <DirectoryIcon className={classes.icon} />}
        {entity.isFile && <FileIcon className={classes.icon} />}
        <Stack direction="column" alignItems="center" width="100%">
          <Typography className={classes.title}>{entity.name}</Typography>
          <Typography className={classes.subtitle}>
            {"10/30/2022, 12:08"}
          </Typography>
        </Stack>
      </Stack>
    );
  }
);
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
  rootActive: {
    borderColor: "#3772FE",
    backgroundColor: "#e7eef8",
    boxShadow: "0px 0px 4px 0px rgba(55,114,254,0.5)",
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

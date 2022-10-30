import { Stack, Typography } from "@mui/material";
import React from "react";
import { makeStyles } from "tss-react/mui";
import { ReactComponent as DonutIcon } from "@client/assets/donut_24dp.svg";
import { ReactComponent as MovieIcon } from "@client/assets/movie_24dp.svg";
import { ReactComponent as FolderIcon } from "@client/assets/folder_24dp.svg";
import { ReactComponent as FileIcon } from "@client/assets/file_24dp.svg";
import { Category } from "./Category";

export interface InfoBarProps {}

export const InfoBar: React.FC<InfoBarProps> = () => {
  const { classes } = useStyle();
  return (
    <Stack className={classes.root}>
      <Stack direction="column" spacing={2}>
        <Typography className={classes.title}>Storage</Typography>
        <Category icon={DonutIcon} title="Usage" subtitle="112.7 GB" />
        <Category
          icon={FolderIcon}
          title="Folders"
          subtitle="1,012 folders | 112.7 GB"
        />
        <Category
          icon={MovieIcon}
          title="Videos"
          subtitle="1,012 files | 12.7 GB"
        />
        <Category
          icon={FileIcon}
          title="Other files"
          subtitle="1,012 files | 12.7 GB"
        />
      </Stack>
    </Stack>
  );
};

const useStyle = makeStyles()({
  root: {
    width: 384,
    padding: 16,
    flexGrow: 1,
  },
  icon: {
    fill: "#8693b1",
  },
  iconContainer: {
    width: 56,
    height: 56,
    border: "1px solid #eee",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    color: "#0d2862",
    fontWeight: 700,
  },
  category: {
    width: "100%",
  },
  categoryTitle: {
    color: "#0d2862",
    fontSize: 16,
    fontWeight: 500,
  },
  categorySubtitle: {
    color: "#8693b1",
    fontSize: 13,
    fontWeight: 400,
  },
});

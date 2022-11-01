import { Stack, Typography } from "@mui/material";
import React from "react";
import { makeStyles } from "tss-react/mui";
import { ReactComponent as DonutIcon } from "@client/assets/donut_24dp.svg";
import { ReactComponent as MovieIcon } from "@client/assets/movie_24dp.svg";
import { ReactComponent as FolderIcon } from "@client/assets/folder_24dp.svg";
import { ReactComponent as FileIcon } from "@client/assets/file_24dp.svg";
import { Category } from "./Category";
import { useGetStatistics } from "@client/hooks/useGetStatistics";
import { compressBitesWithDimension } from "@common/utils/compressBites";

export interface InfoBarProps {}

export const InfoBar: React.FC<InfoBarProps> = () => {
  const { classes } = useStyle();

  const { isLoading, isError, statistics } = useGetStatistics();

  if (isLoading || isError || !statistics) return null;

  return (
    <Stack className={classes.root}>
      <Stack direction="column" spacing={2}>
        <Typography className={classes.title}>Storage</Typography>
        <Category
          icon={DonutIcon}
          title="Usage"
          subtitle={compressBitesWithDimension(statistics.total_space_size)}
        />
        <Category
          icon={FolderIcon}
          title="Folders"
          subtitle={`${
            statistics.total_dirs_count
          } folders | ${compressBitesWithDimension(
            statistics.total_space_size
          )}`}
        />
        <Category
          icon={MovieIcon}
          title="Videos"
          subtitle={`${
            statistics.total_file_count
          } movies | ${compressBitesWithDimension(
            statistics.total_space_size
          )}`}
        />
        <Category
          icon={FileIcon}
          title="Other files"
          subtitle={`${
            statistics.total_file_count
          } files | ${compressBitesWithDimension(statistics.total_space_size)}`}
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

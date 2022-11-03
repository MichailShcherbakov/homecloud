import React from "react";
import { useParams } from "react-router-dom";
import { Stack } from "@mui/material";
import { AppBar } from "@client/components/AppBar";
import { makeStyles } from "tss-react/mui";
import { SearchBar } from "@client/components/SearchBar";
import { HostCard } from "@client/components/cards/HostCard";
import { useGetDirEntities } from "../hooks/useGetDirEntities";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { CardContainer } from "../components/containers";
import { UploadingCardContainer } from "../components/containers/UploadingCardContainer";

export interface DirPageProps {}

export const DirPage: React.FC<DirPageProps> = () => {
  const { classes } = useStyle();

  const { uuid } = useParams();

  const { entities } = useGetDirEntities(uuid as string);

  return (
    <Stack direction="column" className={classes.root}>
      <AppBar
        className={classes.appBar}
        left={<Breadcrumbs />}
        center={<SearchBar />}
        right={<HostCard name="Inner Host" />}
        onlyIcon
      />
      <Stack direction="row" className={classes.container}>
        <CardContainer entities={entities} />
      </Stack>
      <UploadingCardContainer entities={entities} />
    </Stack>
  );
};

const useStyle = makeStyles()({
  root: {
    position: "relative",
    width: "100wh",
    height: "100vh",
    overflow: "hidden",
  },
  container: {
    width: "100%",
    height: "100%",
    overflow: "auto",
    backgroundColor: "#f8fafd",
    flexGrow: 1,
  },
  appBar: {
    borderBottom: "1px solid #d1d1d1",
  },
  infoBar: {
    borderLeft: "1px solid #d1d1d1",
  },
});

import React from "react";
import { Stack } from "@mui/material";
import { AppBar } from "@client/components/AppBar";
import { makeStyles } from "tss-react/mui";
import { InfoBar } from "@client/components/InfoBar";
import { SearchBar } from "@client/components/SearchBar";
import { HostCard } from "@client/components/cards/HostCard";
import { useGetRootEntities } from "@client/hooks/useGetRootEntities";
import { CardContainer } from "../components/containers";

export interface HomePageProps {}

export const HomePage: React.FC<HomePageProps> = () => {
  const { classes } = useStyle();

  const { entities } = useGetRootEntities();

  return (
    <Stack direction="column" className={classes.root}>
      <AppBar
        className={classes.appBar}
        center={<SearchBar />}
        right={<HostCard name="Inner Host" />}
      />
      <Stack direction="row" className={classes.container}>
        <CardContainer entities={entities} />
        <Stack direction="column" className={classes.infoBar}>
          <InfoBar />
        </Stack>
      </Stack>
    </Stack>
  );
};

const useStyle = makeStyles()({
  root: {
    width: "100%",
    height: "100vh",
    overflow: "hidden",
  },
  container: {
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

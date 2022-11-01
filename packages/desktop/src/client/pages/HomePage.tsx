import React from "react";
import { Grid, Stack } from "@mui/material";
import { AppBar } from "@client/components/AppBar";
import { DirCard, FileCard } from "@client/components/cards";
import { makeStyles } from "tss-react/mui";
import { InfoBar } from "@client/components/InfoBar";
import { SearchBar } from "@client/components/SearchBar";
import { HostCard } from "@client/components/cards/HostCard";
import { useGetRootEntities } from "@client/hooks/useGetRootEntities";

export interface HomePageProps {}

export const HomePage: React.FC<HomePageProps> = () => {
  const { classes } = useStyle();

  const { entities } = useGetRootEntities();

  return (
    <Stack direction="column" className={classes.root}>
      <AppBar className={classes.appBar}>
        <Stack direction="row" alignItems="center" sx={{ width: "100%" }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            sx={{ width: "100%" }}
          >
            <SearchBar />
          </Stack>
          <HostCard name="Inner Host" />
        </Stack>
      </AppBar>
      <Stack direction="row" className={classes.container}>
        <Stack className={classes.content}>
          <Grid container spacing={2}>
            {entities.map(entity => (
              <Grid item key={entity.uuid}>
                {entity.isDirectory ? (
                  <DirCard
                    name={entity.name}
                    uploadedTime="10/30/2022, 12:08"
                  />
                ) : (
                  <FileCard
                    name={entity.name}
                    uploadedTime="10/30/2022, 12:08"
                  />
                )}
              </Grid>
            ))}
          </Grid>
        </Stack>
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
  content: {
    padding: 16,
    flexGrow: 1,
  },
  appBar: {
    borderBottom: "1px solid #d1d1d1",
  },
  infoBar: {
    borderLeft: "1px solid #d1d1d1",
  },
});

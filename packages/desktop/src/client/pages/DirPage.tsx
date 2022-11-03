import React from "react";
import { useParams } from "react-router-dom";
import { Grid, Stack } from "@mui/material";
import { AppBar } from "@client/components/AppBar";
import { DirCard, FileCard } from "@client/components/cards";
import { makeStyles } from "tss-react/mui";
import { SearchBar } from "@client/components/SearchBar";
import { HostCard } from "@client/components/cards/HostCard";
import { useGetDirEntities } from "../hooks/useGetDirEntities";
import { Breadcrumbs } from "../components/Breadcrumbs";

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
        <Stack className={classes.content}>
          <Grid container spacing={2}>
            {entities.map(e => (
              <Grid item key={e.uuid}>
                {e.isDirectory ? <DirCard dir={e} /> : <FileCard file={e} />}
              </Grid>
            ))}
          </Grid>
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

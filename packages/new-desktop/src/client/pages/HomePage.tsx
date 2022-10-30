import React from "react";
import { Grid, Stack } from "@mui/material";
import { AppBar } from "@client/components/AppBar";
import { FolderCard } from "@client/components/cards";
import { makeStyles } from "tss-react/mui";

export interface HomePageProps {}

export const HomePage: React.FC<HomePageProps> = () => {
  const { classes } = useStyle();
  return (
    <Stack direction="column" className={classes.root}>
      <AppBar className={classes.appBar} />
      <Stack className={classes.container}>
        <Grid container spacing={2}>
          <Grid item>
            <FolderCard name="Folder #1" uploadedTime="10/30/2022, 12:08" />
          </Grid>
          <Grid item>
            <FolderCard name="Folder #2" uploadedTime="10/30/2022, 12:08" />
          </Grid>
          <Grid item>
            <FolderCard name="Folder #3" uploadedTime="10/30/2022, 12:08" />
          </Grid>
        </Grid>
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
    padding: 16,
    backgroundColor: "#f8fafd",
    flexGrow: 1,
  },
  appBar: {
    borderBottom: "2px solid #eee",
  },
});

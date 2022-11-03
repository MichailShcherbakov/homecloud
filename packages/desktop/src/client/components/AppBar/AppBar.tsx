import React from "react";
import { makeStyles } from "tss-react/mui";
import { AppBar as MUIAppBar, Grid, Stack, Toolbar } from "@mui/material";
import { Logo } from "@client/components/Logo";

export interface AppBarProps {
  onlyIcon?: boolean;
  className?: string;
  left?: React.ReactElement;
  center?: React.ReactElement;
  right?: React.ReactElement;
}

export const AppBar: React.FC<AppBarProps> = ({
  onlyIcon,
  className,
  left,
  center,
  right,
}) => {
  const { classes, cx } = useStyle();
  return (
    <MUIAppBar position="sticky" className={cx(classes.root, className)}>
      <Toolbar className={classes.toolbar}>
        <Grid container>
          <Grid item xs={4}>
            <Stack
              direction="row"
              width="100%"
              height="100%"
              alignItems="center"
              justifyContent="flex-start"
              spacing={2}
            >
              <Logo onlyIcon={onlyIcon} />
              {left}
            </Stack>
          </Grid>
          <Grid item xs={4}>
            <Stack
              direction="row"
              width="100%"
              height="100%"
              alignItems="center"
              justifyContent="center"
              spacing={2}
            >
              {center}
            </Stack>
          </Grid>
          <Grid item xs={4}>
            <Stack
              direction="row"
              width="100%"
              height="100%"
              alignItems="center"
              justifyContent="flex-end"
              spacing={2}
            >
              {right}
            </Stack>
          </Grid>
        </Grid>
      </Toolbar>
    </MUIAppBar>
  );
};

const useStyle = makeStyles()({
  root: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#c2c6cc",
    backgroundColor: "#fff",
    border: 0,
    boxShadow: "0px 0px 14px 0px #ccc",
    zIndex: 30,
  },
  toolbar: {
    position: "relative",
    width: "100%",
  },
  container: {
    width: "100%",
  },
});

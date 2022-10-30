import React from "react";
import { makeStyles } from "tss-react/mui";
import { AppBar as MUIAppBar, Stack, Toolbar } from "@mui/material";
import { Logo } from "@client/components/Logo";

export interface AppBarProps {
  className?: string;
  children?: React.ReactElement;
}

export const AppBar: React.FC<AppBarProps> = ({ className, children }) => {
  const { classes, cx } = useStyle();
  return (
    <MUIAppBar position="sticky" className={cx(classes.root, className)}>
      <Toolbar className={classes.toolbar}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          className={classes.container}
        >
          <Logo />
          {children}
        </Stack>
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
    boxShadow: "none",
  },
  toolbar: {
    width: "100%",
  },
  container: {
    width: "100%",
  },
});

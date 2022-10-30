import React from "react";
import { makeStyles } from "tss-react/mui";
import { AppBar as MUIAppBar, Toolbar } from "@mui/material";
import { Logo } from "@/client/components/Logo";

export interface AppBarProps {}

export const AppBar: React.FC<AppBarProps> = () => {
  const { classes } = useStyle();

  return (
    <MUIAppBar position="sticky" className={classes.root}>
      <Toolbar>
        <Logo />
      </Toolbar>
    </MUIAppBar>
  );
};

const useStyle = makeStyles()({
  root: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#c2c6cc",
  },
});

import React from "react";
import { makeStyles } from "tss-react/mui";
import { AppBar as MUIAppBar, Toolbar } from "@mui/material";
import { Logo } from "@client/components/Logo";

export interface AppBarProps {
  className?: string;
}

export const AppBar: React.FC<AppBarProps> = ({ className }) => {
  const { classes, cx } = useStyle();

  return (
    <MUIAppBar position="sticky" className={cx(classes.root, className)}>
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
    backgroundColor: "#fff",
    border: 0,
    boxShadow: "none",
  },
});

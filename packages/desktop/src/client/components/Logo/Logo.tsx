import React from "react";
import { Stack, Typography } from "@mui/material";
import { ReactComponent as LogoIcon } from "@client/assets/logo.svg";
import { makeStyles } from "tss-react/mui";

export interface LogoProps {}

export const Logo: React.FC<LogoProps> = () => {
  const { classes } = useStyle();
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      className={classes.root}
    >
      <LogoIcon className={classes.icon} />
      <Stack direction="row" alignItems="center">
        <Typography className={classes.iconTitle1}>Home</Typography>
        <Typography className={classes.iconTitle2}>Cloud</Typography>
      </Stack>
    </Stack>
  );
};

const useStyle = makeStyles()({
  root: {},
  icon: {
    width: 56,
    height: 56,
  },
  iconTitle1: {
    color: "#0d2862",
    fontWeight: 700,
    fontSize: 22,
  },
  iconTitle2: {
    color: "#8693b1",
    fontWeight: 700,
    fontSize: 22,
  },
});

import React from "react";
import { Stack, Typography } from "@mui/material";
import LogoIcon from "@/client/assets/logo.svg";
import { makeStyles } from "tss-react/mui";

export interface LogoProps {}

export const Logo: React.FC<LogoProps> = () => {
  const { classes } = useStyle();
  return (
    <Stack className={classes.root}>
      <LogoIcon className={classes.icon} />
      <Stack>
        <Typography className={classes.iconTitle1}>Home</Typography>
        <Typography className={classes.iconTitle2}>Cloud</Typography>
      </Stack>
    </Stack>
  );
};

const useStyle = makeStyles()({
  root: {},
  icon: {},
  iconTitle1: {
    color: "#3772ff",
  },
  iconTitle2: {
    color: "#8693b1",
  },
});

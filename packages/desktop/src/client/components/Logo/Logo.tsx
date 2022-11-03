import React from "react";
import { Stack, Typography } from "@mui/material";
import { ReactComponent as LogoIcon } from "@client/assets/logo.svg";
import { makeStyles } from "tss-react/mui";
import { useNavigate } from "react-router-dom";

export interface LogoProps {
  onlyIcon?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ onlyIcon }) => {
  const { classes } = useStyle();
  const navigate = useNavigate();
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      className={classes.root}
      onClick={() => navigate("/")}
    >
      <LogoIcon className={classes.icon} />
      {!onlyIcon && (
        <Stack direction="row" alignItems="center">
          <Typography className={classes.iconTitle1}>Home</Typography>
          <Typography className={classes.iconTitle2}>Cloud</Typography>
        </Stack>
      )}
    </Stack>
  );
};

const useStyle = makeStyles()({
  root: {
    cursor: "pointer",
    userSelect: "none",
  },
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

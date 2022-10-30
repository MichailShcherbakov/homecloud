import React from "react";
import { Stack, Typography } from "@mui/material";
import { ReactComponent as HostIcon } from "@client/assets/host.svg";
import { makeStyles } from "tss-react/mui";

export interface HostCardProps {
  name: string;
}

export const HostCard: React.FC<HostCardProps> = ({ name }) => {
  const { classes } = useStyle();
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      className={classes.root}
    >
      <HostIcon className={classes.icon} />
      <Typography className={classes.name}>{name}</Typography>
    </Stack>
  );
};

const useStyle = makeStyles()({
  root: {},
  icon: {
    width: 32,
    height: 32,
  },
  name: {
    color: "#5a6474",
    fontWeight: 500,
    whiteSpace: "nowrap",
  },
});

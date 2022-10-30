import { Stack, Typography } from "@mui/material";
import React from "react";
import { makeStyles } from "tss-react/mui";

export interface CategoryProps {
  icon: React.JSXElementConstructor<any>;
  title: string;
  subtitle: string;
}

export const Category: React.FC<CategoryProps> = ({
  icon: Icon,
  title,
  subtitle,
}) => {
  const { classes } = useStyle();
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={2}
      className={classes.category}
    >
      <Stack
        alignItems="center"
        justifyContent="center"
        className={classes.iconContainer}
      >
        <Icon className={classes.icon} />
      </Stack>
      <Stack direction="column">
        <Typography className={classes.categoryTitle}>{title}</Typography>
        <Typography className={classes.categorySubtitle}>{subtitle}</Typography>
      </Stack>
    </Stack>
  );
};

const useStyle = makeStyles()({
  icon: {
    fill: "#8693b1",
  },
  iconContainer: {
    width: 56,
    height: 56,
    border: "1px solid #eee",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  category: {
    width: "100%",
  },
  categoryTitle: {
    color: "#0d2862",
    fontSize: 16,
    fontWeight: 600,
  },
  categorySubtitle: {
    color: "#8693b1",
    fontSize: 13,
    fontWeight: 400,
  },
});

import React from "react";
import { Stack, InputBase, IconButton } from "@mui/material";
import { ReactComponent as SearchIcon } from "@client/assets/search.svg";
import { makeStyles } from "tss-react/mui";

export interface SearchBarProps {}

export const SearchBar: React.FC<SearchBarProps> = () => {
  const { classes } = useStyle();
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      className={classes.root}
    >
      <IconButton aria-label="search" className={classes.iconButton}>
        <SearchIcon className={classes.icon} />
      </IconButton>
      <InputBase
        placeholder="Search files"
        inputProps={{ "aria-label": "search" }}
        className={classes.input}
      />
    </Stack>
  );
};

const useStyle = makeStyles()({
  root: {},
  icon: {
    fill: "#5a6474",
  },
  iconButton: {
    width: 40,
    height: 40,
  },
  input: {
    color: "#5a6474",

    fontSize: 16,
    fontWeight: 500,

    "&::-ms-input-placeholder": {
      color: "#5a6474",
    },

    "&::placeholder": {
      color: "#5a6474",
    },
  },
});

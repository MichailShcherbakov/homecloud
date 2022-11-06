import React from "react";
import {
  Breadcrumbs as MUIBreadcrumbs,
  IconButton,
  Menu,
  MenuItem,
  Stack,
} from "@mui/material";
import { useGetPathToDir } from "@/client/hooks/api/useGetPathToDir";
import { makeStyles } from "tss-react/mui";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { DirectoryLink } from "./DirectoryLink";

export interface BreadcrumbsProps {}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const { classes } = useStyle();

  const { directories } = useGetPathToDir();

  const hiddenDirectories = React.useMemo(
    () => directories.slice(0, directories.length - 2),
    [directories]
  );
  const visibleDirectory = React.useMemo(
    () => directories.at(-2),
    [directories]
  );
  const activeDirectory = React.useMemo(
    () => directories.at(-1),
    [directories]
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Stack direction="row" alignItems="center">
      <KeyboardArrowRightIcon
        fontSize="small"
        className={classes.separator}
        sx={{ marginRight: 1 }}
      />
      <MUIBreadcrumbs
        separator={
          <KeyboardArrowRightIcon
            fontSize="small"
            className={classes.separator}
          />
        }
        aria-label="breadcrumb"
        className={classes.root}
      >
        {hiddenDirectories.length && (
          <IconButton
            id="show-hidden-links-button"
            aria-controls={open ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleClick}
            className={classes.btn}
          >
            ...
          </IconButton>
        )}
        {visibleDirectory && <DirectoryLink directory={visibleDirectory} />}
        {activeDirectory && (
          <DirectoryLink directory={activeDirectory} isActive />
        )}
      </MUIBreadcrumbs>
      <Menu
        id="hidden-links"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        {hiddenDirectories.map(d => (
          <MenuItem key={d.uuid} onClick={handleClose}>
            <DirectoryLink directory={d} />
          </MenuItem>
        ))}
      </Menu>
    </Stack>
  );
};

const useStyle = makeStyles()({
  root: {
    flexShrink: 0,
    flexWrap: "nowrap",
  },
  btn: {
    width: 32,
    height: 32,
  },
  separator: {
    fill: "#ccc",
  },
});

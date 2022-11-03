import React from "react";
import { Link, useParams } from "react-router-dom";
import {
  Breadcrumbs as MUIBreadcrumbs,
  IconButton,
  Menu,
  MenuItem,
  Stack,
} from "@mui/material";
import { useGetPathToDir } from "@/client/hooks/useGetPathToDir";
import { makeStyles } from "tss-react/mui";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

export interface BreadcrumbsProps {}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = () => {
  const { uuid } = useParams();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const { classes, cx } = useStyle();

  const { dirs } = useGetPathToDir(uuid as string);

  const hiddenDirs = React.useMemo(
    () => dirs.slice(0, dirs.length - 2),
    [dirs]
  );
  const visibleDir = React.useMemo(() => dirs.at(-2), [dirs]);
  const activeDir = React.useMemo(() => dirs.at(-1), [dirs]);

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
        {hiddenDirs.length && (
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
        {visibleDir && (
          <Link
            key={visibleDir.uuid}
            to={`/dirs/${visibleDir.uuid}`}
            className={classes.link}
          >
            {visibleDir.name}
          </Link>
        )}
        {activeDir && (
          <Link
            key={activeDir.uuid}
            to={`/dirs/${activeDir.uuid}`}
            className={cx(classes.link, classes.linkActive)}
          >
            {activeDir.name}
          </Link>
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
        {hiddenDirs.map(d => (
          <MenuItem key={d.uuid} onClick={handleClose}>
            <Link to={`/dirs/${d.uuid}`} className={classes.link}>
              {d.name}
            </Link>
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
  link: {
    color: "#5a6474",
    fontWeight: 400,
    fontSize: 16,
  },
  linkActive: {
    color: "#0d2862",
    fontWeight: 500,
  },
});

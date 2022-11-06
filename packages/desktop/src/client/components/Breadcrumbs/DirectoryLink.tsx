import { useStorageActions } from "@/client/hooks/storage/useStorageActions";
import { Directory } from "@/server/modules/file-system/type";
import React from "react";
import { useNavigate } from "react-router-dom";
import { makeStyles } from "tss-react/mui";

export interface DirectoryLinkProps {
  directory: Directory;
  isActive?: boolean;
}

export const DirectoryLink: React.FC<DirectoryLinkProps> = ({
  directory,
  isActive,
}) => {
  const { classes, cx } = useStyle();

  const navigate = useNavigate();

  const { setCurrentDirectory } = useStorageActions();

  const onLickClick = React.useCallback(
    (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      event.preventDefault();

      setCurrentDirectory(directory);

      navigate(`/dirs/${directory.uuid}`);
    },
    []
  );

  return (
    <a
      key={directory.uuid}
      className={cx(classes.link, isActive && classes.linkActive)}
      onClick={onLickClick}
    >
      {directory.name}
    </a>
  );
};

const useStyle = makeStyles()({
  link: {
    color: "#5a6474",
    fontWeight: 400,
    fontSize: 16,
    cursor: "pointer",
  },
  linkActive: {
    color: "#0d2862",
    fontWeight: 500,
  },
});

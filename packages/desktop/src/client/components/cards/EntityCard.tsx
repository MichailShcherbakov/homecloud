import React from "react";
import { makeStyles } from "tss-react/mui";
import { CircularProgress, Stack, Typography } from "@mui/material";
import { Entity } from "@/server/modules/file-system/type";
import { ReactComponent as DirectoryIcon } from "@client/assets/folder.svg";
import { ReactComponent as FileIcon } from "@client/assets/file.svg";
import { useEntityDrop } from "@/client/hooks/useEntityDrop";
import { useDrag } from "@/client/common/hooks/dnd/useDrag";
import { toJSON } from "@/server/utils/format/json";
import { useQueueActions } from "@/client/hooks/queue/useQueueActions";
import { QueueJobStageEnum } from "@/client/store/reducers/queue.reducer";
import { useCurrentDirectory } from "@/client/hooks/storage/useCurrentDirectory";

export interface EntityCardProps {
  entity: Entity;
  isActive?: boolean;
  isLoading?: boolean;
  onClick?: (
    entity: Entity,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  onDoubleClick?: (
    entity: Entity,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
}

export const EntityCard: React.FC<EntityCardProps> = React.memo(
  ({ entity, isActive = false, isLoading = false, onClick, onDoubleClick }) => {
    const { classes, cx } = useStyle({
      isLoading,
    });

    const entityRef = React.useRef<HTMLButtonElement | null>(null);

    const { currentDirectory } = useCurrentDirectory();

    const { addQueueJob } = useQueueActions();

    const { dropProps, isDropTarget } = useEntityDrop({
      dropRef: entityRef,
      isDisabled: !entity.isDirectory,
      async onDrop(targets) {
        targets.forEach(target =>
          addQueueJob(target, currentDirectory, QueueJobStageEnum.UPLOADING)
        );
      },
    });

    const { dragProps } = useDrag({
      dragRef: entityRef,
      getItems() {
        return [
          {
            "application/json": toJSON(
              {
                entity,
              },
              { compress: true }
            ),
          },
        ];
      },
    });

    return (
      <Stack
        {...dropProps}
        {...dragProps}
        ref={entityRef}
        component="button"
        className={cx(
          classes.root,
          isActive && classes.rootActive,
          isDropTarget && classes.rootDropActive
        )}
        onClick={event => !isLoading && onClick?.(entity, event)}
        onDoubleClick={event => !isLoading && onDoubleClick?.(entity, event)}
      >
        <Stack
          direction="column"
          alignItems="center"
          justifyContent="center"
          spacing={1}
          className={classes.rootContainer}
        >
          {entity.isDirectory && <DirectoryIcon className={classes.icon} />}
          {entity.isFile && <FileIcon className={classes.icon} />}
          <Stack direction="column" alignItems="center" width="100%">
            <Typography className={classes.title}>{entity.name}</Typography>
            <Typography className={classes.subtitle}>
              {"10/30/2022, 12:08"}
            </Typography>
          </Stack>
        </Stack>
        {isLoading && (
          <Stack className={classes.spinnerContainer}>
            <CircularProgress
              disableShrink
              size={24}
              thickness={5}
              className={classes.spinner}
            />
          </Stack>
        )}
      </Stack>
    );
  }
);
const useStyle = makeStyles<{ isLoading: boolean }>()((_, { isLoading }) => ({
  root: {
    position: "relative",
    width: 196,
    height: 196,
    backgroundColor: "#fff",
    cursor: "pointer",
    border: "1px solid #eee",
    borderRadius: 8,

    ...(!isLoading && {
      "&:hover": {
        backgroundColor: "#e7eef8",
      },
    }),
  },
  rootDropActive: {
    border: "3px dashed #3772FF",
    borderRadius: 16,
  },
  rootContainer: {
    width: "100%",
    height: "100%",

    padding: 16,

    ...(isLoading && {
      opacity: 0.3,
    }),
  },
  rootActive: {
    borderColor: "#3772FE",
    backgroundColor: "#e7eef8",
    boxShadow: "0px 0px 4px 0px rgba(55,114,254,0.5)",
  },
  icon: {
    width: 84,
    height: 84,
  },
  title: {
    color: "#0d2862",
    fontWeight: 700,
    fontSize: 16,
    width: "100%",
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
  subtitle: {
    color: "#8693b1",
    fontWeight: 400,
    fontSize: 13,
    width: "100%",
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
  spinner: {
    color: "#3772ff",
    borderRadius: 5,
  },
  spinnerContainer: {
    position: "absolute",
    top: "14%",
    right: "20%",
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: "50%",
  },
}));

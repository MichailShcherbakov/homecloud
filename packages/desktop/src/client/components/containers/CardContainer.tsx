import React from "react";
import { Grid, Stack } from "@mui/material";
import { Entity } from "@/server/modules/file-system/type";
import { EntityCard } from "../cards";
import { useNavigate } from "react-router-dom";
import { makeStyles } from "tss-react/mui";
import { useEntityDrop } from "@/client/hooks/useEntityDrop";
import { useQueueActions } from "@/client/hooks/queue/useQueueActions";
import { QueueJobStageEnum } from "@/client/store/reducers/queue.reducer";
import { useStorageActions } from "@/client/hooks/storage/useStorageActions";
import { useStorage } from "@/client/hooks/storage/useStorage";

export interface CardContainerProps {}

export const CardContainer: React.FC<CardContainerProps> = ({}) => {
  const { classes, cx } = useStyle();
  const dropRef = React.useRef<HTMLDivElement | null>(null);

  const navigate = useNavigate();

  const { storage } = useStorage();

  const { setCurrentDirectory, setCurrentActiveEntity } = useStorageActions();
  const { addQueueJob } = useQueueActions();

  const { dropProps, isDropTarget } = useEntityDrop({
    dropRef,
    async onDrop(targets) {
      targets.forEach(target =>
        addQueueJob(
          target,
          storage.currentDirectory,
          QueueJobStageEnum.UPLOADING
        )
      );
    },
  });

  const onCardClick = React.useCallback(
    (
      entity: Entity,
      event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
      event.stopPropagation();

      setCurrentActiveEntity(entity);
    },
    []
  );

  const onContainerClick = React.useCallback(() => {
    setCurrentActiveEntity(null);
  }, []);

  const onCardDoubleClick = React.useCallback((entity: Entity) => {
    if (!entity.isDirectory) return;

    setCurrentDirectory(entity);

    navigate(`/dirs/${entity.uuid}`);
  }, []);

  return (
    <Stack
      {...dropProps}
      className={cx(classes.root, isDropTarget && classes.rootDropActive)}
      onClick={onContainerClick}
    >
      <Grid container spacing={2}>
        {storage.entities.map(e => (
          <Grid item key={e.uuid}>
            <EntityCard
              entity={e}
              isActive={storage.currentActiveEntity?.uuid === e.uuid}
              isLoading={e.isFile && e.isUploading}
              onClick={onCardClick}
              onDoubleClick={onCardDoubleClick}
            />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
};

const useStyle = makeStyles()({
  root: {
    width: "100%",
    margin: 8,
    padding: 8,
    flexGrow: 1,
    overflow: "auto",
    border: "3px solid transparent",
  },
  rootDropActive: {
    border: "3px dashed #3772FF",
    borderRadius: 16,
  },
});

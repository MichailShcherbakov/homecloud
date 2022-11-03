import React from "react";
import { Grid, Stack } from "@mui/material";
import { Entity } from "@/server/modules/file-system/type";
import { EntityCard } from "../cards";
import { useNavigate } from "react-router-dom";
import { makeStyles } from "tss-react/mui";

export interface CardContainerProps {
  entities: Entity[];
}

export const CardContainer: React.FC<CardContainerProps> = ({ entities }) => {
  const [activeEntity, setActiveEntity] = React.useState<Entity | null>(null);

  const { classes } = useStyle();

  const navigate = useNavigate();

  const onCardClick = React.useCallback(
    (
      entity: Entity,
      event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
      event.stopPropagation();

      setActiveEntity(entity);
    },
    []
  );

  const onCardDoubleClick = React.useCallback((entity: Entity) => {
    if (!entity.isDirectory) return;

    navigate(`/dirs/${entity.uuid}`);
  }, []);

  return (
    <Stack className={classes.root} onClick={() => setActiveEntity(null)}>
      <Grid container spacing={2}>
        {entities.map(e => (
          <Grid item key={e.uuid}>
            <EntityCard
              entity={e}
              isActive={activeEntity === e}
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
    height: "100%",
    padding: 16,
    flexGrow: 1,
    overflow: "auto",
  },
});

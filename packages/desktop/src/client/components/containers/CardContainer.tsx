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
  return (
    <Stack className={classes.root} onClick={() => setActiveEntity(null)}>
      <Grid container spacing={2}>
        {entities.map(e => (
          <Grid item key={e.uuid}>
            <EntityCard
              entity={e}
              isActive={activeEntity === e}
              onClick={(dir, event) => {
                event.stopPropagation();

                setActiveEntity(dir);
              }}
              onDoubleClick={() => {
                if (!e.isDirectory) return;

                navigate(`/dirs/${e.uuid}`);
              }}
            />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
};

const useStyle = makeStyles()({
  root: {
    padding: 16,
    flexGrow: 1,
  },
});

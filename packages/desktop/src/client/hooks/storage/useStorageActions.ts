import React from "react";
import { Directory, Entity, File } from "@/server/modules/file-system/type";
import { useAppDispatch } from "@/client/store/hook";
import {
  setCurrentDirectoryAction,
  setCurrentActiveEntityAction,
  setEntitiesAction,
} from "@/client/store/reducers/storage.reducer";

export interface UseStorageActionsOptions {}

export const useStorageActions = (options: UseStorageActionsOptions = {}) => {
  const dispatch = useAppDispatch();

  const setCurrentDirectory = React.useCallback(
    (directory: Directory | null) => {
      dispatch(setCurrentDirectoryAction(directory));
    },
    []
  );

  const setCurrentActiveEntity = React.useCallback(
    (entity: File | Directory | null) => {
      dispatch(setCurrentActiveEntityAction(entity));
    },
    []
  );

  const setEntities = React.useCallback((entities: Entity[]) => {
    dispatch(
      setEntitiesAction(
        [...entities].sort((a, b) => {
          if (a.isFile && b.isDirectory) return 1;
          else if (a.isDirectory && b.isFile) return -1;
          else if (a.name < b.name) return 1;
          else if (a.name > b.name) return -1;

          return 0;
        })
      )
    );
  }, []);

  return {
    setCurrentDirectory,
    setCurrentActiveEntity,
    setEntities,
  };
};

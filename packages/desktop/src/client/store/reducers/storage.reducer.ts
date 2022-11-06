import { Directory, Entity, File } from "@/server/modules/file-system/type";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface StorageState {
  currentDirectory: Directory | null;
  currentActiveEntity: Entity | null;
  entities: Entity[];
}

export const initialState: StorageState = {
  currentDirectory: null,
  currentActiveEntity: null,
  entities: [],
};

export const storageSlice = createSlice({
  name: "storage",
  initialState,
  reducers: {
    setCurrentDirectoryAction(state, action: PayloadAction<Directory | null>) {
      state.currentDirectory = action.payload;
    },
    setCurrentActiveEntityAction(state, action: PayloadAction<Entity | null>) {
      state.currentActiveEntity = action.payload;
    },
    setEntitiesAction(state, action: PayloadAction<Entity[]>) {
      state.entities = action.payload;
    },
  },
});

export const {
  setCurrentDirectoryAction,
  setCurrentActiveEntityAction,
  setEntitiesAction,
} = storageSlice.actions;

export default storageSlice.reducer;

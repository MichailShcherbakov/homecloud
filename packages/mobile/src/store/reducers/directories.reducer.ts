import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Directory } from "@/types";

export interface DirectoriesState {
  currentDirectory: Directory | null;
}

const initialState: DirectoriesState = {
  currentDirectory: null,
};

export const directoriesSlice = createSlice({
  name: "directories",
  initialState,
  reducers: {
    setCurrentDirectory: (state, action: PayloadAction<Directory>) => {
      state.currentDirectory = action.payload;
    },
  },
});

export const { setCurrentDirectory } = directoriesSlice.actions;

export default directoriesSlice.reducer;

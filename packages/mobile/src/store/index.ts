import { configureStore } from "@reduxjs/toolkit";
import DirectoriesReducer from "./reducers/directories.reducer";
import HostsReducer from "./reducers/hosts.reducer";

export const store = configureStore({
  reducer: {
    hosts: HostsReducer,
    directories: DirectoriesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

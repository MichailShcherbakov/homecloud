import { configureStore } from "@reduxjs/toolkit";
import HostsReducer from "./reducers/hosts.reducer";

export const store = configureStore({
  reducer: {
    hosts: HostsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

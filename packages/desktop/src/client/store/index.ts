import { configureStore } from "@reduxjs/toolkit";
import queueReducer from "./reducers/queue.reducer";
import storageReducer from "./reducers/storage.reducer";

export const store = configureStore({
  reducer: {
    queue: queueReducer,
    storage: storageReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

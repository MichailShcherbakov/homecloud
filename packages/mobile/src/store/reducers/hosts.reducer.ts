import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Host } from "@/utils/network-scan/scan-hosts";

export interface HostsState {
  currentHost: Host | null;
}

const initialState: HostsState = {
  currentHost: null,
};

export const hostsSlice = createSlice({
  name: "hosts",
  initialState,
  reducers: {
    setCurrentHost: (state, action: PayloadAction<Host>) => {
      state.currentHost = action.payload;
    },
  },
});

export const { setCurrentHost } = hostsSlice.actions;

export default hostsSlice.reducer;

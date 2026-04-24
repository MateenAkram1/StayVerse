import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: { sidebarOpen: true, toast: null as { message: string; type: "ok" | "err" } | null },
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebar(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    setToast(state, action: PayloadAction<{ message: string; type: "ok" | "err" } | null>) {
      state.toast = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebar, setToast } = uiSlice.actions;
export default uiSlice.reducer;

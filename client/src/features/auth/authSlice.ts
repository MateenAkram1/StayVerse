import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/types";

type AuthState = {
  token: string | null;
  user: User | null;
  hydrated: boolean;
};

const initialState: AuthState = {
  token: localStorage.getItem("sv_token"),
  user: null,
  hydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ token: string; user: User }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem("sv_token", action.payload.token);
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    clearAuth(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem("sv_token");
    },
    setHydrated(state) {
      state.hydrated = true;
    },
  },
});

export const { setCredentials, setUser, clearAuth, setHydrated } = authSlice.actions;
export default authSlice.reducer;

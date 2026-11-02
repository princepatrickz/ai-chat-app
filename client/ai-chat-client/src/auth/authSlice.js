import { createSlice } from "@reduxjs/toolkit";

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    firstname: null,
    lastname: null,
    fullname: null,
    email: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    role: null,
    isInitialized: false,
  },
  reducers: {
    setCredentials: (state, action) => {
      const data = action.payload;

      state.firstname = data.firstname;
      state.lastname = data.lastname;
      state.fullname = data.fullname;
      state.email = data.email;
      state.token = data.token;
      state.refreshToken = data.refreshToken;
      state.isAuthenticated = data.isAuthenticated ?? true;
      state.role = data.role;
      state.isInitialized = true;
    },
    clearCredentials: (state) => {
      state.firstname = null;
      state.lastname = null;
      state.fullname = null;
      state.email = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.role = [];
      state.isInitialized = true;
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;

export default authSlice.reducer;

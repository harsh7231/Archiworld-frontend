// src/redux/slices/authSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  changePassword,
  createUser,
  inActiveUser,
  fetchUsers,
  fetchParentUsers,
  login,
  updateUser,
  logoutUser,
  sendOTP,
  resendOTP,
  verifyOTP,
  fetchUserById,
  handleForgotPassword,
} from "./authAPI";

export const authSliceInitialState = {
  user: null,
  token: null,
  role: null,
  team: null,
  userId: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: authSliceInitialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        const { user, token, tokenExpDays } = action.payload;
        const loginTimestamp = Date.now(); // current time in ms
        const tokenExpiryTime =
          loginTimestamp + tokenExpDays * 24 * 60 * 60 * 1000; // ms
        state.loading = false;
        state.user = user;
        state.token = token;
        state.role = user.role;
        state.team = user.team;
        state.userId = user._id;
        state.loginTimestamp = loginTimestamp;
        state.tokenExpiryTime = tokenExpiryTime;
        state.success = "Login successful!";
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.success = "Password changed successfully!";
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(handleForgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(handleForgotPassword.fulfilled, (state) => {
        state.loading = false;
        state.success = "Password changed successfully!";
      })
      .addCase(handleForgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        localStorage.clear();
        state.user = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const authReducer = authSlice.reducer;

export const usersInitialState = {
  users: [],
  userById: [],
  parentUser: [],
  loadingFetch: false,
  errorFetch: null,
};

const userSlice = createSlice({
  name: "users",
  initialState: usersInitialState,
  reducers: {},
  extraReducers: (builder) => {
    // Login related actions
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users; // Set the list of users
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchUserById.pending, (state) => {
        state.loadingFetch = true;
        state.errorFetch = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loadingFetch = false;
        state.userById = action.payload; // Set the list of users
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loadingFetch = false;
        state.errorFetch = action.error.message;
      })
      .addCase(fetchParentUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchParentUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.parentUser = action.payload; // Set the list of users
      })
      .addCase(fetchParentUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create new user
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload); // Add the new user to the list
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //send otp
      .addCase(sendOTP.pending, (state) => {
        state.error = null;
      })
      .addCase(sendOTP.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.error = action.payload;
      })
      //resend otp
      .addCase(resendOTP.pending, (state) => {
        state.error = null;
      })
      .addCase(resendOTP.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.error = action.payload;
      })
      //verify otp
      .addCase(verifyOTP.pending, (state) => {
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users; // Update current user's data
        state.success = "User updated successfully.";
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(inActiveUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      // inActiveUser user
      .addCase(inActiveUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "User deleted successfully.";
        state.users = state.users.filter(
          (user) => user._id !== action.payload.id,
        );
      })
      .addCase(inActiveUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const usersReducer = userSlice.reducer;

// src/api/authAPI.js
import axios from "axios";
import BASEURL from "../../BaseUrl";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAuthHeaders } from "../../utils/getAuthHeaders";

export const login = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASEURL}/api/login`, {
        loginIdentifier: email,
        password,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Incorrect email or password."
      );
    }
  }
);

let cancelToken;
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async ({
    searchTerm = "",
    page = 0,
    rows = 25,
  }, thunkAPI) => {
    try {
      if (cancelToken) {
        cancelToken.cancel("New request initiated, cancelling previous one");
      }
      cancelToken = axios.CancelToken.source();
      const body = {
        search: searchTerm,
        skip: page * rows,
        take: rows,
      };

      const response = await axios.post(
        `${BASEURL}/api/parent`,
        body,
        {
          ...getAuthHeaders(thunkAPI),
          cancelToken: cancelToken.token,
        });
      return {
        users:response.data.users,
        totalCount: response.data.totalCount
      }
    } catch (error){
      if (axios.isCancel(error)) {
        return;
      }
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch orders."
      );
    }
  }
);

export const fetchUserById = createAsyncThunk(
  "users/fetchUserById",
  async (userId, thunkAPI) => {
    const response = await axios.get(
      `${BASEURL}/api/get-user/${userId}`,
      getAuthHeaders(thunkAPI)
    );
    return response.data.users;
  }
);

export const fetchParentUsers = createAsyncThunk(
  "users/fetchParentUsers",
  async (_, thunkAPI) => {
    const response = await axios.get(
      `${BASEURL}/api/parent-users`,
      getAuthHeaders(thunkAPI)
    );
    return response.data.parentUser;
  }
);

// Async thunk for inActiveUser a user
export const inActiveUser = createAsyncThunk(
  "users/inActiveUser",
  async (id, thunkAPI) => {
    try {
      const res = await axios.delete(
        `${BASEURL}/api/delete-user/${id}`,
        getAuthHeaders(thunkAPI) // Ensure headers are passed correctly
      );
      return res.data;
    } catch (error) {
      // Reject with value if the request fails
      return thunkAPI.rejectWithValue("Failed to delete user.");
    }
  }
);

// Async thunk for updating user data (used in EditUser)
export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, formData }, thunkAPI) => {
    // remove rejectWithValue from third parameter
    try {
      const response = await axios.put(
        `${BASEURL}/api/edit-user/${id}`,
        formData,
        getAuthHeaders(thunkAPI)
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to update user."); // Use rejectWithValue from thunkAPI
    }
  }
);

// Async thunk for creating a new user
export const createUser = createAsyncThunk(
  "users/createUser",
  async (formData, thunkAPI) => {
    try {
      const response = await axios.post(
        `${BASEURL}/api/register`, // make sure BASEURL is defined
        formData,
        getAuthHeaders(thunkAPI)
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to create User."
      ); 
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({ email, oldPassword, newPassword }, thunkAPI) => {
    try {
      const response = await axios.put(
        `${BASEURL}/api/change-password`,
        {
          email,
          oldPassword,
          newPassword,
        },
        getAuthHeaders(thunkAPI)
      );
      return response.data; // Return response to store
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to change password."
      );
    }
  }
);

export const handleForgotPassword = createAsyncThunk(
  "auth/handleForgotPassword",
  async ({ email, newPassword, otp }, thunkAPI) => {
    try {
      const response = await axios.put(
        `${BASEURL}/api/forgot-password`,
        {
          email,
          newPassword,
          otp
        },
        getAuthHeaders(thunkAPI)
      );
      return response.data; // Return response to store
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to change password."
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, thunkAPI) => {
    try {
      const response = await axios.post(`${BASEURL}/api/logout`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Logout failed"
      );
    }
  }
);

export const sendOTP = createAsyncThunk(
  "ticket/sendOTP",
  async ({ email }, thunkAPI) => {
    try {
      await axios.post(
        `${BASEURL}/api/send-otp`,
        { email},
        getAuthHeaders(thunkAPI)
      );
      return { email };
    } catch (error) {
      console.error("OTP send failed", error);
      return thunkAPI.rejectWithValue("Failed to send OTP");
    }
  }
);
export const resendOTP = createAsyncThunk(
  "ticket/resendOTP",
  async ({ email }, thunkAPI) => {
    try {
      await axios.post(
        `${BASEURL}/api/resend-otp`,
        { email},
        getAuthHeaders(thunkAPI)
      );
      return { email };
    } catch (error) {
      console.error("OTP re-send failed", error);
      return thunkAPI.rejectWithValue("Failed to re-send OTP");
    }
  }
);
export const verifyOTP = createAsyncThunk(
  "ticket/verifyOTP",
  async ({ email, otp }, thunkAPI) => {
    try {
      await axios.post(
        `${BASEURL}/api/verify-otp`,
        { email, otp},
        getAuthHeaders(thunkAPI)
      );
      return { email };
    } catch (error) {
      console.error("Failed to verify OTP", error);
      return thunkAPI.rejectWithValue("Failed to verify OTP");
    }
  }
);
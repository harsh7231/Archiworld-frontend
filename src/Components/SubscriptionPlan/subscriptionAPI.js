// src/api/authAPI.js
import axios from "axios";
import BASEURL from "../../BaseUrl";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAuthHeaders } from "../../utils/getAuthHeaders";

// Async thunk for updating user data (used in EditUser)
export const updateSubscriptionPlan = createAsyncThunk(
  "plan/updateSubscriptionPlan",
  async ({ id, formData }, thunkAPI) => {
    // remove rejectWithValue from third parameter
    try {
      const response = await axios.put(
        `${BASEURL}/api/update-plan/${id}`,
        formData,
        getAuthHeaders(thunkAPI)
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update subscription plan"
      );      
    }
  }
);

// Async thunk for creating a new user
export const createSubscriptionPlan = createAsyncThunk(
  "plan/createSubscriptionPlan",
  async (formData, thunkAPI) => {
    try {
      const response = await axios.post(
        `${BASEURL}/api/create-plan`, // make sure BASEURL is defined
        formData,
        getAuthHeaders(thunkAPI)
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );      
    }
  }
);

export const fetchPlans = createAsyncThunk(
  "plan/fetchPlans",
  async (_, thunkAPI) => {
    const response = await axios.get(
      `${BASEURL}/api/get-plan`,
      getAuthHeaders(thunkAPI)
    );
    return response.data;
  }
);

export const deletePlan = createAsyncThunk(
  "plan/deletePlan",
  async (id, thunkAPI) => {
    try {
      const res = await axios.delete(
        `${BASEURL}/api/delete-plan/${id}`,
        getAuthHeaders(thunkAPI) // Ensure headers are passed correctly
      );
      return res.data;
    } catch (error) {
      // Reject with value if the request fails
      return thunkAPI.rejectWithValue("Failed to delete plan.");
    }
  }
);
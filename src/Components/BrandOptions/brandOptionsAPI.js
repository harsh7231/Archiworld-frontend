// src/api/authAPI.js
import axios from "axios";
import BASEURL from "../../BaseUrl";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAuthHeaders } from "../../utils/getAuthHeaders";

export const fetchBrandOptions = createAsyncThunk(
  "brandOption/fetchBrandOptions",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${BASEURL}/api/get-brands`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch brand options.",
      );
    }
  },
);

// Async thunk for creating a new brand option
export const createBrandOption = createAsyncThunk(
  "brandOption/createBrandOption",
  async (payload, thunkAPI) => {
    try {
      const response = await axios.post(
        `${BASEURL}/api/create-brand`, // make sure BASEURL is defined
        payload,
        getAuthHeaders(thunkAPI),
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to create Brand Option.",
      );
    }
  },
);

// Async thunk for updating brand option data
export const updateBrandOption = createAsyncThunk(
  "brandOption/updateBrandOption",
  async ({ id, data }, thunkAPI) => {
    // remove rejectWithValue from third parameter
    try {
      const response = await axios.put(
        `${BASEURL}/api/update-brand/${id}`,
        data,
        getAuthHeaders(thunkAPI),
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update brand option.",
      ); // Use rejectWithValue from thunkAPI
    }
  },
);

// Async thunk for deleteBrandOption
export const deleteBrandOption = createAsyncThunk(
  "brandOption/deleteBrandOption",
  async (id, thunkAPI) => {
    try {
      const res = await axios.delete(
        `${BASEURL}/api/delete-brand/${id}`,
        getAuthHeaders(thunkAPI), // Ensure headers are passed correctly
      );
      return res.data;
    } catch (error) {
      // Reject with value if the request fails
      return thunkAPI.rejectWithValue("Failed to delete brand option.");
    }
  },
);

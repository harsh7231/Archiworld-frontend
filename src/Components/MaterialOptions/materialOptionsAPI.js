// src/api/authAPI.js
import axios from "axios";
import BASEURL from "../../BaseUrl";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAuthHeaders } from "../../utils/getAuthHeaders";

export const fetchMaterialOptions = createAsyncThunk(
  "materialOption/fetchMaterialOptions",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${BASEURL}/api/get-materials`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch material options.",
      );
    }
  },
);

// Async thunk for creating a new material option
export const createMaterialOption = createAsyncThunk(
  "materialOption/createMaterialOption",
  async (payload, thunkAPI) => {
    try {
      const response = await axios.post(
        `${BASEURL}/api/create-material`, // make sure BASEURL is defined
        payload,
        getAuthHeaders(thunkAPI),
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to create Material Option.",
      );
    }
  },
);

// Async thunk for updating material option data
export const updateMaterialOption = createAsyncThunk(
  "materialOption/updateMaterialOption",
  async ({ id, data }, thunkAPI) => {
    // remove rejectWithValue from third parameter
    try {
      const response = await axios.put(
        `${BASEURL}/api/update-material/${id}`,
        data,
        getAuthHeaders(thunkAPI),
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update material option.",
      ); // Use rejectWithValue from thunkAPI
    }
  },
);

// Async thunk for deleteMaterialOption
export const deleteMaterialOption = createAsyncThunk(
  "materialOption/deleteMaterialOption",
  async (id, thunkAPI) => {
    try {
      const res = await axios.delete(
        `${BASEURL}/api/delete-material/${id}`,
        getAuthHeaders(thunkAPI), // Ensure headers are passed correctly
      );
      return res.data;
    } catch (error) {
      // Reject with value if the request fails
      return thunkAPI.rejectWithValue("Failed to delete material option.");
    }
  },
);
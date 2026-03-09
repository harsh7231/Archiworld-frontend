// src/api/authAPI.js
import axios from "axios";
import BASEURL from "../../BaseUrl";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAuthHeaders } from "../../utils/getAuthHeaders";

export const fetchCategory = createAsyncThunk(
  "category/fetchCategory",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${BASEURL}/api/get-categories`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch categories.",
      );
    }
  },
);

export const fetchSubCategory = createAsyncThunk(
  "category/fetchSubCategory",
  async (categoryId, thunkAPI) => {
    try {
      const response = await axios.get(
        `${BASEURL}/api/get-subCategories/${categoryId}`,
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch sub-categories.",
      );
    }
  },
);

// Async thunk for creating a new category
export const createCategory = createAsyncThunk(
  "category/createCategory",
  async (payload, thunkAPI) => {
    try {
      const response = await axios.post(
        `${BASEURL}/api/create-category`, // make sure BASEURL is defined
        payload,
        getAuthHeaders(thunkAPI),
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to create Category.",
      );
    }
  },
);

// Async thunk for creating a new sub-category
export const createSubCategory = createAsyncThunk(
  "category/createSubCategory",
  async (formData, thunkAPI) => {
    try {
      const response = await axios.post(
        `${BASEURL}/api/create-subCategory`, // make sure BASEURL is defined
        formData,
        getAuthHeaders(thunkAPI),
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to create sub-category.",
      );
    }
  },
);

// Async thunk for updating category data
export const updateCategory = createAsyncThunk(
  "category/updateCategory",
  async ({ id, data }, thunkAPI) => {
    // remove rejectWithValue from third parameter
    try {
      const response = await axios.put(
        `${BASEURL}/api/update-category/${id}`,
        data,
        getAuthHeaders(thunkAPI),
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update category.",
      ); // Use rejectWithValue from thunkAPI
    }
  },
);

// Async thunk for updating sub-category data
export const updateSubCategory = createAsyncThunk(
  "category/updateSubCategory",
  async ({ id, data }, thunkAPI) => {
    // remove rejectWithValue from third parameter
    try {
      const response = await axios.put(
        `${BASEURL}/api/update-subCategory/${id}`,
        data,
        getAuthHeaders(thunkAPI),
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update sub-category.",
      ); // Use rejectWithValue from thunkAPI
    }
  },
);

// Async thunk for deleteCategory
export const deleteCategory = createAsyncThunk(
  "category/deleteCategory",
  async (id, thunkAPI) => {
    try {
      const res = await axios.delete(
        `${BASEURL}/api/delete-category/${id}`,
        getAuthHeaders(thunkAPI), // Ensure headers are passed correctly
      );
      return res.data;
    } catch (error) {
      // Reject with value if the request fails
      return thunkAPI.rejectWithValue("Failed to delete category.");
    }
  },
);
// Async thunk for deleteSubCategory
export const deleteSubCategory = createAsyncThunk(
  "category/deleteSubCategory",
  async (id, thunkAPI) => {
    try {
      const res = await axios.delete(
        `${BASEURL}/api/delete-subCategory/${id}`,
        getAuthHeaders(thunkAPI), // Ensure headers are passed correctly
      );
      return res.data;
    } catch (error) {
      // Reject with value if the request fails
      return thunkAPI.rejectWithValue("Failed to delete sub-category.");
    }
  },
);

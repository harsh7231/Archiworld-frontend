// src/redux/slices/authSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  fetchBrandOptions,
  createBrandOption,
  updateBrandOption,
  deleteBrandOption,
} from "./brandOptionsAPI";

export const initialState = {
  brandOptions: [],
  loading: false,
  error: null,
  success: null,
};

const brandOptionSlice = createSlice({
  name: "brandOption",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch brand options
      .addCase(fetchBrandOptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrandOptions.fulfilled, (state, action) => {
        state.loading = false;
        state.brandOptions = action.payload; // Set the list of brand options
      })
      .addCase(fetchBrandOptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create new brand option
      .addCase(createBrandOption.pending, (state) => {
        state.loading = true;
      })
      .addCase(createBrandOption.fulfilled, (state, action) => {
        state.loading = false;
        state.brandOptions.push(action.payload); // Add the new brand option to the list
      })
      .addCase(createBrandOption.rejected, (state, action) => {
        state.loading = false;
      })
      // Update brand option
      .addCase(updateBrandOption.pending, (state) => {
        state.loading = true;
        state.success = null;
      })
      .addCase(updateBrandOption.fulfilled, (state, action) => {
        state.loading = false;
        const updatedBrandOption = action.payload.data;
        state.brandOptions = state.brandOptions.map((brandOption) =>
          brandOption._id === updatedBrandOption._id
            ? updatedBrandOption
            : brandOption,
        );
        state.success = "Brand option updated successfully.";
      })
      .addCase(updateBrandOption.rejected, (state, action) => {
        state.loading = false;
      })
      // delete brand option
      .addCase(deleteBrandOption.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteBrandOption.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Brand option deleted successfully.";
        state.brandOptions = state.brandOptions.filter(
          (brandOption) => brandOption._id !== action.payload.id,
        );
      })
      .addCase(deleteBrandOption.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const brandOptionReducer = brandOptionSlice.reducer;

// src/redux/slices/authSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  fetchMaterialOptions,
  createMaterialOption,
  updateMaterialOption,
  deleteMaterialOption,
} from "./materialOptionsAPI";

export const initialState = {
  materialOptions: [],
  loading: false,
  error: null,
  success: null,
};

const materialOptionSlice = createSlice({
  name: "materialOption",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch material options
      .addCase(fetchMaterialOptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMaterialOptions.fulfilled, (state, action) => {
        state.loading = false;
        state.materialOptions = action.payload; // Set the list of material options
      })
      .addCase(fetchMaterialOptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create new material option
      .addCase(createMaterialOption.pending, (state) => {
        state.loading = true;
      })
      .addCase(createMaterialOption.fulfilled, (state, action) => {
        state.loading = false;
        state.materialOptions.push(action.payload); // Add the new material option to the list
      })
      .addCase(createMaterialOption.rejected, (state, action) => {
        state.loading = false;
      })
      // Update material option
      .addCase(updateMaterialOption.pending, (state) => {
        state.loading = true;
        state.success = null;
      })
      .addCase(updateMaterialOption.fulfilled, (state, action) => {
        state.loading = false;
        const updatedMaterialOption = action.payload.data;
        state.materialOptions = state.materialOptions.map((materialOption) =>
          materialOption._id === updatedMaterialOption._id
            ? updatedMaterialOption
            : materialOption,
        );
        state.success = "Material option updated successfully.";
      })
      .addCase(updateMaterialOption.rejected, (state, action) => {
        state.loading = false;
      })
      // delete material option
      .addCase(deleteMaterialOption.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteMaterialOption.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Material option deleted successfully.";
        state.materialOptions = state.materialOptions.filter(
          (materialOption) => materialOption._id !== action.payload.id,
        );
      })
      .addCase(deleteMaterialOption.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const materialOptionReducer = materialOptionSlice.reducer;

// src/redux/slices/authSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  fetchCategory,
  fetchSubCategory,
  createCategory,
  createSubCategory,
  updateCategory,
  updateSubCategory,
  deleteCategory,
  deleteSubCategory,
} from "./categoriesAPI";

export const initialState = {
  categories: [],
  subCategories: [],
  loading: false,
  error: null,
};

const categorySlice = createSlice({
  name: "category",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload; // Set the list of categories
      })
      .addCase(fetchCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch sub-categories
      .addCase(fetchSubCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.subCategories = action.payload; // Set the list of subCategories
      })
      .addCase(fetchSubCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create new category
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.push(action.payload); // Add the new category to the list
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
      })
      //create new sub-category
      .addCase(createSubCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSubCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.subCategories.push(action.payload); // Add the new sub-category to the list
      })
      .addCase(createSubCategory.rejected, (state, action) => {
        state.loading = false;
      })
      // Update category
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.success = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCategory = action.payload.data;
        state.categories = state.categories.map((cat) =>
          cat._id === updatedCategory._id ? updatedCategory : cat
        );      
        state.success = "Category updated successfully.";
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
      })
      // Update sub-category
      .addCase(updateSubCategory.pending, (state) => {
        state.loading = true;
        state.success = null;
      })
      .addCase(updateSubCategory.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCategory = action.payload.data;
        state.subCategories = state.subCategories.map((subCat) =>
          subCat._id === updatedCategory._id ? updatedCategory : subCat
        );   
        state.success = "Sub-category updated successfully.";
      })
      .addCase(updateSubCategory.rejected, (state, action) => {
        state.loading = false;
      })
       // delete category
       .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Category deleted successfully.";
        state.categories = state.categories.filter((cat) => cat._id !== action.payload.id);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
       // delete sub-category
      .addCase(deleteSubCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteSubCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Sub-category deleted successfully.";
        state.subCategories = state.subCategories.filter((subCat) => subCat._id !== action.payload.id);
      })
      .addCase(deleteSubCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const categoryReducer = categorySlice.reducer;

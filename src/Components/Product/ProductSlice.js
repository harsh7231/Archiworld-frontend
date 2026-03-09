// src/redux/slices/authSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  createProduct,
  deleteProduct,
  fetchProductById,
  getProductsByUserId,
  updateProduct,
} from "./ProductAPI";

export const productInitialState = {
  products: [],
  productById: [],
  loading: false,
  error: false,
  loadingProductFetch: false,
  errorProductFetch: null,
};

const productSlice = createSlice({
  name: "product",
  initialState: productInitialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      //Fetch Products
      .addCase(getProductsByUserId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductsByUserId.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload; // Set the list of products
      })
      .addCase(getProductsByUserId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchProductById.pending, (state) => {
        state.loadingProductFetch = true;
        state.errorProductFetch = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loadingProductFetch = false;
        state.productById = action.payload; // Set the product by id
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loadingProductFetch = false;
        state.errorProductFetch = action.error.message;
      })
      // Create new product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.push(action.payload); // Add the new product to the list
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products; // Update current products's data
        state.success = "Product updated successfully.";
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      // delete Product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Product deleted successfully.";
        state.products = state.products.filter(
          (product) => product._id !== action.payload.id,
        );
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const productsReducer = productSlice.reducer;

// src/redux/slices/authSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  createSubscriptionPlan,
  deletePlan,
  fetchPlans,
  updateSubscriptionPlan,
} from "./subscriptionAPI";

export const plansInitialState = {
  plans: [],
  loading: false,
  error: null,
};

const planSlice = createSlice({
  name: "plan",
  initialState: plansInitialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Create new plan
      .addCase(createSubscriptionPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSubscriptionPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.plans.push(action.payload); // Add the new plan to the list
      })
      .addCase(createSubscriptionPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update plans
      .addCase(updateSubscriptionPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateSubscriptionPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload.plans; // Update current plan's data
        state.success = "Plans updated successfully.";
      })
      .addCase(updateSubscriptionPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload; // Set the list of plans
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(deletePlan.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      // deletePlan
      .addCase(deletePlan.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        const deletedId = action.payload.id;
        state.plans = state.plans.filter(
          (plan) => plan._id !== deletedId
        );
      })
      .addCase(deletePlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const plansReducer = planSlice.reducer;

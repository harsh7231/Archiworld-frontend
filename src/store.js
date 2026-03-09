import { configureStore } from "@reduxjs/toolkit";
import { authReducer, usersReducer } from "./Components/Auth/authSlice";
import storage from "redux-persist/lib/storage"; // defaults to localStorage
import { persistReducer, persistStore } from "redux-persist";
import { combineReducers } from "redux";
import { plansReducer } from "./Components/SubscriptionPlan/subscriptionSlice";
import { categoryReducer } from "./Components/CategoryManagement/categoriesSlice";
import { materialOptionReducer } from "./Components/MaterialOptions/materialOptionsSlice";
import { brandOptionReducer } from "./Components/BrandOptions/brandOptionsSlice";
import { productsReducer } from "./Components/Product/ProductSlice";
// STEP 1: Combine all slice reducers
const appReducer = combineReducers({
  auth: authReducer,
  users: usersReducer,
  plan: plansReducer,
  category: categoryReducer,
  materialOption: materialOptionReducer,
  brandOption: brandOptionReducer,
  product: productsReducer,
});

// STEP 2: Handle logout reset in root reducer
const rootReducer = (state, action) => {
  if (action.type === "auth/logoutUser/fulfilled") {
    localStorage.clear();
    state = undefined;
  }
  return appReducer(state, action);
};

// STEP 3: Set up redux-persist
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // only persist auth slice
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// STEP 4: Configure store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
export default store;

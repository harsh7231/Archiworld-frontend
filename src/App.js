import { Route, Switch, useLocation } from "wouter";
import Login from "./Components/Auth/Login";
import { useSelector } from "react-redux";
import { useAutoLogout } from "./autoLogout";
import MainLayout from "./Layout/MainLayout";
import ChangePassword from "./Components/Auth/ChangePassword";
import GetUser from "./Components/Auth/GetUser";
import CreateUser from "./Components/Auth/CreateUser";
import CreateSubscriptionPlan from "./Components/SubscriptionPlan/createSubscriptionPlan";
import SubscriptionPlan from "./Components/SubscriptionPlan/subscriptionManagement";
import CategoryManagement from "./Components/CategoryManagement/categoryManagement";
import SubCategoryManagement from "./Components/CategoryManagement/subCategoryManagment";
import BrandOptions from "./Components/BrandOptions/brandOptions";
import MaterialOptions from "./Components/MaterialOptions/materialOptions";
import CreateProductForm from "./Components/Product/CreateProduct";
import ProductManagement from "./Components/Product/ProductManagement";

function App() {
  useAutoLogout();
  return (
    <MainLayout>
      <Switch>
        {/* Public Route */}
        <Route path="/" component={Login} />
        {/* Brand Options Route */}
        <Route
          path="/brand-options"
          component={withAuth(BrandOptions, { adminOnly: true })}
        />
        {/* Material Options Route */}
        <Route
          path="/material-options"
          component={withAuth(MaterialOptions, { adminOnly: true })}
        />
        {/* Subscription Plans Route */}
        <Route
          path="/create-subscription"
          component={withAuth(CreateSubscriptionPlan, { adminOnly: true })}
        />
        <Route
          path="/edit-subscription"
          component={withAuth(CreateSubscriptionPlan, { adminOnly: true })}
        />
        <Route
          path="/subscription-management"
          component={withAuth(SubscriptionPlan, { adminOnly: true })}
        />
        {/* Category Management Route */}
        <Route
          path="/category-management"
          component={withAuth(CategoryManagement, { adminOnly: true })}
        />
        <Route
          path="/category-management/:name/:categoryId"
          component={withAuth(SubCategoryManagement, { adminOnly: true })}
        />
        {/* User Route */}
        <Route
          path="/create-user"
          component={withAuth(CreateUser, { adminOnly: true })}
        />
        <Route path="/edit-user/:userId" component={withAuth(CreateUser)} />
        <Route path="/user-management" component={withAuth(GetUser)} />
        <Route path="/change-password" component={withAuth(ChangePassword)} />

        {/* Products Route */}
        <Route path="/create-product" component={withAuth(CreateProductForm)} />
        <Route
          path="/edit-product/:productId"
          component={withAuth(CreateProductForm)}
        />
        <Route
          path="/product-management"
          component={withAuth(ProductManagement)}
        />
      </Switch>
    </MainLayout>
  );
}

// Auth wrapper for protected routes
const withAuth =
  (Component, options = {}) =>
  () => {
    const token = useSelector((state) => state.auth.token);
    const user = useSelector((state) => state.auth.user);
    const [, navigate] = useLocation();

    // If not logged in, redirect
    if (!token) {
      navigate("/");
      return null;
    }

    // Role/parent-based access
    if (options.adminOnly && user?.parentId !== null) {
      // redirect to a "not allowed" page or dashboard
      navigate("/");
      return null;
    }

    return <Component />;
  };

export default App;

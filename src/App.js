import { Route, Switch, useLocation } from "wouter";
import Login from "./Components/Auth/Login";
import { useSelector } from "react-redux";
import { useAutoLogout } from "./autoLogout";
import MainLayout from "./Layout/MainLayout";
import Dashboard from "./Components/Dashboard/Dashboard";
import ChangePassword from "./Components/Auth/ChangePassword";
import GetUser from "./Components/Auth/GetUser";
import CreateUser from "./Components/Auth/CreateUser";
import CreateSubscriptionPlan from "./Components/SubscriptionPlan/createSubscriptionPlan";
import SubscriptionPlan from "./Components/SubscriptionPlan/subscriptionManagement";

function App() {
  useAutoLogout();
  return (
    <MainLayout>
      <Switch>
        {/* Public Route */}
        <Route path="/" component={Login} />
        <Route path="/dashboard" component={withAuth(Dashboard)} />
        <Route path="/change-password" component={withAuth(ChangePassword)} />
        <Route path="/user-management" component={withAuth(GetUser)} />
        <Route path="/create-user" component={withAuth(CreateUser)} />
        <Route path="/edit-user" component={withAuth(CreateUser)} />
        {/* Subscription Plans Route */}
        <Route path="/create-subscription" component={withAuth(CreateSubscriptionPlan)} />
        <Route path="/edit-subscription" component={withAuth(CreateSubscriptionPlan)} />
        <Route path="/subscription-management" component={withAuth(SubscriptionPlan)} />
      </Switch>
    </MainLayout>
  );
}

// Auth wrapper for protected routes
const withAuth = (Component) => () => {
  const token = useSelector((state) => state.auth.token);
  const [, navigate] = useLocation();

  if (!token) {
    // Simple redirect using Wouter's `useLocation`
    navigate("/");
    return null;
  }

  return <Component />;
};

export default App;

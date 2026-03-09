import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Settings,
  ChevronDown,
  ChevronUp,
  Users,
  Database,
  LogOutIcon,
  X,
  PlusCircleIcon,
  Podcast,
  Library,
  ChartBarStacked,
  Layers2,
  Building,
  Command,
  ShoppingCart,
  ShoppingBagIcon,
  LayersPlus,
} from "lucide-react";
import logo from "../assets/logo.png";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../Components/Auth/authAPI";

export default function Sidebar({ isExpanded, setIsExpanded }) {
  const [location] = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [, navigate] = useLocation();
  const dispatch = useDispatch();

  const getInitials = (fullName) => {
    if (!fullName) return "";
    const parts = fullName.trim().split(" ");
    if (parts.length >= 2) {
      return parts[0][0].toUpperCase() + parts[1][0].toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    dispatch(logoutUser()).then((action) => {
      if (action.type === "auth/logoutUser/fulfilled") {
        toast.success("Successfully logged out.");
        navigate("/");
      } else {
        toast.error(action.payload);
      }
    });
  };
  const handleNavClick = () => {
    if (window.innerWidth < 1024) setIsExpanded(false);
  };

  const NavItem = ({ href, icon, label, active, setIsExpanded }) => (
    <Link
      href={href}
      onClick={handleNavClick}
      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
        active ? "text-white bg-black" : "text-gray-300 hover:text-white"
      }`}
    >
      {icon}
      <span className="ml-3">{label}</span>
    </Link>
  );

  const NavGroup = ({ icon, label, children, defaultOpen = false }) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:text-white"
        >
          <div className="flex items-center">
            {icon}
            <span className="ml-3">{label}</span>
          </div>
          {open ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {open && <div className="pl-10 pr-2 space-y-1">{children}</div>}
      </div>
    );
  };

  return (
    <div
      className={`h-full bg-black bg-opacity-90 text-white w-64 flex-shrink-0 fixed inset-y-0 left-0 z-30 transform transition-transform duration-200 ease-in-out 
        lg:translate-x-0 lg:relative  ${
          isExpanded ? "translate-x-0" : "-translate-x-full"
        }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-end justify-end h-fit border-b border-gray-700">
          {isExpanded ? (
            <div className="w-full flex items-center h-full">
              <img
                src={logo}
                alt="Logo"
                className="w-[calc(100%-2.5rem)] h-full px-2 py-2"
              />
              <X
                onClick={() => setIsExpanded(false)}
                className="w-10 h-10 px-2 py-2 z-20 relative"
              />
            </div>
          ) : (
            <img src={logo} alt="Logo" className="w-full h-full px-2 py-2" />
          )}
        </div>
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto pt-4 pb-4">
          <div className="px-2 space-y-1">
            {user?.parentId === null && (
              <>
                <NavItem
                  href="/brand-options"
                  icon={<Building className="h-5 w-5" />}
                  label="Brand Options"
                  active={location === "/brand-options"}
                />
                <NavItem
                  href="/material-options"
                  icon={<Command className="h-5 w-5" />}
                  label="Material Options"
                  active={location === "/material-options"}
                />
                <NavGroup
                  icon={<ChartBarStacked className="h-5 w-5" />}
                  label="Category Management"
                  defaultOpen={location.startsWith("/category-management")}
                >
                  <NavItem
                    href="/category-management"
                    icon={<Layers2 className="h-4 w-4" />}
                    label="Category Management"
                    active={location === "/category-management"}
                  />
                </NavGroup>
                <NavGroup
                  icon={<Podcast className="h-5 w-5" />}
                  label="Subscription Plans"
                  defaultOpen={
                    location.startsWith("/create-subscription") ||
                    location.startsWith("/edit-subscription") ||
                    location.startsWith("/subscription-management")
                  }
                >
                  <NavItem
                    href="/create-subscription"
                    icon={<PlusCircleIcon className="h-4 w-4" />}
                    label="Create Subscription"
                    active={location === "/create-subscription"}
                  />
                  <NavItem
                    href="/subscription-management"
                    icon={<Library className="h-4 w-4" />}
                    label="Subscription Record"
                    active={location === "/subscription-management"}
                  />
                </NavGroup>
              </>
            )}
            <NavGroup
              icon={<ShoppingCart className="h-5 w-5" />}
              label="Product"
              defaultOpen={
                location.startsWith("/create-product") ||
                location.startsWith("/edit-product") ||
                location.startsWith("/product-management")
              }
            >
              <NavItem
                href="/create-product"
                icon={<LayersPlus className="h-4 w-4" />}
                label="Create Product"
                active={location === "/create-product"}
              />
              <NavItem
                href="/product-management"
                icon={<ShoppingBagIcon className="h-4 w-4" />}
                label="Manage Product"
                active={location === "/product-management"}
              />
            </NavGroup>
            <NavGroup
              icon={<Settings className="h-5 w-5" />}
              label="Settings"
              defaultOpen={
                location.startsWith("/user-management") ||
                location.startsWith("/change-password")
              }
            >
              {user?.parent === null && (
                <NavItem
                  href="/user-management"
                  icon={<Users className="h-4 w-4" />}
                  label="User Management"
                  active={location === "/user-management"}
                />
              )}
              <NavItem
                href="/change-password"
                icon={<Database className="h-4 w-4" />}
                label="Change Password"
                active={location === "/change-password"}
              />
            </NavGroup>
          </div>
        </nav>
        {/* User Profile */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center justify-center cursor-pointer"
              onClick={() => navigate(`/edit-user/${user._id}`)}
            >
              {typeof user?.profileLogo === "string" ? (
                <img
                  src={`${user?.profileLogo}`}
                  alt="Profile Logo"
                  className="!aspect-square w-10 h-10 rounded-full"
                  onError={(e) => {
                    e.target.src = "/placeholder.png";
                  }}
                />
              ) : (
                <div className="!aspect-square p-2 rounded-full bg-black flex items-center justify-center text-white font-semibold leading-none">
                  {getInitials(user?.name)}
                </div>
              )}
            </div>
            <div className="w-1/2 overflow-scroll">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
            <div className="ml-3">
              <button
                onClick={handleLogout}
                className="aspect-square cursor-pointer rounded-full p-2 flex items-center justify-center text-white font-semibold hover:bg-gray-500 transition-all duration-300 "
              >
                <LogOutIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

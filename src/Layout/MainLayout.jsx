import React, { useEffect, useState } from "react";
import Sidebar from "../ui/Sidebar";
import { useLocation } from "wouter";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Menu } from "lucide-react";
import { TooltipProvider } from "../ui/tooltip";

const queryClient = new QueryClient();
function MainLayout({ children }) {
  const [location] = useLocation(); // ✅ fix here
  const [isExpanded, setIsExpanded] = useState(false);
  const isLoginRoute = location === "/";

  useEffect(() => {
    if (location !== "/edit-subscription") {
      localStorage.removeItem("subscriptionPlanToEdit");
    }
  }, [location]);

  if (isLoginRoute) {
    return (
      <TooltipProvider>
        <div className="w-full flex h-screen overflow-y-scroll">
          {children}
          <ToastContainer closeOnClick={true} closeButton />
        </div>
      </TooltipProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-full flex h-screen overflow-y-scroll">
        <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
        <div
          className={`h-full flex flex-col ${
            isExpanded
              ? "w-full lg:min-w-[calc(100%-16rem)] lg:max-w-[calc(100%-16rem)] ml-auto"
              : "w-full lg:min-w-[calc(100%-16rem)] lg:max-w-[calc(100%-16rem)]"
          } `}
        >
          <div className="flex justify-start items-start w-full h-fit">
            <div className="lg:hidden w-[4rem] px-3 py-2 h-fit">
              {isExpanded ? (
                <></>
              ) : (
                <Menu
                  onClick={() => setIsExpanded(true)}
                  className="w-10 h-10"
                />
              )}
            </div>
          </div>
          <div className="flex-1 w-full h-full bg-[#f8f8f8] overflow-auto px-4 sm:px-6 lg:px-8 scrollbar-visible">
            <div
              className="py-6 w-full h-full"
              onClick={() => isExpanded && setIsExpanded(false)}
            >
              {children}
              <div className="relative h-8"></div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer closeOnClick={true} closeButton />
    </QueryClientProvider>
  );
}

export default MainLayout;

import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import "./Layout.css";

const Layout = ({ children }) => {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";
  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/institute-registration";

  // ✅ Add any route here that should NOT be wrapped in <main>
  const excludedRoutes = ["/faculty/analytics", "/superadmin/analytics"];

  // check if current path starts with any excluded route
  const isExcluded = excludedRoutes.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <div className="app-layout">
      {!isLandingPage && !isAuthPage && <Navbar />}

      {isExcluded ? (
        // render directly
        <>{children}</>
      ) : (
        <main
          className={`main-content ${isLandingPage ? "landing-main" : ""} ${
            isAuthPage ? "auth-main" : ""
          }`}
        >
          {children}
        </main>
      )}
    </div>
  );
};

export default Layout;

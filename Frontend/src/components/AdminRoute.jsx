import React from "react";
import { Navigate } from "react-router-dom";

// AdminRoute: client-side guard for the /admin route.
// Renders children only if `account.walletAddress` matches the VITE_ADMIN_WALLET env var.
const AdminRoute = ({ account, children }) => {
  const adminWalletAddress = import.meta.env.VITE_ADMIN_WALLET;

  const isAdmin =
      account?.walletAddress &&
      adminWalletAddress &&
      account.walletAddress.toLowerCase() === adminWalletAddress.toLowerCase();

  if (!isAdmin) {
    // Not an admin: redirect to homepage (cannot access /admin by typing URL)
    return <Navigate to="/" replace />;
  }

  // Authorized: render children (the Admin page)
  return <>{children}</>;
};

export default AdminRoute;

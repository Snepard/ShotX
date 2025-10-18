import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Homepage";
import GamePage from "./pages/GamePage";
import ProfilePage from "./pages/ProfilePage";
import Marketplace from "./pages/Marketplace";
import MainLayout from "./components/MainLayout";
import { loginAndAuthenticate, verifyExistingLogin } from './services/blockchainService';

function App() {
  // State now holds the entire user data object, not just the address.
  const [userData, setUserData] = useState(null);

  // This hook checks for an existing session when the app loads.
  useEffect(() => {
    const checkAuthStatus = async () => {
      // We will enhance this later to fetch full user data on session verification.
      const userAddress = await verifyExistingLogin();
      if (userAddress) {
        // For now, we know a session exists. A full login will populate all data.
      }
    };
    checkAuthStatus();
  }, []);

  const handleLogin = async () => {
    const userObject = await loginAndAuthenticate();
    if (userObject) {
      setUserData(userObject);
    }
  };
  
  const handleLogout = () => {
    // In a full implementation, you would also call a backend endpoint to clear the session cookie.
    setUserData(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Pass the `userData` object as the `account` prop, and the login handler. */}
        <Route element={<MainLayout account={userData} handleConnect={handleLogin} />}>
          <Route path="/" element={<HomePage />} />
          {/* Ensure ProfilePage receives the full user data object. */}
          <Route path="/Profile" element={<ProfilePage account={userData} />} />
          <Route path="/Marketplace" element={<Marketplace />} />
        </Route>

        {/* GamePage receives the specific wallet address, safely accessed with optional chaining. */}
        <Route path="/Game" element={<GamePage connectedAccount={userData?.walletAddress} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import HomePage from "./pages/Homepage";
import GamePage from "./pages/GamePage";
import ProfilePage from "./pages/ProfilePage";
import Marketplace from "./pages/Marketplace";
import MainLayout from "./components/MainLayout";
import { 
  loginAndAuthenticate, 
  verifyExistingLogin, 
  fetchUserProfile,
  logoutUser 
} from './services/blockchainService';
import AdminPage from "./pages/AdminPage";

const AppContent = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate(); 

  useEffect(() => {
    const checkAuthStatus = async () => {
      const userAddress = await verifyExistingLogin();
      if (userAddress) {
        const profileData = await fetchUserProfile(userAddress);
        if (profileData) {
          setUserData(profileData);
        }
      }
      setIsLoading(false);
    };
    checkAuthStatus();
  }, []);

  const handleLogin = async () => {
    const userObject = await loginAndAuthenticate();
    if (userObject) {
      setUserData(userObject);
    }
  };
  
  const handleLogout = async () => {
    const success = await logoutUser();
    if (success) {
      setUserData(null);
      navigate('/'); 
    }
  };

  if (isLoading) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#020617',
          color: '#00FFFF',
          fontFamily: 'monospace'
        }}>
          Initializing ShotX Interface...
        </div>
      );
  }

  return (
    <Routes>
      <Route element={<MainLayout account={userData} handleConnect={handleLogin} />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/Profile" element={<ProfilePage account={userData} handleLogout={handleLogout} />} />
        <Route path="/Marketplace" element={<Marketplace />} />
      </Route>
      <Route path="/Game" element={<GamePage connectedAccount={userData?.walletAddress} />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
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
import AdminRoute from "./components/AdminRoute";

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

    // Listen for MetaMask account changes
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          await handleLogout();
        } else {
          // User switched accounts - check if it matches logged in account
          const currentAddress = accounts[0].toLowerCase();
          const storedAddress = localStorage.getItem('shotx_wallet');
          
          if (storedAddress && currentAddress !== storedAddress) {
            // Account mismatch - logout and require re-authentication
            await handleLogout();
            alert('Wallet account changed. Please connect with your logged-in account.');
          }
        }
      };

      const handleChainChanged = () => {
        // Reload the page when chain changes
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Cleanup listeners on unmount
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
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
        <Route path="/admin" element={<AdminRoute account={userData}><AdminPage /></AdminRoute>} />
      </Route>
      <Route path="/Game" element={<GamePage connectedAccount={userData?.walletAddress} />} />
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
import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Homepage";
import GamePage from "./pages/GamePage";
import ProfilePage from "./pages/ProfilePage";
import Marketplace from "./pages/Marketplace";
import MainLayout from "./components/MainLayout";
import { connectWallet } from './services/blockchainService'; // Import the service

function App() {
  const [account, setAccount] = useState(null);

  const handleConnect = async () => {
    const address = await connectWallet();
    if (address) {
      setAccount(address);
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Pass state and handler to MainLayout */}
        <Route element={<MainLayout account={account} handleConnect={handleConnect} />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/Profile" element={<ProfilePage />} />
          <Route path="/Marketplace" element={<Marketplace />} />
          {/* Add future pages like Inventory/Marketplace here */}
        </Route>

        {/* Pass the account state to GamePage */}
        <Route path="/Game" element={<GamePage connectedAccount={account} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
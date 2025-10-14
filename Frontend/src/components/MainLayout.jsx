import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

// Accept account and handleConnect as props
const MainLayout = ({ account, handleConnect }) => {
  return (
    <>
      <Navbar account={account} handleConnect={handleConnect} />
      <main>
        {/* FIX: Pass the account down to child routes using the context prop */}
        <Outlet context={{ account }} />
      </main>
    </>
  );
};

export default MainLayout;
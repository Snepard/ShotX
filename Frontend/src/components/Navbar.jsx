import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Gamepad2, Menu, X, Wallet } from 'lucide-react';

// The Navbar receives the `account` prop (which is our userData object)
// and the `handleConnect` prop (which is our handleLogin function).
const Navbar = ({ account, handleConnect }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Game', to: '/game' },
    { name: 'Profile', to: '/profile' },
    { name: 'Marketplace', to: '/marketplace' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ✅ CORRECTED: Safely access the walletAddress from the `account` object.
  // Optional chaining (`?.`) prevents errors if `account` is null or undefined.
  const truncatedAddress = account?.walletAddress
    ? `${account.walletAddress.slice(0, 6)}...${account.walletAddress.slice(-4)}`
    : null;

  return (
    <>
      <style>{`
        /* ... your existing sophisticated styles ... */
        .navbar-transition { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        .glass-effect { background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
        .pill-shadow { box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3), 0 0 30px rgba(6, 182, 212, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1); }
        .nav-link { position: relative; overflow: hidden; }
        .nav-link::before { content: ''; position: absolute; top: 50%; left: 50%; width: 0; height: 0; background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(139, 92, 246, 0.2)); border-radius: 50%; transform: translate(-50%, -50%); transition: all 0.3s ease; z-index: -1; }
        .nav-link:hover::before { width: 100%; height: 100%; }
        .logo-glow { filter: drop-shadow(0 0 8px rgba(6, 182, 212, 0.4)); }
        .btn-primary { background: linear-gradient(135deg, #06b6d4, #3b82f6); border: 1px solid rgba(6, 182, 212, 0.3); transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); position: relative; overflow: hidden; }
        .btn-primary::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent); transition: left 0.5s ease; }
        .btn-primary:hover::before { left: 100%; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(6, 182, 212, 0.3), 0 0 20px rgba(6, 182, 212, 0.2); }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        .mobile-menu { animation: slideDown 0.3s ease-out; }
        .hologram-text { background: linear-gradient(45deg, #06b6d4, #3b82f6, #8b5cf6, #06b6d4); background-size: 300% 300%; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; animation: hologramShift 4s ease-in-out infinite; }
        @keyframes hologramShift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
      `}</style>

      <nav className={`fixed top-0 left-0 right-0 z-50 navbar-transition ${isScrolled ? 'px-4 py-4' : 'px-0 py-0'}`}>
        <div className={`navbar-transition ${isScrolled ? 'max-w-[80%] mx-auto glass-effect border border-white/10 rounded-full pill-shadow' : 'w-full bg-slate-900/80 backdrop-blur-sm border-b border-slate-800/50'}`}>
          <div className={`flex items-center justify-between ${isScrolled ? 'px-8 py-4' : 'px-8 py-6'}`}>
            <NavLink to="/" className="flex items-center space-x-3 group">
              <div className={`p-2 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl logo-glow navbar-transition group-hover:scale-110 ${isScrolled ? 'scale-90' : 'scale-100'}`}>
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              <span className={`font-black tracking-wider text-white hologram-text navbar-transition ${isScrolled ? 'text-xl' : 'text-2xl'}`}>
                ShotX
              </span>
            </NavLink>

            <div className="hidden lg:flex items-center space-x-2">
              {navLinks.map((link) => (
                <NavLink key={link.name} to={link.to} className={({ isActive }) => `nav-link px-6 py-3 rounded-full font-medium transition-all duration-300 navbar-transition ${isScrolled ? 'text-sm' : 'text-base'} ${isActive ? 'text-cyan-400' : 'text-gray-300 hover:text-cyan-300'}`}>
                  {link.name}
                </NavLink>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <button onClick={handleConnect} className={`hidden lg:flex items-center space-x-2 btn-primary text-white font-bold rounded-full transition-all duration-300 navbar-transition cursor-pointer ${isScrolled ? 'px-6 py-3 text-sm' : 'px-8 py-4 text-base'}`}>
                <Wallet className={`${isScrolled ? 'w-4 h-4' : 'w-5 h-5'}`} />
                <span>
                  {/* ✅ CORRECTED: Intelligently display user's name or address. */}
                  {account ? (account.username || truncatedAddress) : "Connect Wallet"}
                </span>
              </button>

              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`lg:hidden p-2 rounded-xl glass-effect border border-cyan-400/30 text-white hover:border-cyan-400/60 transition-all duration-300 navbar-transition ${isScrolled ? 'scale-90' : 'scale-100'}`}>
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className={`lg:hidden mt-4 navbar-transition ${isScrolled ? 'max-w-[80%] mx-auto' : 'mx-4'}`}>
            <div className="glass-effect border border-white/10 rounded-2xl overflow-hidden mobile-menu">
              <div className="p-6 space-y-4">
                {navLinks.map((link) => (
                  <NavLink key={link.name} to={link.to} onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `block p-3 rounded-xl font-medium transition-all duration-300 ${isActive ? 'text-cyan-400 bg-white/10' : 'text-gray-300 hover:text-cyan-400 hover:bg-white/5'}`}>
                    {link.name}
                  </NavLink>
                ))}
                <div className="pt-4 border-t border-white/10">
                  <button onClick={handleConnect} className="w-full btn-primary text-white font-bold px-6 py-3 rounded-full flex items-center justify-center space-x-2 transition-all duration-300">
                    <Wallet className="w-5 h-5" />
                    <span>
                      {/* ✅ CORRECTED: Same fix for the mobile menu button. */}
                      {account ? (account.username || truncatedAddress) : "Connect Wallet"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;


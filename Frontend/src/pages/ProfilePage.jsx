import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Pencil, LogOut, Trophy, Wallet, Check, X, Coins, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useInView } from "framer-motion";
import axios from 'axios';
import { updateUserProfile } from '../services/blockchainService';

// ================= BACKGROUND COMPONENT =================
// This component remains unchanged.
const SpaceBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const PALETTE = ["#00FFFF", "#00E5EE", "#20B2AA", "#40E0D0"];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const random = (min, max) => Math.random() * (max - min) + min;

    class Nebula {
        constructor() {
          this.x = random(0, canvas.width);
          this.y = random(0, canvas.height);
          this.radius = random(250, 800);
          const alphaHex = Math.floor(random(10, 30)).toString(16).padStart(2, "0");
          this.color1 = PALETTE[Math.floor(random(0, PALETTE.length))] + alphaHex;
          this.color2 = PALETTE[Math.floor(random(0, PALETTE.length))] + "00";
          this.speedX = random(-0.3, 0.3) * 0.1;
          this.speedY = random(-0.3, 0.3) * 0.1;
        }
        draw() {
          const gradient = ctx.createRadialGradient(
            this.x, this.y, this.radius * 0.1,
            this.x, this.y, this.radius
          );
          gradient.addColorStop(0, this.color1);
          gradient.addColorStop(1, this.color2);
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        update() {
          this.x += this.speedX;
          this.y += this.speedY;
          if (this.x > canvas.width + this.radius) this.x = -this.radius;
          else if (this.x < -this.radius) this.x = canvas.width + this.radius;
          if (this.y > canvas.height + this.radius) this.y = -this.radius;
          else if (this.y < -this.radius) this.y = canvas.height + this.radius;
        }
    }

    class Shooter {
        constructor() {
          this.reset();
          this.x = random(0, canvas.width);
          this.y = random(0, canvas.height);
        }
        reset() {
          this.opacity = random(0.3, 0.9);
          this.radius = this.opacity * 1.8;
          const speed = random(1.5, 5) * this.opacity;
          this.color = PALETTE[Math.floor(random(0, PALETTE.length))];
          const startSide = Math.floor(random(0, 3));
          if (startSide === 0) {
            this.x = random(0, canvas.width); this.y = -this.radius;
            this.vx = random(-1, 1) * speed * 0.4; this.vy = speed;
          } else if (startSide === 1) {
            this.x = -this.radius; this.y = random(0, canvas.height);
            this.vx = speed; this.vy = random(-0.5, 0.5) * speed * 0.4;
          } else {
            this.x = canvas.width + this.radius; this.y = random(0, canvas.height);
            this.vx = -speed; this.vy = random(-0.5, 0.5) * speed * 0.4;
          }
        }
        draw() {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.globalAlpha = this.opacity;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
        update() {
          this.x += this.vx;
          this.y += this.vy;
          if (this.x < -this.radius || this.x > canvas.width + this.radius || this.y > canvas.height + this.radius || this.y < -this.radius) {
            this.reset();
          }
        }
    }

    const nebulas = Array.from({ length: 8 }, () => new Nebula());
    const shooters = Array.from({ length: 150 }, () => new Shooter());

    const animate = () => {
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      nebulas.forEach((nebula) => { nebula.update(); nebula.draw(); });
      shooters.forEach((shooter) => { shooter.update(); shooter.draw(); });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: -1, pointerEvents: "none" }} />;
};

// ================= UI ASSETS =================
const EmptyInventoryIcon = () => (
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-500/50 mx-auto mb-4">
        <path d="M21 10.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        <path d="M12 12h.01"></path><path d="M16 12h.01"></path><path d="M8 12h.01"></path>
    </svg>
);

// ================= NEW: NFT DETAIL MODAL =================
// We add the identical modal component from Marketplace.jsx
const NftDetailModal = ({ nft, onClose }) => {
  const backdropRef = useRef(null);

  const handleBackdropClick = (e) => {
    if (backdropRef.current === e.target) {
      onClose();
    }
  };

  return (
    <motion.div
      ref={backdropRef}
      className="nft-modal-backdrop"
      onClick={handleBackdropClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="nft-modal-content"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <img src={nft.imageUrl} alt={nft.name} className="nft-modal-image" />
        <div className="nft-modal-details">
          <h2 className="font-orbitron text-3xl font-bold text-white text-glow">{nft.name}</h2>
          <p className="text-gray-300 mt-2 mb-4 max-w-lg">{nft.description || "No description available."}</p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-cyan-300">
              <Coins size={20} />
              <span className="font-orbitron text-2xl font-bold">
                {nft.price ? nft.price.toLocaleString() : "---"} SXC
              </span>
            </div>
            <div className="text-gray-400 text-sm font-mono">
              <span className="font-bold">TOKEN ID:</span> {nft.tokenId}
            </div>
          </div>
        </div>
        <button onClick={onClose} className="nft-modal-close">
          <X size={24} />
        </button>
      </motion.div>
    </motion.div>
  );
};


// ================= HELPER & UI COMPONENTS =================
const AnimatedStat = ({ value, isCurrency = false }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        if (isInView) {
            let start = 0;
            const end = value;
            if (end === start) return;
            const duration = 1500;
            const frameDuration = 1000 / 60;
            const totalFrames = Math.round(duration / frameDuration);
            let frame = 0;
            const counter = setInterval(() => {
                frame++;
                const progress = frame / totalFrames;
                setDisplayValue(start + progress * (end - start));
                if (frame === totalFrames) {
                    clearInterval(counter);
                    setDisplayValue(end);
                }
            }, frameDuration);
            return () => clearInterval(counter);
        }
    }, [isInView, value]);

    const formatValue = (val) => {
        if (isCurrency) return `$ ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        return val.toLocaleString('en-US', { maximumFractionDigits: 0 });
    }

    return <span ref={ref}>{formatValue(displayValue)}</span>;
};

const StatBox = ({ title, value, icon, isCurrency }) => (
  <motion.div
    className="bg-slate-800/50 p-3 rounded-lg flex flex-row items-center gap-4 w-60 backdrop-blur-sm border border-cyan-500/20 hover:border-cyan-400/50 transition-all duration-500"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    whileHover={{ 
      scale: 1.05, 
      boxShadow: "0 0 15px rgba(0, 255, 255, 0.2)",
      borderColor: "rgba(0, 255, 255, 0.5)"
    }}
  >
    <motion.div 
      className="text-cyan-400"
      whileHover={{ rotate: 360, scale: 1.2 }}
      transition={{ duration: 0.6 }}
    >
      {icon}
    </motion.div>
    <div className="flex flex-col items-start">
      <span className="text-xl font-bold text-white font-orbitron">
        <AnimatedStat value={value} isCurrency={isCurrency} />
      </span>
      <span className="text-xs text-cyan-200/60">{title}</span>
    </div>
  </motion.div>
);

// MODIFIED: Added onImageClick prop
const NftCard = ({ nft, onImageClick }) => (
  <motion.div
    className="card-container"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    whileHover={{ y: -8 }}
  >
    <div className="card bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-cyan-500/30 flex flex-col items-center justify-between gap-4 h-full">
      <motion.img 
        src={nft.imageUrl} 
        alt={nft.name} 
        className="w-full h-40 object-contain rounded-md cursor-pointer" // Added cursor-pointer
        onError={(e) => (e.currentTarget.src = "https://placehold.co/400x300/020617/00FFFF?text=SHOTX")}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
        onClick={() => onImageClick(nft)} // Added this onClick handler
      />
      <div className="text-center w-full">
        <h3 className="font-bold text-white truncate font-orbitron">{nft.name}</h3>
      </div>
      <motion.div 
        className="flex items-center justify-center gap-2 text-cyan-300 w-full bg-slate-900/50 py-2 rounded-md"
        whileHover={{ backgroundColor: "rgba(15, 23, 42, 0.8)" }}
        transition={{ duration: 0.3 }}
      >
        <Coins size={18} />
        <span className="font-bold font-orbitron text-lg">
          {nft.price ? nft.price.toLocaleString() : "---"} SXC
        </span>
      </motion.div>
    </div>
  </motion.div>
);

// ================= MAIN PROFILE PAGE COMPONENT =================
export default function ProfilePage({ account, handleLogout }) {
  // --- STATE MANAGEMENT ---
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const fileInputRef = useRef(null);
  const [shotxBalance, setShotxBalance] = useState('0.00');
  const [ownedNfts, setOwnedNfts] = useState([]);
  const [displayNfts, setDisplayNfts] = useState([]);
  const inventoryScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [selectedNft, setSelectedNft] = useState(null); // NEW: State for the modal

  // --- INTERNAL HANDLER FUNCTIONS ---

  const handleUpdateUsername = async (username) => {
    const formData = new FormData();
    formData.append('username', username);
    await updateUserProfile(account.walletAddress, formData);
  };

  const handleUpdateProfilePic = async (file) => {
    const formData = new FormData();
    formData.append('profilePic', file);
    await updateUserProfile(account.walletAddress, formData);
  };

  // SHOTX BALANCE: use DB value only on load
  useEffect(() => {
    if (account?.walletAddress) {
      const cachedBalance = parseFloat(account.shotxBalance || '0').toFixed(2);
      setShotxBalance(cachedBalance);
    }
  }, [account]);

  // OWNED NFTS: use DB value on load
  useEffect(() => {
    if (!account?.walletAddress) return;
    const cached = Array.isArray(account.ownedNFTs) ? account.ownedNFTs.map(String) : [];
    setOwnedNfts(cached);
  }, [account]);

  // Build display list with item details from marketplace
  useEffect(() => {
    const buildDisplay = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const resp = await axios.get(`${API_URL}/api/items`);
        const items = resp.data || [];
        const ownedSet = new Set(ownedNfts.map(String));
        const filtered = items.filter(it => ownedSet.has(String(it._id)));
        setDisplayNfts(filtered);
      } catch (e) {
        setDisplayNfts([]);
      }
    };
    if (ownedNfts.length > 0) buildDisplay();
    else setDisplayNfts([]);
  }, [ownedNfts]);

  // --- UI EVENT TRIGGERS ---
  
  // Check scroll position for arrow visibility
  const checkScrollPosition = () => {
    if (inventoryScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = inventoryScrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Scroll handlers
  const scrollInventory = (direction) => {
    if (inventoryScrollRef.current) {
      const scrollAmount = 300;
      const newScrollLeft = direction === 'left' 
        ? inventoryScrollRef.current.scrollLeft - scrollAmount
        : inventoryScrollRef.current.scrollLeft + scrollAmount;
      
      inventoryScrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  // Update scroll arrows when inventory changes
  useEffect(() => {
    checkScrollPosition();
    const handleResize = () => checkScrollPosition();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [displayNfts]);
  
  // Set initial username for editing when account data is available
  useEffect(() => {
    if (account?.username) {
      setNewUsername(account.username);
    }
  }, [account?.username]);

  // Triggers the hidden file input when the profile picture is clicked
  const handleProfilePicClick = () => {
    fileInputRef.current.click();
  };
  
  // Called when a new file is selected from the file input
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleUpdateProfilePic(file);
    }
  };
  
  // Called when the "Save" button for the username is clicked
  const handleUsernameSaveClick = () => {
    if (newUsername.trim() && newUsername !== account.username) {
      handleUpdateUsername(newUsername);
    }
    setIsEditingUsername(false);
  };

  // --- RENDER LOGIC ---

  if (!account) {
    return (
      <div className="relative min-h-screen text-white font-sans flex items-center justify-center">
        <SpaceBackground />
        <div className="relative z-10 text-center">
            <h1 className="text-3xl font-bold font-orbitron text-glow">Loading Profile...</h1>
            <p className="text-cyan-200/60 mt-2">Accessing secure user data.</p>
        </div>
      </div>
    );
  }

  const truncatedAddress = `${account.walletAddress.substring(0, 6)}...${account.walletAddress.substring(account.walletAddress.length - 4)}`;
  const hasNfts = ownedNfts && ownedNfts.length > 0;
  const nfts = displayNfts; 

  const pageStyles = `
    .card-container { perspective: 1000px; }
    .card { transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1); transform-style: preserve-3d; }
    .card-container:hover .card { 
        transform: rotateX(10deg) rotateY(-8deg) scale(1.1); 
        box-shadow: 0px 25px 40px -15px rgba(0, 255, 255, 0.3);
    }
    .font-orbitron { font-family: 'Orbitron', monospace; }
    .text-glow { text-shadow: 0 0 8px rgba(0, 255, 255, 0.5); }
    
    /* Hide scrollbar on inventory */
    .inventory-scroll {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .inventory-scroll::-webkit-scrollbar {
      display: none;
    }
    
    /* Arrow button styling */
    .scroll-arrow {
      transition: all 0.3s ease;
    }
    .scroll-arrow:hover {
      transform: scale(1.1);
      background: rgba(0, 255, 255, 0.2);
    }
    .scroll-arrow:active {
      transform: scale(0.95);
    }
  `;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="relative min-h-screen text-white font-sans">
      <style>{pageStyles}</style>
      <SpaceBackground />

      <main className="relative z-10 mt-4 pt-28 pb-12 px-4">
        <motion.div
            className="w-full max-w-6xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div
                className="w-full p-4 md:p-6 bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-lg rounded-xl border border-cyan-500/30 flex flex-col items-center gap-6"
                variants={itemVariants}
            >
                {/* Top Row: User Info & Disconnect Button */}
                <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4">
                    {/* User Info */}
                    <div className="flex items-center gap-5">
                        <motion.div 
                          className="relative group cursor-pointer" 
                          onClick={handleProfilePicClick}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                            <motion.img 
                              src={account.profilePic?.url || "../DefaultProfile.jpg"} 
                              alt="Profile" 
                              className="w-24 h-24 rounded-full border-2 border-cyan-500 object-cover transition-all duration-500 group-hover:border-cyan-300"
                              whileHover={{ rotate: 5 }}
                            />
                            <motion.div 
                              className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              initial={{ opacity: 0 }}
                              whileHover={{ opacity: 1 }}
                            >
                                <motion.div
                                  initial={{ scale: 0 }}
                                  whileHover={{ scale: 1, rotate: 360 }}
                                  transition={{ duration: 0.5 }}
                                >
                                  <Pencil className="h-6 w-6 text-cyan-300" />
                                </motion.div>
                            </motion.div>
                        </motion.div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                        <div className="text-center md:text-left">
                            {isEditingUsername ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                        className="bg-slate-700 text-white text-3xl font-bold font-orbitron rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-cyan-500 w-48"
                                        autoFocus
                                    />
                                    <motion.button onClick={handleUsernameSaveClick} className="text-green-400 hover:text-green-300" whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                                        <Check className="h-6 w-6" />
                                    </motion.button>
                                    <motion.button onClick={() => setIsEditingUsername(false)} className="text-red-400 hover:text-red-300" whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                                        <X className="h-6 w-6" />
                                    </motion.button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center md:justify-start gap-2">
                                    <h1 className="text-3xl font-bold text-white font-orbitron">{account.username || 'New Player'}</h1>
                                    <motion.button onClick={() => setIsEditingUsername(true)} className="text-gray-400 hover:text-cyan-400" whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                                        <Pencil className="h-4 w-4" />
                                    </motion.button>
                                </div>
                            )}
                            <p className="text-sm text-cyan-200/60 font-mono tracking-wider">{truncatedAddress}</p>
                        </div>
                    </div>
                    <motion.button 
                        onClick={handleLogout}
                        className="bg-gradient-to-b from-red-600 to-red-800 border border-red-500/80 text-white py-2 px-5 rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:from-red-500 hover:to-red-700"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95, boxShadow: "inset 0 3px 5px rgba(0,0,0,0.4)" }}
                    >
                        <LogOut size={18} />
                        <span className="text-sm font-semibold">Disconnect</span>
                    </motion.button>
                </div>

                {/* Bottom Row: Stats */}
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 w-full pt-6 border-t border-cyan-500/20">
                    <StatBox title="ShotX Balance" value={parseFloat(shotxBalance)} icon={<Wallet size={24} />} />
                    <StatBox title="Highest Score" value={account.highestScore || 0} icon={<Trophy size={24} />} />
                </div>
            </motion.div>

            {/* Inventory Section */}
            <motion.div className="w-full p-6 md:text-start text-center" variants={itemVariants}>
                <h2 className="text-4xl font-bold font-orbitron text-white mb-4 text-glow">Inventory</h2>
                {hasNfts ? (
                    <div className="relative">
                        {/* Left Arrow */}
                        {canScrollLeft && (
                          <motion.button
                            className="scroll-arrow absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-slate-800/80 backdrop-blur-sm p-3 rounded-full border border-cyan-500/30 text-cyan-400"
                            onClick={() => scrollInventory('left')}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileHover={{ backgroundColor: "rgba(0, 255, 255, 0.2)" }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <ChevronLeft size={24} />
                          </motion.button>
                        )}
                        
                        {/* Inventory Scroll Container */}
                        <motion.div 
                            ref={inventoryScrollRef}
                            className="inventory-scroll flex overflow-x-auto gap-6 px-12"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            onScroll={checkScrollPosition}
                        >
                          {/* MODIFIED: Pass the onImageClick handler to each card */}
                          {nfts.map((nft) => (
                            <div key={nft._id || nft.tokenId} className="flex-shrink-0 w-64">
                              <NftCard nft={nft} onImageClick={setSelectedNft} />
                            </div>
                          ))}
                        </motion.div>
                        
                        {/* Right Arrow */}
                        {canScrollRight && (
                          <motion.button
                            className="scroll-arrow absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-slate-800/80 backdrop-blur-sm p-3 rounded-full border border-cyan-500/30 text-cyan-400"
                            onClick={() => scrollInventory('right')}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileHover={{ backgroundColor: "rgba(0, 255, 255, 0.2)" }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <ChevronRight size={24} />
                          </motion.button>
                        )}
                    </div>
                ) : (
                    <motion.div 
                      className="text-center py-16 px-6 bg-slate-900/50 backdrop-blur-lg rounded-xl border border-dashed border-cyan-500/40"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                        <motion.div
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <EmptyInventoryIcon />
                        </motion.div>
                        <motion.h3 
                          className="text-xl font-semibold text-white font-orbitron"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          Your Inventory is Nebulous
                        </motion.h3>
                        <motion.p 
                          className="text-cyan-200/60 mt-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          No player skins owned. Procure some from the marketplace to begin your collection.
                        </motion.p>
                        <Link to="/marketplace">
                          <motion.button 
                            className="mt-6 bg-cyan-600 text-slate-900 font-bold py-2 px-6 rounded-lg"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            whileHover={{ 
                              scale: 1.05, 
                              backgroundColor: "#00FFFF", 
                              boxShadow: "0 0 20px #00FFFF" 
                            }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Visit Marketplace
                          </motion.button>
                        </Link>
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
      </main>

      {/* NEW: Render the modal conditionally */}
      {selectedNft && (
        <NftDetailModal nft={selectedNft} onClose={() => setSelectedNft(null)} />
      )}
    </div>
  );
}
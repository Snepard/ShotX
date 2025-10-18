import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom"; // Import the Link component
import { Pencil, LogOut, Trophy, Wallet, Check, X } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { updateUserProfile, getShotXBalance } from '../services/blockchainService';

// ================= BACKGROUND COMPONENT =================
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
          if (startSide === 0) { // Top
            this.x = random(0, canvas.width); this.y = -this.radius;
            this.vx = random(-1, 1) * speed * 0.4; this.vy = speed;
          } else if (startSide === 1) { // Left
            this.x = -this.radius; this.y = random(0, canvas.height);
            this.vx = speed; this.vy = random(-0.5, 0.5) * speed * 0.4;
          } else { // Right
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
    className="bg-slate-800/50 p-3 rounded-lg flex flex-row items-center gap-4 w-60 backdrop-blur-sm border border-cyan-500/20 hover:border-cyan-400/50 transition-colors duration-300"
    whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(0, 255, 255, 0.2)" }}
  >
    <div className="text-cyan-400">{icon}</div>
    <div className="flex flex-col items-start">
      <span className="text-xl font-bold text-white font-orbitron">
        <AnimatedStat value={value} isCurrency={isCurrency} />
      </span>
      <span className="text-xs text-cyan-200/60">{title}</span>
    </div>
  </motion.div>
);

const NftCard = ({ nft }) => (
  <motion.div
    className="card-container"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="card bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-cyan-500/30 flex flex-col items-center justify-between gap-4 h-full">
      <img src={nft.imageUrl} alt={nft.name} className="w-full h-40 object-contain rounded-md" />
      <motion.button 
        className="w-full bg-cyan-600 text-slate-900 font-bold truncate font-orbitron py-2 rounded-lg"
        whileHover={{ scale: 1.05, backgroundColor: "#00FFFF", boxShadow: "0 0 20px #00FFFF" }}
        whileTap={{ scale: 0.95 }}
      >
        {nft.name}
      </motion.button>
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

  // --- INTERNAL HANDLER FUNCTIONS ---

  const handleUpdateUsername = async (username) => {
    const formData = new FormData();
    formData.append('username', username);
    await updateUserProfile(account.walletAddress, formData);
    // TODO: Add logic to refresh user data state in App.jsx
};

  const handleUpdateProfilePic = async (file) => {
    const formData = new FormData();
    formData.append('profilePic', file);
    await updateUserProfile(account.walletAddress, formData);
    // TODO: Add logic to refresh user data state in App.jsx
};

  // FETCHING SHOTX BALANCE

  useEffect(() => {
    if (account?.walletAddress) {
      const cachedBalance = parseFloat(account.shotxBalance || '0').toFixed(2);
      setShotxBalance(cachedBalance);

      const fetchLiveBalance = async () => {
        const liveBalance = await getShotXBalance(account.walletAddress);
        setShotxBalance(parseFloat(liveBalance).toFixed(2));
      };
      
      fetchLiveBalance();
    }
  }, [account]);

  // --- UI EVENT TRIGGERS ---
  
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
      handleUpdateProfilePic(file); // Calls the internal handler
    }
  };
  
  // Called when the "Save" button for the username is clicked
  const handleUsernameSaveClick = () => {
    if (newUsername.trim() && newUsername !== account.username) {
      handleUpdateUsername(newUsername); // Calls the internal handler
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
  const hasNfts = account.ownedNFTs && account.ownedNFTs.length > 0;
  // This is now mock data as it's not passed in the account prop you provided
  const nfts = account.ownedNFTs || []; 

  const pageStyles = `
    .card-container { perspective: 1000px; }
    .card { transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1); transform-style: preserve-3d; }
    .card-container:hover .card { 
        transform: rotateX(10deg) rotateY(-8deg) scale(1.1); 
        box-shadow: 0px 25px 40px -15px rgba(0, 255, 255, 0.3);
    }
    .font-orbitron { font-family: 'Orbitron', monospace; }
    .text-glow { text-shadow: 0 0 8px rgba(0, 255, 255, 0.5); }
  `;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <div className="relative min-h-screen text-white font-sans">
      <style>{pageStyles}</style>
      <SpaceBackground />

      <main className="relative z-10 pt-28 pb-12 px-4">
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
                        <div className="relative group cursor-pointer" onClick={handleProfilePicClick}>
                            <img src={account.profilePic?.url || "../DefaultProfile.jpg"} alt="Profile" className="w-24 h-24 rounded-full border-2 border-cyan-500 object-cover transition-all duration-300 group-hover:border-cyan-300 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Pencil className="h-6 w-6 text-cyan-300" />
                            </div>
                        </div>
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
            <motion.div className="w-full p-4 md:p-6 mt-10" variants={itemVariants}>
                <h2 className="text-4xl font-bold font-orbitron text-white mb-6 text-glow">Inventory</h2>
                {hasNfts ? (
                    <motion.div 
                        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {nfts.map((nft) => <NftCard key={nft.id} nft={nft} />)}
                    </motion.div>
                ) : (
                    <div className="text-center py-16 px-6 bg-slate-900/50 backdrop-blur-lg rounded-xl border border-dashed border-cyan-500/40">
                        <EmptyInventoryIcon />
                        <h3 className="text-xl font-semibold text-white font-orbitron">Your Inventory is Nebulous</h3>
                        <p className="text-cyan-200/60 mt-2">No player skins owned. Procure some from the marketplace to begin your collection.</p>
                        <Link to="/marketplace">
                          <motion.button 
                            className="mt-6 bg-cyan-600 text-slate-900 font-bold py-2 px-6 rounded-lg"
                            whileHover={{ scale: 1.05, backgroundColor: "#00FFFF", boxShadow: "0 0 20px #00FFFF" }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Visit Marketplace
                          </motion.button>
                        </Link>
                    </div>
                )}
            </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Coins } from "lucide-react";
import axios from 'axios';
// Import the blockchain service functions we will use
import { checkAllowance, approvePurchase, buyItem, checkNftBalance, getOwnedNFTs, getShotXBalance, updateUserProfile } from '../services/blockchainService';

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

// ================= UI COMPONENTS =================
// The Purchase Button logic is now integrated directly into this card component.
const NftPurchaseCard = ({ nft }) => {
  // NEW: State management for the purchase flow
  const [buttonState, setButtonState] = useState('loading'); // loading, approve, buy, owned
  const [isLoading, setIsLoading] = useState(false);

  // NEW: A memoized function to check the user's status for this item
  const checkUserStatus = useCallback(async () => {
    if (!nft) return;
    setButtonState('loading');
    
    // 1. Check if the user already owns this NFT
    const balance = await checkNftBalance(nft.tokenId);
    if (balance > 0) {
      setButtonState('owned');
      return;
    }

    // 2. Check if the marketplace has allowance
    const hasAllowance = await checkAllowance(nft.price);
    setButtonState(hasAllowance ? 'buy' : 'approve');
  }, [nft]);

  // NEW: Run the check when the component loads
  useEffect(() => {
    checkUserStatus();
  }, [checkUserStatus]);

  // NEW: Click handler for the purchase button
  const handlePurchaseClick = async () => {
    setIsLoading(true);
    try {
      if (buttonState === 'approve') {
        const approvalSuccess = await approvePurchase(nft.price);
        if (approvalSuccess) setButtonState('buy');
      } else if (buttonState === 'buy') {
        const buySuccess = await buyItem(nft.tokenId);
        if (buySuccess) {
          setButtonState('owned');
          // After purchase, fetch on-chain state and persist to DB (ownedNFTs by ObjectId + shotxBalance)
          try {
            const provider = window.ethereum && new (await import('ethers')).ethers.BrowserProvider(window.ethereum);
            const signer = provider && await provider.getSigner();
            const userAddress = signer ? await signer.getAddress() : null;
            if (userAddress) {
              // 1) Get owned tokenIds from chain
              const tokenIdStrings = await getOwnedNFTs(userAddress); // ["1","3",...]

              // 2) Map tokenIds -> Item ObjectIds via /api/items
              const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
              const itemsResp = await axios.get(`${API_URL}/api/items`);
              const items = itemsResp.data || [];
              const mapTokenToId = new Map(items.map(it => [String(it.tokenId), String(it._id)]));
              const ownedObjectIds = tokenIdStrings.map(t => mapTokenToId.get(String(t))).filter(Boolean);

              // 3) Fetch current ShotX balance from chain
              const liveBalance = await getShotXBalance(userAddress);

              // 4) Persist both to backend via profile update (no popup due to conditional alert)
              const fd = new FormData();
              fd.append('ownedNFTs', JSON.stringify(ownedObjectIds));
              fd.append('shotxBalance', String(liveBalance));
              await updateUserProfile(userAddress, fd);
            }
          } catch (persistErr) {
            console.warn('Failed to persist purchase state to backend:', persistErr);
          }
        }
      }
    } catch (error) {
      console.error("Transaction failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // NEW: Helper to get the correct button text
  const getButtonText = () => {
    switch (buttonState) {
      case 'loading': return 'Checking...';
      case 'approve': return `Approve ${nft.price} SXC`;
      case 'buy': return `Buy for ${nft.price} SXC`;
      case 'owned': return '✅ Owned';
      default: return 'Buy';
    }
  };

  return (
    <motion.div
      className="card-container"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="card bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-cyan-500/30 flex flex-col items-center justify-between gap-4 h-full">
        <img 
          src={nft.imageUrl} 
          alt={nft.name} 
          className="w-full h-40 object-contain rounded-md" 
          onError={(e) => (e.currentTarget.src = "https://placehold.co/400x300/020617/00FFFF?text=SHOTX")}
        />
        <div className="text-center w-full">
          <h3 className="font-bold text-white truncate font-orbitron">{nft.name}</h3>
        </div>
        <div className="flex items-center justify-center gap-2 text-cyan-300 w-full bg-slate-900/50 py-2 rounded-md">
          <Coins size={18} />
          <span className="font-bold font-orbitron text-lg">
            {nft.price ? nft.price.toLocaleString() : "---"} SXC
          </span>
        </div>

        {/* This button is now dynamic and fully functional */}
        <motion.button 
          className={`w-full text-slate-900 font-bold py-2 rounded-lg purchase-button ${buttonState}`} // Dynamic classes for styling
          whileHover={{ scale: 1.05, filter: "brightness(1.2)", boxShadow: "0 0 20px #00FFFF" }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePurchaseClick}
          disabled={isLoading || buttonState === 'loading' || buttonState === 'owned'}
        >
          {isLoading ? 'Processing...' : getButtonText()}
        </motion.button>
      </div>
    </motion.div>
  );
};


// ================= MAIN MARKETPLACE PAGE COMPONENT =================
// This component remains mostly unchanged.
export default function MarketplacePage() {
  const [nfts, setNfts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      try {
        const response = await axios.get(`${API_URL}/api/items`);
        setNfts(response.data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching marketplace items:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, []);

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
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-center text-xl text-cyan-300 animate-pulse">Loading cosmic assets...</p>;
    }
    if (error) {
      return <p className="text-center text-xl text-red-400">Error: Could not load marketplace. {error}</p>;
    }
    if (nfts.length === 0) {
      return <p className="text-center text-xl text-cyan-200/70">The marketplace is currently empty. New items are being forged!</p>;
    }
    return (
      <motion.div 
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
        variants={containerVariants}
      >
        {nfts.map((nft) => <NftPurchaseCard key={nft.tokenId || nft._id} nft={nft} />)}
      </motion.div>
    );
  };

  return (
    <div className="relative min-h-screen text-white font-sans">
      <style>{pageStyles}</style>
      <SpaceBackground />

      <main className="relative z-10 pt-32 pb-12 px-4">
        <motion.div
            className="w-full max-w-6xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
          <motion.div className="text-center mb-12" variants={itemVariants}>
            <h1 className="text-5xl font-bold font-orbitron text-white text-glow">Marketplace</h1>
            <p className="text-cyan-200/70 mt-2">Acquire exclusive player skins with your ShotX coins.</p>
          </motion.div>
          {renderContent()}
        </motion.div>
      </main>
    </div>
  );
}
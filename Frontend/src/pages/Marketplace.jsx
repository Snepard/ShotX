import React from 'react';
import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Coins } from "lucide-react"; // For the price icon

// ================= BACKGROUND COMPONENT =================
// This is the exact same background component from your other pages.
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

// ================= MOCK DATA =================
const mockMarketplaceNfts = [
  { id: 1, name: "Cosmic Ranger", imageUrl: "/nfts/skin1.png", price: 1250 },
  { id: 2, name: "Void Hunter", imageUrl: "/nfts/skin2.png", price: 1500 },
  { id: 3, name: "Neon Samurai", imageUrl: "/nfts/skin3.png", price: 2000 },
  { id: 4, name: "Solar Paladin", imageUrl: "/nfts/skin4.png", price: 1800 },
  { id: 5, name: "Galactic Glider", imageUrl: "/nfts/skin5.png", price: 1350 },
  { id: 6, name: "Cyber Ronin", imageUrl: "/nfts/skin6.png", price: 2500 },
  { id: 7, name: "Starfire Sentinel", imageUrl: "/nfts/skin7.png", price: 2200 },
  { id: 8, name: "Nebula Nomad", imageUrl: "/nfts/skin8.png", price: 1650 },
];

// ================= UI COMPONENTS =================
const NftPurchaseCard = ({ nft }) => (
  <motion.div
    className="card-container"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="card bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-cyan-500/30 flex flex-col items-center justify-between gap-4 h-full">
      <img src={nft.imageUrl} alt={nft.name} className="w-full h-40 object-contain rounded-md" />
      <div className="text-center w-full">
        <h3 className="font-bold text-white truncate font-orbitron">{nft.name}</h3>
      </div>
      <div className="flex items-center justify-center gap-2 text-cyan-300 w-full bg-slate-900/50 py-2 rounded-md">
        <Coins size={18} />
        <span className="font-bold font-orbitron text-lg">{nft.price.toLocaleString()}</span>
      </div>
      <motion.button 
        className="w-full bg-cyan-600 text-slate-900 font-bold py-2 rounded-lg"
        whileHover={{ scale: 1.05, backgroundColor: "#00FFFF", boxShadow: "0 0 20px #00FFFF" }}
        whileTap={{ scale: 0.95 }}
      >
        Purchase
      </motion.button>
    </div>
  </motion.div>
);

// ================= MAIN MARKETPLACE PAGE COMPONENT =================
export default function MarketplacePage() {
  const [nfts] = useState(mockMarketplaceNfts); 

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
            {/* Page Header */}
            <motion.div className="text-center mb-12" variants={itemVariants}>
                <h1 className="text-5xl font-bold font-orbitron text-white text-glow">Marketplace</h1>
                <p className="text-cyan-200/70 mt-2">Acquire exclusive player skins with your ShotX coins.</p>
            </motion.div>

            {/* NFT Grid */}
            <motion.div 
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                variants={containerVariants}
            >
                {nfts.map((nft) => <NftPurchaseCard key={nft.id} nft={nft} />)}
            </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
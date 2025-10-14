import React, { useState, useRef, useEffect } from "react";
import { Pencil, LogOut } from "lucide-react"; // npm install lucide-react

// ================= BACKGROUND COMPONENT =================
// This is the exact same background component from your homepage.
const SpaceBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const SHOOTER_COUNT = 150;
    const NEBULA_COUNT = 8;
    const PALETTE = ["#FF69B4", "#9370DB", "#4169E1", "#8A2BE2"]; // A slightly more vibrant palette

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
        this.radius = random(150, 700);
        const alphaHex = Math.floor(random(5, 25)).toString(16).padStart(2, "0");
        this.color1 = PALETTE[Math.floor(random(0, PALETTE.length))] + alphaHex;
        this.color2 = PALETTE[Math.floor(random(0, PALETTE.length))] + "00";
        this.speedX = random(-0.5, 0.5) * 0.1;
        this.speedY = random(-0.5, 0.5) * 0.1;
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
        this.opacity = random(0.2, 0.9);
        this.radius = this.opacity * 1.5;
        const speed = random(1, 4) * this.opacity;
        this.color = PALETTE[Math.floor(random(0, PALETTE.length))];
        const startSide = Math.floor(random(0, 3));
        if (startSide === 0) { // Top
          this.x = random(0, canvas.width); this.y = -this.radius;
          this.vx = random(-1, 1) * speed * 0.5; this.vy = speed;
        } else if (startSide === 1) { // Left
          this.x = -this.radius; this.y = random(0, canvas.height);
          this.vx = speed; this.vy = random(-0.5, 0.5) * speed * 0.5;
        } else { // Right
          this.x = canvas.width + this.radius; this.y = random(0, canvas.height);
          this.vx = -speed; this.vy = random(-0.5, 0.5) * speed * 0.5;
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

    const nebulas = Array.from({ length: NEBULA_COUNT }, () => new Nebula());
    const shooters = Array.from({ length: SHOOTER_COUNT }, () => new Shooter());

    const animate = () => {
      ctx.fillStyle = "#000000"; // Black background for the canvas
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

  const canvasStyles = {
    position: "fixed",
    top: 0, left: 0,
    width: "100%", height: "100%",
    zIndex: -1,
    pointerEvents: "none",
  };

  return <canvas ref={canvasRef} style={canvasStyles}></canvas>;
};

// --- Mock Data ---
const mockUserData = {
  username: "Yaroslav Isakov",
  walletAddress: "0x1A2b3c4d5E6f7g8H9i0Jk1L2m3N4o5P6q7R8s9T0",
  shotxBalance: 1560.21,
  highestScore: 98500,
};
const mockNfts = [
  { id: 1, name: "Cosmic Ranger", imageUrl: "/nfts/skin1.png" },
  { id: 2, name: "Void Hunter", imageUrl: "/nfts/skin2.png" },
  { id: 3, name: "Neon Samurai", imageUrl: "/nfts/skin3.png" },
  { id: 4, name: "Solar Paladin", imageUrl: "/nfts/skin4.png" },
];
// --- End Mock Data ---

const StatBox = ({ title, value, icon }) => (
  <div className="bg-gray-800/50 p-4 rounded-lg flex flex-col items-center justify-center gap-2 text-center w-40 h-full backdrop-blur-sm">
    {icon}
    <span className="text-2xl font-bold text-white font-orbitron">{value}</span>
    <span className="text-sm text-gray-400">{title}</span>
  </div>
);

const NftCard = ({ nft }) => (
  <div className="card-container">
    <div className="card bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 flex flex-col items-center justify-between gap-4">
      <img src={nft.imageUrl} alt={nft.name} className="w-full h-40 object-contain rounded-md" />
      <div className="text-center w-full">
        <h3 className="font-bold text-white truncate font-orbitron">{nft.name}</h3>
      </div>
      <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition-colors">Equip</button>
    </div>
  </div>
);

// ================= MAIN PROFILE PAGE COMPONENT =================
export default function ProfilePage() {
  const [userData] = useState(mockUserData);
  const [nfts] = useState(mockNfts); // To test empty state, change to []

  const truncatedAddress = userData.walletAddress
    ? `${userData.walletAddress.substring(0, 6)}...${userData.walletAddress.substring(userData.walletAddress.length - 4)}`
    : "";
  const hasNfts = nfts && nfts.length > 0;

  const pageStyles = `
    .card-container { perspective: 1000px; }
    .card { transition: all 0.4s ease-out; transform-style: preserve-3d; }
    .card-container:hover .card { transform: rotateX(8deg) rotateY(-6deg) scale(1.08); box-shadow: 0px 20px 35px -10px rgba(138, 43, 226, 0.5); }
    .font-orbitron { font-family: 'Orbitron', monospace; }
  `;

  return (
    <div className="relative min-h-screen text-white font-sans">
      <style>{pageStyles}</style>
      <SpaceBackground /> {/* <-- ADDED HOMEPAGE BACKGROUND */}

      <main className="relative z-10 pt-28 pb-12 px-4">
        {/* Profile Header */}
        <div className="w-full max-w-6xl mx-auto p-4 md:p-6 bg-gray-900/40 backdrop-blur-lg rounded-xl border border-gray-700/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer">
              <img src="/default-user.png" alt="Profile" className="w-24 h-24 rounded-full border-2 border-purple-500 object-cover" />
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-white">Upload</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">{userData.username}</h1>
                <button className="text-gray-400 hover:text-purple-400">
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-gray-500 font-mono">{truncatedAddress}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 h-24">
            <StatBox title="ShotX Balance" value={`$ ${userData.shotxBalance.toLocaleString()}`} />
            <StatBox title="Highest Score" value={userData.highestScore.toLocaleString()} />
            <button className="bg-red-600/80 hover:bg-red-600 text-white h-full px-4 rounded-lg flex flex-col items-center justify-center w-40">
              <LogOut size={24} />
              <span className="mt-2 text-sm">Disconnect</span>
            </button>
          </div>
        </div>

        {/* Inventory Section */}
        <div className="w-full max-w-6xl mx-auto p-4 md:p-6 mt-8">
          <h2 className="text-3xl font-bold font-orbitron text-white mb-6">Inventory</h2>
          {hasNfts ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {nfts.map((nft) => <NftCard key={nft.id} nft={nft} />)}
            </div>
          ) : (
            <div className="text-center py-16 px-6 bg-gray-900/40 backdrop-blur-lg rounded-xl border border-dashed border-gray-700">
              <h3 className="text-xl font-semibold text-white">Your inventory is empty!</h3>
              <p className="text-gray-400 mt-2">No NFTs owned. Purchase from the marketplace to get started.</p>
              <button className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg">
                Visit Marketplace
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
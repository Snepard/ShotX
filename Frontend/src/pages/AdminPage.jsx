import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Get the API URL from your environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Minimal background effects copied from Homepage
const SpaceBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const SHOOTER_COUNT = 150;
    const NEBULA_COUNT = 8;
    const PALETTE = ['#FF69B4', '#9370DB', '#4169E1', '#8A2BE2'];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const random = (min, max) => Math.random() * (max - min) + min;

    class Nebula {
      constructor() {
        this.x = random(0, canvas.width);
        this.y = random(0, canvas.height);
        this.radius = random(150, 700);
        const alphaHex = Math.floor(random(5, 25)).toString(16).padStart(2, '0');
        this.color1 = PALETTE[Math.floor(random(0, PALETTE.length))] + alphaHex;
        this.color2 = PALETTE[Math.floor(random(0, PALETTE.length))] + '00';
        this.speedX = random(-0.5, 0.5) * 0.1;
        this.speedY = random(-0.5, 0.5) * 0.1;
      }
      draw() {
        const gradient = ctx.createRadialGradient(
          this.x,
          this.y,
          this.radius * 0.1,
          this.x,
          this.y,
          this.radius
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
        if (startSide === 0) {
          // Top
          this.x = random(0, canvas.width);
          this.y = -this.radius;
          this.vx = random(-1, 1) * speed * 0.5;
          this.vy = speed;
        } else if (startSide === 1) {
          // Left
          this.x = -this.radius;
          this.y = random(0, canvas.height);
          this.vx = speed;
          this.vy = random(-0.5, 0.5) * speed * 0.5;
        } else {
          // Right
          this.x = canvas.width + this.radius;
          this.y = random(0, canvas.height);
          this.vx = -speed;
          this.vy = random(-0.5, 0.5) * speed * 0.5;
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
        if (
          this.x < -this.radius ||
          this.x > canvas.width + this.radius ||
          this.y > canvas.height + this.radius ||
          this.y < -this.radius
        ) {
          this.reset();
        }
      }
    }

    const nebulas = Array.from({ length: NEBULA_COUNT }, () => new Nebula());
    const shooters = Array.from({ length: SHOOTER_COUNT }, () => new Shooter());

    const animate = () => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      nebulas.forEach((nebula) => {
        nebula.update();
        nebula.draw();
      });
      shooters.forEach((shooter) => {
        shooter.update();
        shooter.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const canvasStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
    pointerEvents: 'none',
  };

  return <canvas ref={canvasRef} style={canvasStyles}></canvas>;
};

const SpotlightEffect = () => {
  useEffect(() => {
    const spotlight = document.getElementById('spotlight');
    if (!spotlight) return;

    const onMouseMove = (e) => {
      spotlight.style.setProperty('--x', `${e.clientX}px`);
      spotlight.style.setProperty('--y', `${e.clientY}px`);
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  return <div id="spotlight"></div>;
};

export default function AdminPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [supply, setSupply] = useState(1);
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    // We must use FormData because we are uploading a file
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('supply', supply);
    formData.append('price', price);
    formData.append('image', image);

    try {
      // Send the request to your backend's admin route
      const response = await axios.post(`${API_URL}/api/admin/items/mint`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true // Good practice for admin routes
      });

      console.log(response.data);
      setMessage(`Success! Minted item '${response.data.item.name}' with Token ID: ${response.data.item.tokenId}`);
      
      // Clear the form on success
      setName('');
      setDescription('');
      setSupply(1);
      setPrice(0);
      setImage(null);
      e.target.reset(); // Resets the file input
      
    } catch (error) {
      console.error("Error minting item:", error);
      const errorMsg = error.response?.data?.message || 'An error occurred during minting.';
      setMessage(`Error: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Minimal CSS needed for the spotlight effect */}
      <style>{`
        :root{ --accent-cyan: 6,182,212; }
        #spotlight {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          pointer-events: none;
          z-index: 0;
          background: radial-gradient(
            circle at var(--x) var(--y),
            rgba(var(--accent-cyan), 0.2),
            transparent 25vmax
          );
          transition: background 0.1s linear;
        }
      `}</style>
      <SpotlightEffect />
      <SpaceBackground />
      <div className="min-h-screen flex items-center justify-center text-white p-4 font-sans relative" style={{ zIndex: 1 }}>
        <div className="w-full max-w-lg bg-slate-800/60 backdrop-blur-sm p-8 rounded-xl border border-cyan-500/30 shadow-lg">
        <h1 className="text-3xl font-bold font-orbitron text-center mb-6 text-cyan-300 text-glow">
          Admin Minting Panel
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-cyan-200/70">
              Item Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm p-3 text-white focus:ring-cyan-500 focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-cyan-200/70">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm p-3 text-white focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          <div>
            <label htmlFor="supply" className="block text-sm font-medium text-cyan-200/70">
              Supply (use 1 for a unique NFT)
            </label>
            <input
              id="supply"
              type="number"
              value={supply}
              onChange={(e) => setSupply(e.target.value)}
              className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm p-3 text-white focus:ring-cyan-500 focus:border-cyan-500"
              required
              min="1"
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-cyan-200/70">
              Price (in SXC)
            </label>
            <input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm p-3 text-white focus:ring-cyan-500 focus:border-cyan-500"
              required
              min="0"
            />
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-cyan-200/70">
              Item Image
            </label>
            <input
              id="image"
              type="file"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-slate-400
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-full file:border-0
                         file:text-sm file:font-semibold
                         file:bg-cyan-600 file:text-black
                         hover:file:bg-cyan-500 cursor-pointer"
              accept="image/png, image/jpeg"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-black font-bold rounded-lg transition-all duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Minting...' : 'Mint New Item'}
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-center ${message.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
            {message}
          </p>
        )}
      </div>
      </div>
    </>
  );
}
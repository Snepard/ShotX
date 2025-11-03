import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import {
  Users,
  Zap,
  Swords,
  ShieldCheck,
  Coins,
  Diamond,
  Sparkles,
  Play,
  TrendingUp,
  Award,
  Store,
  ArrowRight,
  Copy,
  Check,
} from "lucide-react";
// Import GSAP for advanced animations
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link, useOutletContext } from "react-router-dom";
import {
  fetchUserProfile,
  convertScoreToCoins,
} from "../services/blockchainService";

/* ========== Styles ========== */
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;500;600;700&display=swap');

:root{
  --accent-cyan: 6,182,212;
  --accent-blue: 59,130,246;
  --accent-purple: 139,92,246;
  --bg-light: #0A0F1A;
}

/* ===== Base & Typography ===== */
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{
    margin:0;
    background:#000000;
    color:#E0E0E0;
    font-family:'Inter', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
}
.font-orbitron{font-family:'Orbitron', monospace}

/* ===== Layout & Helpers ===== */
.container{max-width:1280px; margin-left:auto; margin-right:auto; padding-left:24px; padding-right:24px}
.section-padding{padding-top:100px; padding-bottom:100px}
@media (max-width:768px){ .section-padding{padding-top:60px; padding-bottom:60px} }

/* ===== Advanced Components & Effects ===== */

/* --- Glass Card --- */
.glass-card{
  background:rgba(12,18,28,.5);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border:1px solid rgba(255,255,255,.04);
  transition: all .3s ease;
}
.glass-card:hover{
    background:rgba(12,18,28,.7);
    border:1px solid rgba(var(--accent-cyan), .1);
}

/* --- Hologram Text --- */
.hologram-text{
  background: linear-gradient(90deg, rgba(var(--accent-cyan),1), rgba(var(--accent-blue),1), rgba(var(--accent-purple),1));
  background-size:200% 200%;
  -webkit-background-clip:text;
  background-clip:text;
  -webkit-text-fill-color:transparent;
  animation: holoShift 6s ease-in-out infinite;
}
@keyframes holoShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }

/* --- Buttons --- */
.btn{
    padding:12px 24px;
    border-radius:999px;
    font-weight:600;
    display:inline-flex;
    align-items:center;
    gap:8px;
    transition: all .25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    border: 1px solid transparent;
    cursor:pointer;
}
.btn-primary{
  background:linear-gradient(135deg, rgba(var(--accent-cyan),1), rgba(var(--accent-blue),1));
  box-shadow:0 10px 30px rgba(var(--accent-cyan),.15);
  color:white;
}
.btn-primary:hover{transform:translateY(-3px) scale(1.02); box-shadow:0 12px 35px rgba(var(--accent-cyan),.25);}
.btn-primary:active{transform:translateY(-1px) scale(0.98); box-shadow:0 8px 30px rgba(var(--accent-cyan),.2);}
.btn-secondary{ background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08); color:white; }
.btn-secondary:hover{ background:rgba(255,255,255,.1); border-color:rgba(255,255,255,.15); }

/* --- (NEW) Scroll-triggered Animations --- */
.animate-on-scroll {
  opacity: 0;
  transition: opacity 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.animate-on-scroll.is-visible {
  opacity: 1;
  transform: none;
}
.fade-in-up { transform: translateY(40px); }
.fade-in-down { transform: translateY(-40px); }
.fade-in-left { transform: translateX(-40px); }
.fade-in-right { transform: translateX(40px); }
.zoom-in { transform: scale(0.9); }


/* --- 3D Interactive Card Base --- */
.interactive-3d {
    perspective: 1000px;
    transform-style: preserve-3d;
    transition: transform 0.4s ease-out;
    will-change: transform;
}
.interactive-3d-content {
    transition: transform 0.4s ease-out, box-shadow 0.4s ease-out;
    will-change: transform, box-shadow;
}


/* --- (UPGRADED) 3D NFT Card --- */
.nft-card-inner {
    border-radius: inherit;
    overflow: hidden;
    position: relative;
    background: #101623;
    width: 100%;
    height: 100%;
}
.interactive-3d:hover .nft-card-inner{
    box-shadow: 0 0 15px rgba(var(--accent-cyan), .2), 0 0 60px rgba(var(--accent-cyan), .15);
}
.nft-card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: inherit;
    transition: transform .6s ease;
}
.interactive-3d:hover img {
    transform: scale(1.05) translateZ(20px);
}

/* --- (NEW) Set Aspect Ratio for NFT Cards --- */
.nft-card-container {
    aspect-ratio: 4 / 5; /* Makes the card shorter. You can adjust this (e.g., 3/4) */
    width: 100%;
}

/* --- (NEW) Rhomboid 3D NFT Card --- */
.nft-card {
  position: relative;
  z-index: 1;
  transform: skewX(-10deg); /* Skews the card into a rhomboid */
  transition: transform 0.4s ease;
  border-radius: 12px;
  overflow: hidden;
}

.nft-card-peaking-edge {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05); /* The whitish peaking layer */
  transform: skewX(-10deg) translateX(-10px) translateY(10px); /* Position it slightly offset */
  z-index: 0;
  transition: transform 0.4s ease, background 0.4s ease;
  backdrop-filter: blur(2px);
}

/* Make the image inside conform to the new shape */
.nft-card img {
  transform: skewX(10deg) scale(1.1); /* Counter-skew the image to straighten it */
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .6s ease;
}

/* Enhance the 3D effect and interactions on hover */
.interactive-3d:hover .nft-card {
  box-shadow: 0 25px 40px rgba(0,0,0,0.3);
}

.interactive-3d:hover .nft-card-peaking-edge {
  transform: skewX(-10deg) translateX(-20px) translateY(20px);
  background: rgba(255, 255, 255, 0.1);
}

.interactive-3d:hover .nft-card img {
  transform: skewX(10deg) scale(1.2);
}

/* --- (UPGRADED) Bento Grid Layout --- */
.bento-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-auto-rows: minmax(150px, auto);
    gap: 1.5rem;
}
.bento-card {
    border-radius: 20px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
    /* The transition is handled by the :hover state to avoid conflicts */
    transition: box-shadow 0.3s ease;
}
.bento-card:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    /* Add the transform transition here */
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.bento-card .bento-icon-wrapper {
    transition: transform 0.3s ease;
}
.bento-card:hover .bento-icon-wrapper {
    transform: translateY(-4px);
}
.bento-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    border-radius: 20px;
    border: 1px solid transparent;
    background: linear-gradient(135deg, rgba(var(--accent-cyan), .1), rgba(var(--accent-purple), .1)) border-box;
    -webkit-mask:
        linear-gradient(#fff 0 0) padding-box,
        linear-gradient(#fff 0 0);
    -webkit-mask-composite: destination-out;
    mask-composite: exclude;
    transition: all .3s ease;
    opacity: 0;
    pointer-events: none;
}
.bento-card:hover::before { opacity: 1; }
.col-span-1 { grid-column: span 1; }
.col-span-2 { grid-column: span 2; }
.col-span-3 { grid-column: span 3; }
.col-span-4 { grid-column: span 4; }
.col-span-6 { grid-column: span 6; }
.row-span-1 { grid-row: span 1; }
.row-span-2 { grid-row: span 2; }

@media (max-width: 1024px) {
    .bento-grid { grid-template-columns: repeat(4, 1fr); }
    .col-span-1, .col-span-2, .col-span-3, .col-span-4 { grid-column: span 2; }
    .bento-grid .col-span-4:nth-child(1) { grid-column: span 4; }
}
@media (max-width: 640px) {
    .bento-grid { grid-template-columns: 1fr; }
    .col-span-1, .col-span-2, .col-span-3, .col-span-4, .col-span-6,
    .row-span-1, .row-span-2 { grid-column: span 1; grid-row: span 1; }
}

/* --- (NEW) Leaderboard Section --- */
.leaderboard-section {
  background: rgba(12, 18, 28, .3);
  border-top: 1px solid rgba(255, 255, 255, .05);
  border-bottom: 1px solid rgba(255, 255, 255, .05);
  padding-top: 100px;
  padding-bottom: 100px;
}
.leaderboard-top-3 {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 3rem;
  align-items: flex-end;
  flex-wrap: wrap;
}
.leaderboard-player-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  width: 200px;
  text-align: center;
  position: relative;
  transition: transform 0.3s ease;
}
.leaderboard-player-card.rank-1 {
  transform: scale(1.15) translateY(-10px);
}
.leaderboard-player-card.rank-2 {
  order: -1;
}
.leaderboard-player-card .avatar-wrapper {
  position: relative;
  margin-bottom: 12px;
}
.leaderboard-player-card .avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 4px solid rgba(255,255,255,0.1);
  background-color: #101623;
  object-fit: cover;
}
.rank-1 .avatar { border-color: #FFD700; }
.rank-2 .avatar { border-color: #C0C0C0; }
.rank-3 .avatar { border-color: #CD7F32; }
.leaderboard-player-card .rank-badge {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  color: #FFD700;
  filter: drop-shadow(0 0 10px #FFD700);
}
.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 900px;
  margin: 0 auto;
}
.leaderboard-row {
  display: grid;
  grid-template-columns: 50px minmax(0, 1fr) auto auto;
  gap: 16px;
  align-items: center;
  padding: 12px 20px;
  background: rgba(0,0,0,0.2);
  border-radius: 8px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}
.leaderboard-row:hover {
  background: rgba(var(--accent-cyan), 0.05);
  border-color: rgba(var(--accent-cyan), 0.2);
  transform: scale(1.02);
}
.leaderboard-row .rank {
  font-family: 'Orbitron', monospace;
  font-size: 1.1rem;
  color: #A0AEC0;
}
.leaderboard-row .player-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.leaderboard-row .player-info img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}
.leaderboard-row .player-info span { font-weight: 600; }
.leaderboard-row .stat {
  width: 120px;
  text-align: right;
  font-family: 'Orbitron', monospace;
}
.leaderboard-row .stat-label {
  display: block;
  font-size: 0.75rem;
  color: #A0AEC0;
  font-family: 'Inter', sans-serif;
  margin-bottom: 4px;
}

@media (max-width: 768px) {
  .leaderboard-top-3 {
    gap: 2.5rem;
  }
  .leaderboard-player-card.rank-1,
  .leaderboard-player-card.rank-2 {
    transform: none;
    order: 0;
  }
  .leaderboard-row {
    grid-template-columns: 40px 1fr;
    grid-template-rows: auto auto;
    gap: 4px 16px;
  }
  .leaderboard-row .rank {
    grid-row: 1 / 3;
    display: flex;
    align-items: center;
  }
  .leaderboard-row .player-info {
    grid-column: 2;
    grid-row: 1;
  }
  .leaderboard-row .stat {
    grid-column: 2;
    grid-row: 2;
    width: auto;
    text-align: left;
    display: inline-block;
  }
  .leaderboard-row .stat:nth-of-type(2) {
    margin-left: 24px;
  }
}

/* --- Floating Glass Shapes --- */
.floating-shape-container {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
}
.floating-shape {
    position: absolute;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 20%;
    backdrop-filter: blur(8px) brightness(1.1);
    -webkit-backdrop-filter: blur(8px) brightness(1.1);
    transform-style: preserve-3d;
}
.shape-1 {
    width: 100px; height: 100px;
    top: 15%; left: 10%;
    animation: float 15s ease-in-out infinite;
    transform: rotate3d(1, 1, 0, 45deg);
}
.shape-2 {
    width: 150px; height: 150px;
    top: 30%; right: 8%;
    animation: float 18s ease-in-out infinite reverse;
    border-radius: 50%;
}
.shape-3 {
    width: 80px; height: 80px;
    bottom: 10%; left: 25%;
    animation: float 12s ease-in-out infinite;
    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
    border-radius: 0;
}
@keyframes float {
    0% { transform: translateY(0px) rotate3d(1, 1, 0, 45deg); }
    50% { transform: translateY(-30px) translateX(10px) rotate3d(1, 0.5, 0, 60deg); }
    100% { transform: translateY(0px) rotate3d(1, 1, 0, 45deg); }
}
.shape-2 { animation-name: float-sphere; }
@keyframes float-sphere {
    0% { transform: translateY(0px) scale(1); }
    50% { transform: translateY(20px) scale(1.05); }
    100% { transform: translateY(0px) scale(1); }
}
.shape-3 { animation-name: float-pyramid; }
@keyframes float-pyramid {
    0% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(15deg); }
    100% { transform: translateY(0px) rotate(0deg); }
}

/* --- Hero Stat Pods --- */
.stat-pods-container {
    position: absolute;
    top: 50%; left: 50%;
    width: 100%; height: 100%;
    transform: translate(-50%, -50%);
    pointer-events: none;
}
.stat-pod {
    position: absolute;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 12px;
    animation: fadeInRise 1s ease-out forwards;
    opacity: 0;
}
@keyframes fadeInRise {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
.stat-pod-1 { top: 0; left: 15%; animation-delay: 0.5s; }
.stat-pod-2 { top: 30%; right: 5%; animation-delay: 0.7s; }
.stat-pod-3 { bottom: 5%; left: 40%; animation-delay: 0.9s; }

/* --- Floating 3D Coins --- */
.floating-coin-container {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  overflow: hidden;
  z-index: 1;
  pointer-events: none;
}
.coin-floater {
  position: absolute;
  left: 50%; top: 50%;
  width: var(--size);
  height: var(--size);
  pointer-events: auto;
  cursor: pointer;
  animation: floatPath var(--float-duration) ease-in-out infinite;
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  will-change: transform;
}
.coin-floater:hover {
  animation-play-state: paused;
  transform: scale(1.5);
  z-index: 10;
}
.floating-coin {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #f9d77e, #e9a22f, #f9d77e);
  box-shadow: inset 0 0 calc(var(--size) / 10) rgba(255,255,255,.7),
              inset 0 0 calc(var(--size) / 6) rgba(0,0,0,.4),
              0 0 calc(var(--size) / 2) rgba(255, 215, 0, 0.4);
  transform-style: preserve-3d;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a46c00;
  font-family: 'Orbitron', monospace;
  font-size: calc(var(--size) * 0.55);
  font-weight: 900;
  text-shadow: 1px 1px 0px rgba(0,0,0,0.2);
  animation: rotateCoin var(--rotation-speed) linear infinite;
  will-change: transform;
}
@keyframes rotateCoin {
  from { transform: rotateY(0deg) rotateX(20deg); }
  to { transform: rotateY(360deg) rotateX(20deg); }
}
@keyframes floatPath {
  0% {
    transform: translate(-50%, -50%) rotate(0deg) translateX(var(--orbit)) translateY(calc(var(--orbit) * 0.1)) rotate(0deg);
  }
  25% {
    transform: translate(-50%, -50%) rotate(90deg) translateX(calc(var(--orbit) * 0.9)) translateY(0) rotate(-90deg);
  }
  50% {
    transform: translate(-50%, -50%) rotate(180deg) translateX(var(--orbit)) translateY(calc(var(--orbit) * -0.1)) rotate(-180deg);
  }
  75% {
    transform: translate(-50%, -50%) rotate(270deg) translateX(calc(var(--orbit) * 1.1)) translateY(0) rotate(-270deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg) translateX(var(--orbit)) translateY(calc(var(--orbit) * 0.1)) rotate(-360deg);
  }
}
@media (max-width: 900px) {
    .floating-shape, .stat-pod, .floating-coin-container { display: none; }
}

/* --- Spotlight Effect --- */
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

/* --- (NEW) Player Stats Card --- */
.player-stats-card {
  background: rgba(12, 18, 28, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--accent-cyan), 0.3);
  box-shadow: 
    0 0 25px rgba(var(--accent-cyan), 0.2), 
    inset 0 0 8px rgba(var(--accent-cyan), 0.2);
  border-radius: 20px;
  padding: 24px;
  max-width: 850px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  animation: fadeInSlideUp 0.8s 0.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
}
.player-stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0 35px rgba(var(--accent-cyan), 0.3), inset 0 0 10px rgba(var(--accent-cyan), 0.3);
}
@keyframes fadeInSlideUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.stat-item {
  text-align: center;
  flex-shrink: 0;
}
.stat-label {
  font-size: 12px;
  color: #A0AEC0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.stat-value {
  font-family: 'Orbitron', monospace;
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  font-weight: 700;
  line-height: 1.2;
  color: white;
  filter: drop-shadow(0 0 5px rgba(var(--accent-cyan), 0.5));
}
.stat-arrow {
  color: rgba(var(--accent-cyan), 0.5);
  transition: all 0.3s ease;
}
.player-stats-card:hover .stat-arrow {
  transform: scale(1.2);
  color: rgba(var(--accent-cyan), 1);
}
.convert-btn {
  /* Inherits from .btn and .btn-primary */
  padding: 12px 20px;
  flex-shrink: 0;
}
.convert-btn:disabled {
  background: rgba(255,255,255,.1);
  color: #A0AEC0;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}
@media (max-width: 640px) {
  .player-stats-card {
    flex-direction: column;
    padding: 20px;
  }
  .stat-arrow {
    transform: rotate(90deg);
  }
}
`;

// ================= HOOKS & HELPERS =================

/**
 * (NEW) useIntersectionObserver Hook
 * A more generic hook for scroll animations.
 */
const useIntersectionObserver = (ref, options) => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);
  return isVisible;
};

/**
 * (NEW) AnimatedOnScroll Component
 * A wrapper component to apply animations when an element enters the viewport.
 */
const AnimatedOnScroll = ({
  children,
  animation = "fade-in-up",
  delay = 0,
  threshold = 0.1,
  style,
  className = "",
}) => {
  const ref = useRef(null);
  const isVisible = useIntersectionObserver(ref, { threshold });
  const classes = `animate-on-scroll ${animation} ${
    isVisible ? "is-visible" : ""
  } ${className}`;

  return (
    <div
      ref={ref}
      className={classes}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
};

const AnimatedCounter = ({ value }) => {
  const [count, setCount] = useState(0);
  const prevValueRef = useRef(0);

  useEffect(() => {
    const start = prevValueRef.current; // Animate FROM the previous value
    const end = isNaN(value) ? 0 : Number(value);

    if (start === end) {
      setCount(end);
      return;
    }

    const duration = 1500; // Animation duration in milliseconds
    const startTime = Date.now();

    const animateCount = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);

      // Ease-out quint function for a smooth slow-down effect
      const easedProgress = 1 - Math.pow(1 - progress, 5);

      const currentCount = Math.round(start + (end - start) * easedProgress);
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      } else {
        setCount(end); // Ensure final value is exact
      }
    };

    requestAnimationFrame(animateCount);

    // Update the ref for the next time the value changes
    prevValueRef.current = end;
  }, [value]);

  return <span>{count.toLocaleString()}</span>;
};

const use3DHover = (ref, { maxRotate = 10, scale = 1.05 } = {}) => {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotateY = (x / (rect.width / 2)) * maxRotate;
      const rotateX = (-y / (rect.height / 2)) * maxRotate;
      el.style.transform = `scale(${scale}) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
    };

    const onMouseLeave = () => {
      el.style.transform = `scale(1) rotateY(0deg) rotateX(0deg)`;
    };

    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseleave", onMouseLeave);

    return () => {
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [ref, maxRotate, scale]);
};

// ================= BACKGROUND COMPONENT =================

const SpaceBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const SHOOTER_COUNT = 150;
    const NEBULA_COUNT = 8;
    const PALETTE = ["#FF69B4", "#9370DB", "#4169E1", "#8A2BE2"];

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
        const alphaHex = Math.floor(random(5, 25))
          .toString(16)
          .padStart(2, "0");
        this.color1 = PALETTE[Math.floor(random(0, PALETTE.length))] + alphaHex;
        this.color2 = PALETTE[Math.floor(random(0, PALETTE.length))] + "00";
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
      ctx.fillStyle = "#000000";
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
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const canvasStyles = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: -1,
    pointerEvents: "none",
  };

  return <canvas ref={canvasRef} style={canvasStyles}></canvas>;
};

// ================= COMPONENTS =================

const SpotlightEffect = () => {
  useEffect(() => {
    const spotlight = document.getElementById("spotlight");
    if (!spotlight) return;

    const onMouseMove = (e) => {
      spotlight.style.setProperty("--x", `${e.clientX}px`);
      spotlight.style.setProperty("--y", `${e.clientY}px`);
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  return <div id="spotlight"></div>;
};

const FloatingCoins = ({ count = 12 }) => {
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    const newCoins = Array.from({ length: count }).map((_, i) => ({
      id: i,
      size: Math.random() * (50 - 20) + 30,
      orbit: Math.random() * (50 - 25) + 40,
      floatDuration: Math.random() * 10 + 15,
      rotationSpeed: Math.random() * 6 + 4,
      animationDelay: `${(Math.random() * -20).toFixed(2)}s`,
    }));
    setCoins(newCoins);
  }, [count]);

  return (
    <div className="floating-coin-container">
      {coins.map((coin) => (
        <div
          key={coin.id}
          className="coin-floater"
          style={{
            "--size": `${coin.size}px`,
            "--orbit": `${coin.orbit}vmin`,
            "--float-duration": `${coin.floatDuration}s`,
            animationDelay: coin.animationDelay,
          }}
        >
          <div
            className="floating-coin"
            style={{ "--rotation-speed": `${coin.rotationSpeed}s` }}
          >
            S
          </div>
        </div>
      ))}
    </div>
  );
};

const NFTCard = ({ name, rarity, img, price }) => {
  const cardRef = useRef(null);
  // Further increased scale to 1.15 and maxRotate to 15 for a very strong 3D pop.
  use3DHover(cardRef, { maxRotate: 15, scale: 1.15 });

  return (
    // The ref is now attached to the main container
    <div
      ref={cardRef}
      className="interactive-3d"
      style={{ zIndex: 1, position: "relative" }}
    >
      {/* The main skewed card content */}
      <div className="nft-card glass-card">
        <img
          src={img}
          alt={name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://placehold.co/600x800/0A0F1A/E0E0E0?text=Asset+Error";
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(10,15,26,1) 0%, transparent 60%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            right: 20,
            transform: "skewX(10deg)" /* Counter-skew the text content */,
          }}
        >
          <h3 className="font-orbitron" style={{ margin: 0 }}>
            {name}
          </h3>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <span
              style={{
                background: `rgba(var(--accent-purple), .1)`,
                color: `rgba(var(--accent-purple), 1)`,
                padding: "4px 8px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {rarity}
            </span>
            <span className="font-orbitron">{price}</span>
          </div>
        </div>
      </div>
      {/* The 3D peaking edge that sits behind */}
      <div className="nft-card-peaking-edge"></div>
    </div>
  );
};

const HowToViewCoins = () => {
  // --- IMPORTANT: Replace these with your actual contract addresses ---
  const COIN_CONTRACT_ADDRESS = "0xe256884B1eBC08d4130B543d91001437B1FD5e1F";
  const NFT_CONTRACT_ADDRESS = "0x1e62C9262f5783de42A3070cDa158a372dea6A3B";

  const [isCopiedCoin, setIsCopiedCoin] = useState(false);
  const [isCopiedNft, setIsCopiedNft] = useState(false);

  // --- Handler for Coin Address ---
  const handleCopyCoin = async () => {
    try {
      await navigator.clipboard.writeText(COIN_CONTRACT_ADDRESS);
      setIsCopiedCoin(true);
      setTimeout(() => setIsCopiedCoin(false), 2500);
    } catch (error) {
      console.error("Failed to copy coin address to clipboard:", error);
      alert("Failed to copy automatically. Please copy the address manually.");
    }
  };

  // --- Handler for NFT Address ---
  const handleCopyNft = async () => {
    try {
      await navigator.clipboard.writeText(NFT_CONTRACT_ADDRESS);
      setIsCopiedNft(true);
      setTimeout(() => setIsCopiedNft(false), 2500);
    } catch (error) {
      console.error("Failed to copy NFT address to clipboard:", error);
      alert("Failed to copy automatically. Please copy the address manually.");
    }
  };

  // Shared classes for the address blocks
  const addressBlockClasses =
    "flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/35 px-4 py-3";

  // Shared classes for the copy buttons
  const baseButtonClasses =
    "btn flex min-w-[105px] cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 py-2";

  return (
    <div className="w-full">
      <h3 className="font-orbitron mb-3 text-xl">
        View Your Assets in MetaMask
      </h3>
      <p className="mb-5 max-w-[80%] text-gray-400">
        Your ShotxCoins/NFTs are in your wallet but may not be visible yet. Follow
        these quick steps to add them.
      </p>

      {/* Coin Contract Address Section */}
      <div className={`${addressBlockClasses} mb-3`}>
        <code className="font-mono text-base text-gray-200 overflow-hidden text-ellipsis whitespace-nowrap">
          {COIN_CONTRACT_ADDRESS}
        </code>
        <button
          onClick={handleCopyCoin}
          className={`${baseButtonClasses} ${
            isCopiedCoin
              ? "bg-[rgba(var(--accent-cyan),.2)] text-[rgba(var(--accent-cyan),1)]"
              : "bg-white/10 text-white"
          }`}
        >
          {isCopiedCoin ? <Check size={16} /> : <Copy size={16} />}
          <span>{isCopiedCoin ? "Copied!" : "Copy Coin"}</span>
        </button>
      </div>

      {/* NFT Contract Address Section */}
      <div className={`${addressBlockClasses} mb-6`}>
        <code className="font-mono text-base text-gray-200 overflow-hidden text-ellipsis whitespace-nowrap">
          {NFT_CONTRACT_ADDRESS}
        </code>
        <button
          onClick={handleCopyNft}
          className={`${baseButtonClasses} ${
            isCopiedNft
              ? "bg-[rgba(var(--accent-cyan),.2)] text-[rgba(var(--accent-cyan),1)]"
              : "bg-white/10 text-white"
          }`}
        >
          {isCopiedNft ? <Check size={16} /> : <Copy size={16} />}
          <span>{isCopiedNft ? "Copied!" : "Copy NFT"}</span>
        </button>
      </div>

      {/* Steps Section */}
      <ol className="m-0 flex flex-col gap-3 pl-5 text-left text-gray-400">
        <li>
          Open <strong>MetaMask</strong> and click{" "}
          <strong>'Import tokens'/'Import NFTs'</strong>.
        </li>
        <li>
          Select <strong>'Sepolia'</strong> in the network tab.
        </li>
        <li>Paste the copied address into the first field.</li>
        <li>Enter token id. (for NFTs only)</li>
        <li>
          Click <strong>'Import'</strong> to finish.
        </li>
      </ol>
    </div>
  );
};

const BentoFeatures = () => {
  const features = [
    {
      icon: Coins,
      title: "View Coins Guide",
      col: 4,
      row: 2,
      isCustom: true,
    },
    {
      icon: Diamond,
      title: "True Asset Ownership",
      desc: "Player skins are't just cosmetics; they're NFTs you truly own on the blockchain.",
      col: 2,
      row: 1,
    },
    {
      icon: Store,
      title: "In-Game Marketplace",
      desc: "Buy, sell, and trade your exclusive NFT skins with other players using ShotX Coins.",
      col: 2,
      row: 1,
    },
    {
      icon: Zap,
      title: "Seamless MetaMask Integration",
      desc: "Connect your wallet instantly with MetaMask to manage your coins and NFTs.",
      col: 2,
      row: 1,
    },
    {
      icon: ShieldCheck,
      title: "Verifiable On-Chain",
      desc: "Every skin and transaction is securely recorded and verifiable on-chain.",
      col: 2,
      row: 1,
    },
    {
      icon: Swords,
      title: "Skill-to-Earn Gameplay",
      desc: "Your performance in our fast-paced canvas shooter directly translates into in-game currency.",
      col: 2,
      row: 1,
    },
  ];

  const gridRef = useRef(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    let ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".bento-card");
      gsap.from(cards, {
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
        duration: 1.2, // Increased from 0.8s for a slower slide
        autoAlpha: 0,
        x: (index) => (index % 2 === 0 ? -300 : 300),
        stagger: 0.15, // Increased from 0.1s for a more deliberate cascade
        ease: "power2.out",
      });
    }, gridRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="features" className="section-padding container">
      <AnimatedOnScroll
        animation="zoom-in"
        style={{ textAlign: "center", marginBottom: 48 }}
      >
        <h2
          className="font-orbitron hologram-text"
          style={{ fontSize: 42, letterSpacing: -1 }}
        >
          A Modern Gaming Experience
        </h2>
        <p
          style={{
            fontSize: 18,
            color: "#A0AEC0",
            maxWidth: 600,
            margin: "12px auto 0",
          }}
        >
          An ecosystem designed for players to truly own their in-game items and
          achievements.
        </p>
      </AnimatedOnScroll>
      <div className="bento-grid" ref={gridRef}>
        {features.map((f) => {
          if (f.isCustom) {
            return (
              <div
                key={f.title}
                className={`bento-card glass-card col-span-${f.col} row-span-${f.row}`}
              >
                <div
                  className="bento-icon-wrapper"
                  style={{
                    display: "inline-flex",
                    padding: 12,
                    background: "rgba(var(--accent-cyan), .08)",
                    borderRadius: 12,
                    marginBottom: 16,
                    alignSelf: "flex-start",
                  }}
                >
                  <f.icon
                    size={24}
                    style={{ color: `rgba(var(--accent-cyan), .9)` }}
                  />
                </div>

                <div style={{ flexGrow: 1 }}>
                  <HowToViewCoins />
                </div>
              </div>
            );
          }
          return (
            <div
              key={f.title}
              className={`bento-card glass-card col-span-${f.col} row-span-${f.row}`}
            >
              <div>
                <div
                  className="bento-icon-wrapper"
                  style={{
                    display: "inline-flex",
                    padding: 12,
                    background: "rgba(var(--accent-cyan), .08)",
                    borderRadius: 12,
                    marginBottom: 16,
                  }}
                >
                  <f.icon
                    size={24}
                    style={{ color: `rgba(var(--accent-cyan), .9)` }}
                  />
                </div>
                <h3
                  className="font-orbitron"
                  style={{ fontSize: 20, margin: 0 }}
                >
                  {f.title}
                </h3>
              </div>
              <p style={{ color: "#A0AEC0", margin: "8px 0 0", flexGrow: 1 }}>
                {f.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

const Leaderboard = ({ account }) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  const maskAddress = (addr) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "Unknown";

  useEffect(() => {
    let cancelled = false;
    const loadLeaderboard = async () => {
      setLoading(true);
      try {
        // 1. Fetch all users from a single, dedicated endpoint
        // (This assumes your backend has a GET /api/users endpoint)
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users`);
        if (cancelled) return;

        if (!res.ok) {
          throw new Error(`Failed to fetch user list: ${res.statusText}`);
        }

        const users = await res.json();
        if (!Array.isArray(users)) {
          throw new Error("Leaderboard data was not an array");
        }

        // 2. Map, sort, and rank the user data
        const sorted = users
          .map((u) => ({
            // Use the same data-shaping logic as before
            wallet: u?.walletAddress,
            name: u?.username || maskAddress(u?.walletAddress),
            score: Number(u?.highestScore || 0),
            nftsOwned: Array.isArray(u?.ownedNFTs) ? u.ownedNFTs.length : 0,
            avatar:
              u?.profilePic?.url ||
              `https://i.pravatar.cc/100?u=${encodeURIComponent(
                u?.walletAddress
              )}`,
          }))
          .filter((p) => p.wallet && p.score > 0) // Filter for players with a wallet and score
          .sort((a, b) => b.score - a.score); // Sort by score descending

        const ranked = sorted.map((p, idx) => ({ ...p, rank: idx + 1 }));

        if (!cancelled) {
          setPlayers(ranked);
        }
      } catch (e) {
        console.warn("Failed to load leaderboard:", e?.message || e);
        if (!cancelled) {
          setPlayers([]); // Set to empty array on failure
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadLeaderboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const top3 = players.slice(0, 3);
  const rest = players.slice(3);

  return (
    <section id="leaderboard" className="leaderboard-section">
      <div className="container">
        <AnimatedOnScroll
          animation="zoom-in"
          style={{ textAlign: "center", marginBottom: 60 }}
        >
          <h2
            className="font-orbitron hologram-text"
            style={{ fontSize: 42, letterSpacing: -1 }}
          >
            Top Players
          </h2>
          <p
            style={{
              fontSize: 18,
              color: "#A0AEC0",
              maxWidth: 600,
              margin: "12px auto 0",
            }}
          >
            See who's dominating the arena. The highest scores are a testament
            to true skill.
          </p>
        </AnimatedOnScroll>

        {loading ? (
          <AnimatedOnScroll
            animation="fade-in-up"
            className="leaderboard-top-3"
          >
            {[1, 2, 3].map((i) => (
              <div key={i} className={`leaderboard-player-card rank-${i}`}>
                <div className="avatar-wrapper">
                  <div className="avatar" style={{ background: "#0f172a" }} />
                </div>
                <div className="font-orbitron" style={{ opacity: 0.5 }}>
                  Loading...
                </div>
              </div>
            ))}
          </AnimatedOnScroll>
        ) : top3.length > 0 ? (
          <AnimatedOnScroll
            animation="fade-in-up"
            className="leaderboard-top-3"
          >
            {top3.map((player) => (
              <div
                key={player.rank}
                className={`leaderboard-player-card rank-${player.rank}`}
              >
                <div className="avatar-wrapper">
                  {player.rank === 1 && (
                    <Award className="rank-badge" strokeWidth={1.5} />
                  )}
                  <img
                    src={player.avatar}
                    alt={player.name}
                    className="avatar"
                  />
                </div>
                <h3 className="font-orbitron" style={{ margin: "0 0 4px 0" }}>
                  {player.name}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: "1rem",
                    color: `rgba(var(--accent-cyan),1)`,
                  }}
                >
                  {Number(player.score || 0).toLocaleString()}
                </p>
                <span style={{ fontSize: "0.8rem", color: "#A0AEC0" }}>
                  {player.nftsOwned} NFTs
                </span>
              </div>
            ))}
          </AnimatedOnScroll>
        ) : (
          <div
            style={{ textAlign: "center", color: "#A0AEC0", marginBottom: 24 }}
          >
            No players found. Be the first to set a score!
          </div>
        )}

        {!loading && rest.length > 0 && (
          <div className="leaderboard-list">
            {rest.map((player, index) => (
              <AnimatedOnScroll
                key={player.rank}
                animation="fade-in-up"
                delay={index * 50}
              >
                <div className="leaderboard-row">
                  <div className="rank">#{player.rank}</div>
                  <div className="player-info">
                    <img src={player.avatar} alt={player.name} />
                    <span>{player.name}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">High Score</span>
                    {Number(player.score || 0).toLocaleString()}
                  </div>
                  <div className="stat">
                    <span className="stat-label">NFTs Owned</span>
                    {player.nftsOwned}
                  </div>
                </div>
              </AnimatedOnScroll>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const HeroStatPods = () => {
  const { account } = useOutletContext();
  if (!account) {
    return <div className="grid md:grid-cols-3 gap-6 animate-pulse"></div>;
  }
  const pods = [
    {
      icon: Coins,
      value: account.shotxBalance || "0",
      label: "ShotX Coins Earned",
      className: "stat-pod-2",
    },
    {
      icon: Sparkles,
      value: account.ownedNFTs.length || "0",
      label: "NFT Skins Minted",
      className: "stat-pod-3",
    },
  ];
  return (
    <div className="stat-pods-container">
      {pods.map((pod) => (
        <div key={pod.label} className={`stat-pod glass-card ${pod.className}`}>
          <pod.icon
            size={20}
            style={{ color: `rgba(var(--accent-cyan), 1)` }}
          />
          <div>
            <div
              className="font-orbitron"
              style={{ fontWeight: 700, fontSize: 16 }}
            >
              <AnimatedCounter value={pod.value} />+
            </div>
            <div style={{ fontSize: 12, color: "#A0AEC0" }}>{pod.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const InteractiveCTA = () => {
  const cardRef = useRef(null);
  const glowRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    const glow = glowRef.current;
    const content = contentRef.current;
    if (!card || !glow || !content) return;

    const MAX_ROTATE = 8;
    const PARALLAX_FACTOR = 0.1;

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      glow.style.opacity = "1";
      glow.style.transform = `translate(${x}px, ${y}px)`;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateY = ((x - centerX) / centerX) * MAX_ROTATE;
      const rotateX = ((centerY - y) / centerY) * MAX_ROTATE;
      card.style.transform = `scale(1.04) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

      const parallaxX = (centerX - x) * PARALLAX_FACTOR;
      const parallaxY = (centerY - y) * PARALLAX_FACTOR;
      content.style.transform = `translate(${parallaxX}px, ${parallaxY}px)`;
    };

    const handleMouseLeave = () => {
      glow.style.opacity = "0";
      card.style.transform = "scale(1) rotateX(0deg) rotateY(0deg)";
      content.style.transform = "translate(0px, 0px)";
    };

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div ref={cardRef} className="interactive-3d" style={{ borderRadius: 24 }}>
      <div
        className="glass-card"
        style={{
          padding: 48,
          borderRadius: 24,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          ref={glowRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "300px",
            height: "300px",
            background:
              "radial-gradient(circle, rgba(var(--accent-cyan), 0.15) 0%, transparent 70%)",
            opacity: 0,
            transition: "opacity 0.3s ease",
            pointerEvents: "none",
            transform: "translate(-50%, -50%)",
          }}
        ></div>
        <div
          ref={contentRef}
          style={{
            transition: "transform 0.3s cubic-bezier(.17,.67,.5,1.39)",
            willChange: "transform",
            zIndex: 1,
          }}
        >
          <Sparkles
            size={40}
            style={{ color: `rgba(var(--accent-cyan),.9)`, marginBottom: 16 }}
          />
          <h2
            className="font-orbitron hologram-text"
            style={{ fontSize: 42, margin: 0, letterSpacing: -1 }}
          >
            Ready to Play?
          </h2>
          <p
            style={{
              color: "#A0AEC0",
              maxWidth: 500,
              margin: "12px auto 24px",
            }}
          >
            Jump into the action and start earning, or check out the source code
            to see how this Web3 game was built.
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 12,
              transform: "translateZ(50px)",
            }}
          >
            <Link to="/Game" className="btn btn-primary">
              <Play size={18} /> Play Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- (NEW) Player Stats Component ---
const PlayerStats = ({ playerData, onConvert, isConverting }) => {
  const score = playerData?.accumulatedScore || 0;
  const coins = Math.floor(score / 10);

  return (
    <div className="player-stats-card">
      <div className="stat-item">
        <div className="stat-label">Accumulated Score</div>
        <div className="stat-value">
          <AnimatedCounter value={score} />
        </div>
      </div>
      <ArrowRight className="stat-arrow" size={32} />
      <div className="stat-item">
        <div className="stat-label">Potential Coins</div>
        <div className="stat-value">
          <AnimatedCounter value={coins} />
        </div>
      </div>
      <button
        onClick={onConvert}
        disabled={score === 0 || isConverting}
        className="btn btn-primary convert-btn"
      >
        <Coins size={18} />
        <span>{isConverting ? "Converting..." : "Convert Score"}</span>
      </button>
    </div>
  );
};

// ================= MAIN PAGE LAYOUT =================

export default function ShotXWebsite() {
  const { account } = useOutletContext();

  // Accept account as a prop
  const [playerData, setPlayerData] = useState({
    accumulatedScore: 0,
    highestScore: 0,
  });

  const [isConverting, setIsConverting] = useState(false);

  // This function will fetch data and be used to refresh it
  const refreshPlayerData = useCallback(() => {
    if (account?.walletAddress) {
      // Use the full user object
      fetchUserProfile(account.walletAddress).then((data) => {
        if (data) setPlayerData(data);
      });
    }
  }, [account]);

  // Fetch data when the account is connected or changes
  useEffect(() => {
    refreshPlayerData();
  }, [account, refreshPlayerData]);

  // Handler for the conversion button
  const handleConvert = async () => {
    setIsConverting(true);
    try {
      const success = await convertScoreToCoins(account.walletAddress);
      if (success) {
        refreshPlayerData(); // Refresh data on success
      }
    } finally {
      setIsConverting(false);
    }
  };

  // Featured NFTs pulled from DB (fallbacks keep the UI looking the same while loading)
  const [featuredNFTs, setFeaturedNFTs] = useState([
    {
      name: "Crimson Spectre Skin",
      rarity: "Legendary",
      price: "5000 SXC",
      img: "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?q=80&w=800",
    },
    {
      name: "Void Hunter Armor",
      rarity: "Mythic",
      price: "12500 SXC",
      img: "https://images.unsplash.com/photo-1508138221679-760a23a2285b?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      name: "Glacial Hazard Suit",
      rarity: "Epic",
      price: "2500 SXC",
      img: "https://images.unsplash.com/photo-1481349518771-20055b2a7b24?q=80&w=1539&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ]);

  // Helper to compute a rarity label to keep the cards looking the same
  const computeRarity = (item) => {
    // Prefer uniqueness/price to infer rarity; fall back to a deterministic pick
    if (item?.isUnique) return "Mythic";
    const priceNum = Number(item?.price || 0);
    if (priceNum >= 10000) return "Legendary";
    if (priceNum >= 5000) return "Epic";
    return ["Rare", "Epic", "Legendary"][item.tokenId % 3] || "Rare";
  };

  // Fetch 3 random items from the backend and shape them for NFTCard
  useEffect(() => {
    const fetchFeatured = async () => {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      try {
        const res = await fetch(`${API_URL}/api/items`, { 
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch items");
        const items = await res.json();
        if (!Array.isArray(items) || items.length === 0) return; // Keep fallbacks

        // Shuffle and take 3
        const shuffled = items
          .map((it) => ({ it, sort: Math.random() }))
          .sort((a, b) => a.sort - b.sort)
          .slice(0, 3)
          .map(({ it }) => it);

        const shaped = shuffled.map((it) => ({
          name: it.name || `Item #${it.tokenId}`,
          rarity: computeRarity(it),
          price: `${Number(it.price || 0)} SXC`,
          img: it.imageUrl,
        }));

        setFeaturedNFTs(shaped);
      } catch (e) {
        console.warn("Could not load featured NFTs from API:", e?.message || e);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <SpotlightEffect />
      <SpaceBackground />
      <div
        style={{
          minHeight: "100vh",
          position: "relative",
          overflowX: "hidden",
        }}
      >
        <div style={{ position: "relative", zIndex: 1 }}>
          <main>
            {/* ===== HERO SECTION ===== */}
            <section
              className="container"
              style={{
                paddingTop: 200,
                paddingBottom: 140,
                textAlign: "center",
                position: "relative",
              }}
            >
              <div className="floating-shape-container">
                <div className="floating-shape shape-1"></div>
                <div className="floating-shape shape-2"></div>
                <div className="floating-shape shape-3"></div>
              </div>
              <HeroStatPods />
              <FloatingCoins />
              <div style={{ position: "relative", zIndex: 2 }}>
                <AnimatedOnScroll animation="zoom-in">
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      background: `rgba(var(--accent-cyan),.1)`,
                      padding: "8px 16px",
                      borderRadius: 999,
                      color: `rgba(var(--accent-cyan),1)`,
                      fontWeight: 600,
                    }}
                  >
                    <Zap size={16} /> A Web3 Canvas Shooter
                  </span>
                </AnimatedOnScroll>
                <AnimatedOnScroll delay={100}>
                  <h1
                    className="font-orbitron"
                    style={{
                      fontSize: "clamp(40px, 8vw, 72px)",
                      lineHeight: 1.1,
                      margin: "24px 0",
                      letterSpacing: -2,
                    }}
                  >
                    Aim. <span className="hologram-text">Score</span>.
                    <br />
                    Own Your <span className="hologram-text">Gear</span>.
                  </h1>
                </AnimatedOnScroll>
                <AnimatedOnScroll delay={200}>
                  <p
                    style={{
                      fontSize: 20,
                      color: "#A0AEC0",
                      maxWidth: 700,
                      margin: "0 auto 32px",
                    }}
                  >
                    Welcome to ShotX. Blast enemies in our canvas-based shooter,
                    earn ShotX Coins based on your score, and use them to mint
                    exclusive NFT player skins.
                  </p>
                </AnimatedOnScroll>
              </div>
            </section>

            {/* ===== PLAYER STATS & CTA SECTION ===== */}
            <section className="section-padding container">
              {/* This section will only appear if a wallet is connected */}
              {account && (
                <div style={{ marginBottom: 60 }}>
                  <PlayerStats
                    playerData={playerData}
                    onConvert={handleConvert}
                    isConverting={isConverting}
                  />
                </div>
              )}

              <AnimatedOnScroll animation="zoom-in">
                <div style={{ maxWidth: "850px", margin: "0 auto" }}>
                  <InteractiveCTA />
                </div>
              </AnimatedOnScroll>
            </section>

            {/* ===== FEATURED NFTs SECTION ===== */}
            <section id="nfts" className="section-padding container">
              <AnimatedOnScroll
                animation="zoom-in"
                style={{ textAlign: "center", marginBottom: 48 }}
              >
                <h2
                  className="font-orbitron hologram-text"
                  style={{ fontSize: 42, letterSpacing: -1 }}
                >
                  Featured NFTs
                </h2>
                <p style={{ fontSize: 18, color: "#A0AEC0" }}>
                  Exclusive, verifiable NFTs you can truly own.
                </p>
              </AnimatedOnScroll>
              <div
                style={{
                  display: "flex",
                  gap: 40,
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {featuredNFTs.map((nft, index) => (
                  <AnimatedOnScroll
                    key={nft.name}
                    animation="fade-in-right"
                    delay={index * 150}
                    style={{ width: 300, margin: "0 auto" }}
                  >
                    <Link
                      to="/Marketplace"
                      style={{
                        textDecoration: "none",
                        color: "inherit",
                        display: "block",
                        cursor: "pointer",
                      }}
                    >
                      <NFTCard {...nft} />
                    </Link>
                  </AnimatedOnScroll>
                ))}
              </div>
            </section>

            <Leaderboard account={account} />

            <BentoFeatures />
          </main>

          <footer
            style={{
              padding: "40px 0",
              borderTop: "1px solid rgba(255,255,255,.05)",
            }}
          >
            <div
              className="container"
              style={{ textAlign: "center", color: "#A0AEC0" }}
            >
              <p>
                &copy; {new Date().getFullYear()} ShotX by Snepard. All Rights
                Reserved.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}

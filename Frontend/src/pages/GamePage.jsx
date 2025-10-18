import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { updateScore } from '../services/blockchainService';

// --- GAME CLASSES ---
class Player {
  constructor(x, y, radius, color) { this.x = x; this.y = y; this.radius = radius; this.color = color; }
  draw(c) { c.beginPath(); c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false); c.fillStyle = this.color; c.fill(); }
}

// --- MODIFICATION: Simplified Projectile class for motion blur trail ---
class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw(c) {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }

  update(c) {
    this.draw(c);
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

class Enemy {
  constructor(x, y, radius, color, velocity) { this.x = x; this.y = y; this.radius = radius; this.color = color; this.velocity = velocity; }
  draw(c) { c.beginPath(); c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false); c.fillStyle = this.color; c.fill(); }
  update(c) { this.draw(c); this.x += this.velocity.x; this.y += this.velocity.y; }
}

const friction = 0.98;
class Particle {
  constructor(x, y, radius, color, velocity) { this.x = x; this.y = y; this.radius = radius; this.color = color; this.velocity = velocity; this.alpha = 1; }
  draw(c) { c.save(); c.globalAlpha = this.alpha; c.beginPath(); c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false); c.fillStyle = this.color; c.fill(); c.restore(); }
  update(c) { this.draw(c); this.velocity.x *= friction; this.velocity.y *= friction; this.x += this.velocity.x; this.y += this.velocity.y; this.alpha -= 0.01; }
}

// --- SVG ICON ---
const PauseIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 5.25C8 4.55964 8.55964 4 9.25 4H10.75C11.4404 4 12 4.55964 12 5.25V18.75C12 19.4404 11.4404 20 10.75 20H9.25C8.55964 20 8 19.4404 8 18.75V5.25Z" fill="white"/>
    <path d="M14 5.25C14 4.55964 14.5596 4 15.25 4H16.75C17.4404 4 18 4.55964 18 5.25V18.75C18 19.4404 17.4404 20 16.75 20H15.25C14.5596 20 14 19.4404 14 18.75V5.25Z" fill="white"/>
  </svg>
);

const GamePage = ({ connectedAccount }) => {
  const [gameState, setGameState] = useState('menu');
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [gameResult, setGameResult] = useState(null);

  const canvasRef = useRef(null);
  const playerRef = useRef(null);
  const projectilesRef = useRef([]);
  const enemiesRef = useRef([]);
  const particlesRef = useRef([]);
  const animationIdRef = useRef(null);
  const enemyIntervalRef = useRef(null);
  const gameStateRef = useRef(gameState);
  const scoreRef = useRef(0);
  const isGameOverRef = useRef(false);
  const gameOverHandlerRef = useRef();

  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { scoreRef.current = score; }, [score]);

  const handleGameOver = useCallback(async () => {
    if (isGameOverRef.current) return;
    isGameOverRef.current = true;
    if (gameStateRef.current === 'gameOver') return;

    cancelAnimationFrame(animationIdRef.current);
    clearInterval(enemyIntervalRef.current);

    const final = scoreRef.current;
    setFinalScore(final);

    setGameState('gameOver');

    if (connectedAccount) {
        setIsSaving(true);
        const result = await updateScore(connectedAccount, final);
        if (result && result.data) {
            setGameResult(result.data);
        }
        setIsSaving(false);
    }
  }, [connectedAccount]);

  useEffect(() => { gameOverHandlerRef.current = handleGameOver; }, [handleGameOver]);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const x = canvas.width / 2;
    const y = canvas.height / 2;
    playerRef.current = new Player(x, y, 10, 'white');
    projectilesRef.current = [];
    enemiesRef.current = [];
    particlesRef.current = [];
    setScore(0);
    setFinalScore(0);
    isGameOverRef.current = false;
    setGameResult(null);
    setIsSaving(false);
  }, []);

  const spawnEnemies = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    enemyIntervalRef.current = setInterval(() => {
      const radius = Math.random() * (30 - 4) + 4;
      let x, y;
      if (Math.random() < 0.5) {
        x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
        y = Math.random() * canvas.height;
      } else {
        x = Math.random() * canvas.width;
        y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
      }
      const color = `hsl(${Math.random() * 360}, 80%, 50%)`;
      const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
      const velocity = { x: Math.cos(angle) * 0.9, y: Math.sin(angle) * 0.9 };
      enemiesRef.current.push(new Enemy(x, y, radius, color, velocity));
    }, 1000);
  }, []);

  const animate = useCallback(() => {
    animationIdRef.current = requestAnimationFrame(animate);
    const c = canvasRef.current.getContext('2d');
    c.fillStyle = 'rgba(0, 0, 0, 0.1)';
    c.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    playerRef.current.draw(c);

    particlesRef.current.forEach((p, i) => p.alpha <= 0 ? particlesRef.current.splice(i, 1) : p.update(c));

    projectilesRef.current.forEach((p, i) => {
      p.update(c);
      if (p.x + p.radius < 0 || p.x - p.radius > canvasRef.current.width || p.y + p.radius < 0 || p.y - p.radius > canvasRef.current.height) {
        setTimeout(() => projectilesRef.current.splice(i, 1), 0);
      }
    });

    enemiesRef.current.forEach((enemy, eIndex) => {
      enemy.update(c);
      const distPlayer = Math.hypot(playerRef.current.x - enemy.x, playerRef.current.y - enemy.y);
      if (distPlayer - enemy.radius - playerRef.current.radius < 1) {
        return gameOverHandlerRef.current();
      }
      projectilesRef.current.forEach((projectile, pIndex) => {
        const distProj = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
        if (distProj - enemy.radius - projectile.radius < 1) {
          for (let i = 0; i < enemy.radius * 2; i++) {
            particlesRef.current.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {
              x: (Math.random() - 0.5) * (Math.random() * 8),
              y: (Math.random() - 0.5) * (Math.random() * 8)
            }));
          }
          if (enemy.radius - 10 > 5) {
            setScore(s => s + 10);
            gsap.to(enemy, { radius: enemy.radius - 10 });
            projectilesRef.current.splice(pIndex, 1);
          } else {
            setScore(s => s + 50);
            enemiesRef.current.splice(eIndex, 1);
            projectilesRef.current.splice(pIndex, 1);
          }
        }
      });
    });
  }, []);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.style.backgroundColor = 'black';
    const handleClick = (event) => {
      if (gameStateRef.current !== 'playing') return;
      const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2);
      const velocity = { x: Math.cos(angle) * 4, y: Math.sin(angle) * 4 };
      projectilesRef.current.push(
        new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity)
      );
    };
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationIdRef.current);
      clearInterval(enemyIntervalRef.current);
      document.body.style.backgroundColor = '';
    };
  }, []);

  const handleStartGame = () => {
    if (!connectedAccount) {
      const proceed = window.confirm("Your wallet is not connected. Your score will not be saved. Do you want to continue?");
      if (!proceed) return;
    }
    init();
    animate();
    spawnEnemies();
    setGameState('playing');
  };
  const handlePauseGame = () => { cancelAnimationFrame(animationIdRef.current); clearInterval(enemyIntervalRef.current); setGameState('paused'); };
  const handleResumeGame = () => { setGameState('playing'); animate(); spawnEnemies(); };
  const handleButtonGlow = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  const baseButtonClasses = "relative overflow-hidden cursor-pointer w-full py-3 rounded-xl font-bold text-lg transition-transform duration-150 ease-in-out shadow-lg active:shadow-md active:translate-y-px btn-glow text-center";

  return (
    <>
      <style>{`.btn-glow::before { content: ''; position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(255, 255, 255, 0.25) 0%, transparent 50%); opacity: 0; transition: opacity 0.2s; } .btn-glow:hover::before { opacity: 1; }`}</style>
      <div className="select-none">
        <div className="fixed text-white text-xl ml-4 mt-2">
          <span>Score: </span>
          <span>{score}</span>
        </div>

        {gameState === 'playing' && (
          <button onClick={handlePauseGame} className="fixed top-0 right-0 m-2 p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"><PauseIcon /></button>
        )}
        
        {(gameState === 'menu' || gameState === 'gameOver') && (
          <div className="fixed inset-0 flex items-center justify-center">
            <div className="w-full max-w-md p-8 text-center rounded-xl shadow-lg bg-white/10 backdrop-blur-lg border border-white/20 text-white">
              
              {gameState === 'gameOver' && gameResult && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold mb-2">Score Saved!</h2>
                  <p className="text-lg">You scored <span className="font-bold text-pink-400">{finalScore}</span> points.</p>
                  <div className="text-left bg-black/20 p-4 rounded-lg my-4 space-y-2">
                      <p>New Accumulated Score: <span className="font-bold text-cyan-400">{gameResult.accumulatedScore}</span></p>
                      <p>Highest Score: <span className="font-bold text-green-400">{gameResult.highestScore}</span></p>
                  </div>
                </div>
              )}

              {gameState === 'gameOver' && isSaving && (
                <h1 className="text-4xl font-bold animate-pulse">Saving Score...</h1>
              )}

              {(gameState === 'menu' || (gameState === 'gameOver' && !isSaving && !gameResult)) && (
                 <>
                   <h1 className="text-6xl font-bold">{gameState === 'gameOver' ? finalScore : '0'}</h1>
                   <p className="text-sm text-white/80 mb-6">Points</p>
                 </>
              )}

              <div className="flex flex-col gap-3 mt-6">
                <button onMouseMove={handleButtonGlow} onClick={handleStartGame} className={`${baseButtonClasses} bg-pink-500 text-white hover:bg-pink-600`}>
                  {gameState === 'gameOver' ? 'Play Again' : 'Start Game'}
                </button>
                <Link to="/" onMouseMove={handleButtonGlow} className={`${baseButtonClasses} bg-gray-200 text-gray-800 hover:bg-gray-300`}>
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        )}

        {gameState === 'paused' && (
          <div className="fixed inset-0 flex items-center justify-center">
            <div className="w-full max-w-md p-8 text-center rounded-xl shadow-lg bg-white/10 backdrop-blur-lg border border-white/20 text-white">
              <h1 className="text-4xl font-bold mb-6">Game Paused</h1>
              <div className="flex flex-col gap-3">
                <button onMouseMove={handleButtonGlow} onClick={handleResumeGame} className={`${baseButtonClasses} bg-green-500 text-white hover:bg-green-600`}>Resume</button>
                <button onMouseMove={handleButtonGlow} onClick={handleStartGame} className={`${baseButtonClasses} bg-blue-500 text-white hover:bg-blue-600`}>Restart</button>
                <Link to="/" onMouseMove={handleButtonGlow} className={`${baseButtonClasses} bg-gray-200 text-gray-800 hover:bg-gray-300`}>
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        )}
        <canvas ref={canvasRef}></canvas>
      </div>
    </>
  );
};

export default GamePage;
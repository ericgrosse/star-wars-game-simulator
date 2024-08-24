import React, { useEffect, useRef, useState } from 'react';
import './App.scss';

function App() {
  const canvasRef = useRef(null);
  const [player1Position, setPlayer1Position] = useState(200);
  const [aiPosition, setAiPosition] = useState(600);
  const [player1Score, setPlayer1Score] = useState(0);
  const [aiScore, setAiScore] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const loadAssets = async () => {
      const background = new Image();
      background.src = '/assets/background.svg';
      await background.decode();

      const lightsaberHandle = new Image();
      lightsaberHandle.src = '/assets/lightsaber-handle.svg';
      await lightsaberHandle.decode();

      const lightsaberBlade = new Image();
      lightsaberBlade.src = '/assets/lightsaber-blade.svg';
      await lightsaberBlade.decode();

      return { background, lightsaberHandle, lightsaberBlade };
    };

    const gameLoop = (assets) => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      
      // Draw background
      ctx.drawImage(assets.background, 0, 0, ctx.canvas.width, ctx.canvas.height);

      // Draw lightsabers
      drawLightsaber(ctx, assets, player1Position, 'blue', true);
      drawLightsaber(ctx, assets, aiPosition, 'red', false);

      // Move AI
      moveAI();

      // Check for collisions
      checkCollisions();

      // Draw scores
      drawScores(ctx);

      animationFrameId = requestAnimationFrame(() => gameLoop(assets));
    };

    const drawLightsaber = (ctx, assets, position, color, isPlayer) => {
      const x = isPlayer ? 100 : ctx.canvas.width - 100;
      ctx.save();
      ctx.translate(x, position);
      if (!isPlayer) ctx.scale(-1, 1);
      ctx.drawImage(assets.lightsaberHandle, -10, -50, 20, 100);
      ctx.fillStyle = color;
      ctx.drawImage(assets.lightsaberBlade, 0, -200, 10, 200);
      ctx.restore();
    };

    const moveAI = () => {
      const aiSpeed = 2;
      setAiPosition(prev => {
        if (prev < player1Position) return prev + aiSpeed;
        if (prev > player1Position) return prev - aiSpeed;
        return prev;
      });
    };

    const checkCollisions = () => {
      if (Math.abs(player1Position - aiPosition) < 20) {
        if (player1Position < aiPosition) {
          setPlayer1Score(prev => prev + 1);
        } else {
          setAiScore(prev => prev + 1);
        }
      }
    };

    const drawScores = (ctx) => {
      ctx.font = '24px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(`Player: ${player1Score}`, 20, 30);
      ctx.fillText(`AI: ${aiScore}`, ctx.canvas.width - 100, 30);
    };

    loadAssets().then(assets => {
      gameLoop(assets);
    });

    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowUp':
          setPlayer1Position(prev => Math.max(prev - 10, 0));
          break;
        case 'ArrowDown':
          setPlayer1Position(prev => Math.min(prev + 10, ctx.canvas.height));
          break;
        default:
          break;
      }
    };

    const handleGamepadConnected = (event) => {
      const gamepad = event.gamepad;
      const gamepadLoop = () => {
        const gp = navigator.getGamepads()[gamepad.index];
        if (gp.axes[1] < -0.5) {
          setPlayer1Position(prev => Math.max(prev - 5, 0));
        } else if (gp.axes[1] > 0.5) {
          setPlayer1Position(prev => Math.min(prev + 5, ctx.canvas.height));
        }
        requestAnimationFrame(gamepadLoop);
      };
      gamepadLoop();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('gamepadconnected', handleGamepadConnected);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
    };
  }, [player1Position, aiPosition, player1Score, aiScore]);

  return (
    <div className="App">
      <canvas ref={canvasRef} width={800} height={600} />
    </div>
  );
}

export default App;

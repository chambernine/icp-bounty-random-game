import React, { useState, useEffect } from 'react';
import { AuthClient } from "@dfinity/auth-client";
import { random_game_backend } from 'declarations/random-game-backend';

const ColorGame = () => {
  const [colors, setColors] = useState([]);
  const [gameResult, setGameResult] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState(null);
  const [principal, setPrincipal] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initAuth();
  }, []);

  async function initAuth() {
    const client = await AuthClient.create();
    setAuthClient(client);

    const isAuthenticated = await client.isAuthenticated();
    setIsAuthenticated(isAuthenticated);

    if (isAuthenticated) {
      const identity = client.getIdentity();
      const principal = identity.getPrincipal().toString();
      setPrincipal(principal);
    }
  }

  async function login() {
    const daysToAdd = BigInt(1);
    const EIGHT_HOURS_IN_NANOSECONDS = BigInt(8 * 60 * 60 * 1000000000);
    
    await authClient?.login({
      identityProvider: process.env.II_URL || "https://identity.ic0.app",
      maxTimeToLive: daysToAdd * EIGHT_HOURS_IN_NANOSECONDS,
      onSuccess: async () => {
        setIsAuthenticated(true);
        const identity = authClient.getIdentity();
        const principal = identity.getPrincipal().toString();
        setPrincipal(principal);
      },
    });
  }

  async function logout() {
    await authClient?.logout();
    setIsAuthenticated(false);
    setPrincipal(null);
    setGameResult(null);
  }

  const generateRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const startNewGame = () => {
    if (!isAuthenticated) {
      setGameResult({
        won: false,
        message: "Please login to play the game."
      });
      return;
    }

    const newColors = [
      generateRandomColor(),
      generateRandomColor(),
      generateRandomColor()
    ];
    setColors(newColors);
    setGameResult(null);
    setIsPlaying(true);
  };

  const handleColorChoice = async (index) => {
    if (!isAuthenticated) return;
    
    setIsPlaying(true);
    setLoading(true);
    try {
        const result = await random_game_backend.playGame(index + 1);
        setLoading(false);
        
        if (result.won) {
            setGameResult({
                won: true,
                message: `🎉 Congratulations! You picked the correct color: ${colors[index]}`,
            });
        } else {
            setGameResult({
                won: false,
                message: result.message
            });
        }
    } catch (error) {
      setLoading(false);
        setGameResult({
            won: false,
            message: "Error playing game. Please try again."
        });
    }
    setIsPlaying(false);
};

  return (
    <main className="app-container">
      <div className="game-container">
        <div className="header">
          <h1>Color Guessing Game</h1>
          <p>Pick the color you think is correct!</p>
        </div>

        <div className="game-card">
          <div className="auth-section">
            {isAuthenticated ? (
              <div className="auth-info">
                <p className="principal-text">Principal ID: {principal?.slice(0, 8)}...</p>
                <button onClick={logout} className="auth-button logout">
                  Logout
                </button>
              </div>
            ) : (
              <button onClick={login} className="auth-button login">
                Login with Internet Identity
              </button>
            )}
          </div>

          {isAuthenticated && (
            <div className="game-content">
              {!isPlaying || colors.length === 0 ? (
                <button 
                  onClick={startNewGame} 
                  className="submit-button"
                >
                  Start New Game
                </button>
                
              ) : (
                <div className="color-choices">
                  {!loading && colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => handleColorChoice(index)}
                      className="color-choice"
                      style={{
                        backgroundColor: color,
                        width: '80px',
                        height: '80px',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                      }}
                    />
                  ))}
                  {loading && (
                    <div className="loader" />
                  )}
                </div>
              )}

              {gameResult && (
                <div className={`result-message ${gameResult.won ? 'success' : 'error'}`}>
                  <p>{gameResult.message}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="footer">
        <img src="/logo2.svg" alt="DFINITY logo" className="footer-logo" />
      </div>

    </main>
  );
};

export default ColorGame;
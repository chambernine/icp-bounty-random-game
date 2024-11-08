import { useState, useEffect } from 'react';
import { AuthClient } from "@dfinity/auth-client";
import { random_game_backend } from 'declarations/random-game-backend';

function App() {
  const [userGuess, setUserGuess] = useState('');
  const [gameResult, setGameResult] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState(null);
  const [principal, setPrincipal] = useState(null);

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
      setGameResult({
        won: false,
        message: "Please login to play the game."
      });
      return;
    }

    setIsPlaying(true);
    
    try {
      const result = await random_game_backend.playGame(Number(userGuess));
      setGameResult(result);
    } catch (error) {
      setGameResult({ 
        won: false, 
        message: "Error playing game. Please try again." 
      });
    }
    
    setIsPlaying(false);
    setUserGuess('');
  };

  return (
    <main className="app-container">
      <div className="game-container">
        <div className="header">
          <h1>Random Game</h1>
          <p>Guess a number between 1 and 100</p>
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

          <form onSubmit={handleSubmit} className="game-form">
            <div className="form-group">
              <label htmlFor="guess" className="form-label">
                Enter your guess:
              </label>
              <input
                id="guess"
                type="number"
                min="1"
                max="100"
                value={userGuess}
                onChange={(e) => setUserGuess(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isPlaying || !isAuthenticated}
              className="submit-button"
            >
              {!isAuthenticated ? 'Login to Play' : isPlaying ? 'Playing...' : 'Play Game'}
            </button>
          </form>

          {gameResult && (
            <div className={`result-message ${gameResult.won ? 'success' : 'error'}`}>
              {gameResult.won}
              <p>{gameResult.message}</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="footer">
        <img src="/logo2.svg" alt="DFINITY logo" className="footer-logo" />
      </div>
    </main>
  );
}

export default App;
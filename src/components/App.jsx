import React, { useState } from 'react';
import { MainMenu } from './MainMenu';
import { GameBoard } from './GameBoard';

const App = () => {
  const [gameState, setGameState] = useState('menu');

  const startGame = () => setGameState('playing');
  const returnToMenu = () => setGameState('menu');

  return (
    <div className="container mx-auto px-4 py-8">
      {gameState === 'menu' ? (
        <MainMenu onStartGame={startGame} />
      ) : (
        <GameBoard onExitGame={returnToMenu} />
      )}
    </div>
  );
};

export default App;

import React, { useState, useEffect, useCallback } from 'react';
import { PlayerArea } from './PlayerArea';
import { OpponentArea } from './OpponentArea';
import { GameInfo } from './GameInfo';
import { LastPlayedCard } from './LastPlayedCard';
import { GameLog } from './GameLog';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { CardEffects } from './CardEffects';
import { MomentumGauge } from './MomentumGauge';
import { PlayerHand } from './PlayerHand';
import { GameOverModal } from './GameOverModal';
import { SpecialMoveModal } from './SpecialMoveModal';
import { TurnIndicator } from './TurnIndicator';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useTerribleTeddiesCards, useUserDeck, useUpdateUserStats } from '@/integrations/supabase';
import { LoadingSpinner } from '../LoadingSpinner';
import confetti from 'canvas-confetti';
import { TurnTimer } from './TurnTimer';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ActiveEffects } from './ActiveEffects';

export const GameBoard = ({ onExit, settings, gameId = null }) => {
  const [isMultiplayer, setIsMultiplayer] = useState(!!gameId);
  const { data: allCards, isLoading: isLoadingCards } = useTerribleTeddiesCards();
  const { data: userDeck, isLoading: isLoadingDeck } = useUserDeck();
  const updateUserStats = useUpdateUserStats();
  const { toast } = useToast();
  const [showSpecialMoveModal, setShowSpecialMoveModal] = useState(false);
  const [turnTimeLeft, setTurnTimeLeft] = useState(30);
  const [showSurrenderDialog, setShowSurrenderDialog] = useState(false);

  const {
    playerHP,
    opponentHP,
    playerHand,
    opponentHand,
    currentTurn,
    momentumGauge,
    lastPlayedCard,
    gameLog,
    playCard,
    endTurn,
    isGameOver,
    winner,
    initializeGame,
    useSpecialMove,
    playerEnergy,
    opponentEnergy,
    activeEffects,
    applyActiveEffects,
  } = useGameLogic();

  useEffect(() => {
    let timer;
    if (currentTurn === 'player' && !isGameOver) {
      timer = setInterval(() => {
        setTurnTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            endTurn();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [currentTurn, isGameOver, endTurn]);

  useEffect(() => {
    setTurnTimeLeft(30);
    applyActiveEffects();
  }, [currentTurn, applyActiveEffects]);

  const handleInitializeGame = useCallback(() => {
    if (allCards && userDeck) {
      initializeGame(userDeck.length > 0 ? userDeck : allCards);
    }
  }, [allCards, userDeck, initializeGame]);

  useEffect(() => {
    if (!isLoadingCards && !isLoadingDeck) {
      handleInitializeGame();
    }
  }, [isLoadingCards, isLoadingDeck, handleInitializeGame]);

  const handlePlayCard = (card) => {
    if (playerEnergy >= card.energy_cost) {
      playCard(card);
      setTurnTimeLeft(30);
    } else {
      toast({
        title: "Not enough energy",
        description: `You need ${card.energy_cost} energy to play this card.`,
        variant: "destructive",
      });
    }
  };

  const handleEndTurn = () => {
    endTurn();
    setTurnTimeLeft(30);
  };

  const handlePlayAgain = () => {
    handleInitializeGame();
    setTurnTimeLeft(30);
  };

  const handleSpecialMove = () => {
    if (momentumGauge >= 10) {
      setShowSpecialMoveModal(true);
    } else {
      toast({
        title: "Not enough momentum",
        description: "You need 10 momentum to use a special move!",
        variant: "destructive",
      });
    }
  };

  const executeSpecialMove = (moveName) => {
    useSpecialMove(moveName);
    setShowSpecialMoveModal(false);
    setTurnTimeLeft(30);
  };

  const handleSurrender = () => {
    setShowSurrenderDialog(true);
  };

  const confirmSurrender = () => {
    setShowSurrenderDialog(false);
    onExit();
  };

  useEffect(() => {
    if (isGameOver) {
      if (winner === 'player') {
        updateUserStats.mutate({ games_won: 1, coins: 50 });
        if (settings.soundEnabled) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      } else {
        updateUserStats.mutate({ games_played: 1 });
      }
    }
  }, [isGameOver, winner, settings.soundEnabled, updateUserStats]);

  if (isLoadingCards || isLoadingDeck) {
    return <LoadingSpinner />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className={`game-board p-6 rounded-2xl shadow-2xl ${settings.darkMode ? 'bg-gray-800 text-white' : 'bg-gradient-to-b from-pink-100 to-purple-200'}`}
    >
      <OpponentArea 
        hp={opponentHP} 
        hand={opponentHand} 
        energy={opponentEnergy} 
        darkMode={settings.darkMode} 
        activeEffects={activeEffects.opponent}
      />
      <GameInfo currentTurn={currentTurn} momentumGauge={momentumGauge} darkMode={settings.darkMode} />
      <MomentumGauge value={momentumGauge} darkMode={settings.darkMode} />
      <TurnIndicator currentTurn={currentTurn} darkMode={settings.darkMode} />
      <div className="flex mb-6 space-x-4">
        <LastPlayedCard card={lastPlayedCard} darkMode={settings.darkMode} />
        <GameLog log={gameLog} darkMode={settings.darkMode} />
      </div>
      <PlayerArea 
        hp={playerHP} 
        hand={playerHand} 
        onPlayCard={handlePlayCard} 
        currentTurn={currentTurn}
        energy={playerEnergy}
        darkMode={settings.darkMode}
        activeEffects={activeEffects.player}
      />
      <PlayerHand 
        hand={playerHand} 
        onPlayCard={handlePlayCard} 
        darkMode={settings.darkMode} 
        playerEnergy={playerEnergy}
      />
      <div className="mt-8 flex justify-center space-x-6">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            onClick={handleEndTurn}
            disabled={currentTurn !== 'player'}
            className={`font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 ${
              settings.darkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
            }`}
          >
            End Turn
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            onClick={handleSpecialMove}
            disabled={currentTurn !== 'player' || momentumGauge < 10}
            className={`font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 ${
              settings.darkMode 
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                : 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white'
            }`}
          >
            Special Move
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <AlertDialog open={showSurrenderDialog} onOpenChange={setShowSurrenderDialog}>
            <AlertDialogTrigger asChild>
              <Button 
                onClick={handleSurrender}
                className={`font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 ${
                  settings.darkMode 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white'
                }`}
              >
                Surrender
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to surrender?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. You will lose the game and forfeit any potential rewards.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmSurrender}>Confirm Surrender</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </motion.div>
      </div>
      <TurnTimer timeLeft={turnTimeLeft} currentTurn={currentTurn} />
      <AnimatePresence>
        {lastPlayedCard && (
          <CardEffects effect={lastPlayedCard.specialMove} type={lastPlayedCard.type} darkMode={settings.darkMode} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isGameOver && (
          <GameOverModal 
            winner={winner} 
            onPlayAgain={handlePlayAgain} 
            onExit={onExit} 
            darkMode={settings.darkMode}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showSpecialMoveModal && (
          <SpecialMoveModal 
            onClose={() => setShowSpecialMoveModal(false)}
            onSelectMove={executeSpecialMove}
            darkMode={settings.darkMode}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GameBoard;

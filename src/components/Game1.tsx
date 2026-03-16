import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Player, Position, GameMode, Cell } from '../types';

const ROWS = 4;
const COLS = 4;

export type Game1State = {
  board: Cell[][];
  redPos: Position;
  blackPos: Position;
  turn: Player;
  winner: Player | null;
  mode: GameMode;
  playerSide: Player | null;
};

const INITIAL_STATE: Game1State = {
  board: Array(ROWS).fill(null).map(() => Array(COLS).fill(null)),
  redPos: { row: 0, col: 0 },
  blackPos: { row: 3, col: 3 },
  turn: 'black',
  winner: null,
  mode: 'double',
  playerSide: null,
};

export default function Game1() {
  const [gameState, setGameState] = useState<Game1State>(INITIAL_STATE);
  const [gameStarted, setGameStarted] = useState(false);

  const movePiece = useCallback((player: Player, newPos: Position) => {
    setGameState(prev => {
      let { redPos, blackPos, turn, winner } = prev;

      if (player === 'red') {
        redPos = newPos;
        if (redPos.row === blackPos.row && redPos.col === blackPos.col) {
          winner = 'red';
        }
        turn = 'black';
      } else {
        blackPos = newPos;
        if (blackPos.row === 0 && blackPos.col === 0) {
          winner = 'black';
        }
        turn = 'red';
      }

      return { ...prev, redPos, blackPos, turn, winner };
    });
  }, []);

  useEffect(() => {
    if (gameStarted && !gameState.winner && gameState.turn !== gameState.playerSide && gameState.mode === 'single') {
      const timer = setTimeout(() => {
        const currentPos = gameState.turn === 'red' ? gameState.redPos : gameState.blackPos;
        const possibleMoves = [
          { row: currentPos.row - 1, col: currentPos.col },
          { row: currentPos.row + 1, col: currentPos.col },
          { row: currentPos.row, col: currentPos.col - 1 },
          { row: currentPos.row, col: currentPos.col + 1 },
        ].filter(p => p.row >= 0 && p.row < ROWS && p.col >= 0 && p.col < COLS);
        
        const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        movePiece(gameState.turn, move);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameStarted, gameState.turn, gameState.winner, gameState.playerSide, gameState.mode, movePiece, gameState.redPos, gameState.blackPos]);

  const handleCellClick = (row: number, col: number) => {
    if (gameState.winner || !gameStarted) return;
    if (gameState.mode === 'single' && gameState.turn !== gameState.playerSide) return;
    
    const currentPos = gameState.turn === 'red' ? gameState.redPos : gameState.blackPos;
    const dr = Math.abs(row - currentPos.row);
    const dc = Math.abs(col - currentPos.col);

    if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
      if (gameState.turn === 'black') {
        if (row === gameState.redPos.row && col === gameState.redPos.col) return;
      }
      movePiece(gameState.turn, { row, col });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto">
      {!gameStarted ? (
        <>
          <h1 className="text-4xl font-bold mb-8 text-zinc-800">大兵小將</h1>
          <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center gap-6 mt-8">
            <h2 className="text-2xl font-bold text-zinc-800">選擇遊戲模式</h2>
            <div className="flex flex-col gap-4 w-full min-w-[300px]">
              <button 
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-xl transition-colors text-lg"
                onClick={() => { setGameState(s => ({ ...s, mode: 'double' })); setGameStarted(true); }}
              >
                雙人遊戲
              </button>
              <button 
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-xl transition-colors text-lg"
                onClick={() => { setGameState(s => ({ ...s, mode: 'single', playerSide: 'red' })); setGameStarted(true); }}
              >
                單人遊戲 (玩家持紅隊)
              </button>
              <button 
                className="w-full bg-zinc-800 hover:bg-zinc-900 text-white font-bold py-4 px-8 rounded-xl transition-colors text-lg"
                onClick={() => { setGameState(s => ({ ...s, mode: 'single', playerSide: 'black' })); setGameStarted(true); }}
              >
                單人遊戲 (玩家持黑隊)
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 w-full mb-8 min-h-[80px]">
            <h1 className="text-3xl md:text-4xl font-bold text-zinc-800 m-0 text-center">大兵小將</h1>
            {gameState.winner && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-md flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                <p className="font-bold text-lg md:text-xl m-0 text-center sm:text-left">
                  遊戲結束！{gameState.winner === 'red' ? '紅方兵' : '黑方將'}獲勝！
                </p>
                <button 
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition-colors whitespace-nowrap w-full sm:w-auto"
                  onClick={() => { setGameState(INITIAL_STATE); setGameStarted(false); }}
                >
                  重新開始
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-12 lg:gap-20 w-full">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="absolute -left-12 top-8 -translate-y-1/2 text-zinc-800">
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                </div>
                <div className={`bg-[#E4C59E] p-4 rounded-lg shadow-2xl border-4 transition-colors duration-500 ${
                  !gameState.winner ? (
                    gameState.turn === 'red' ? 'border-pulse-red' : 'border-pulse-black'
                  ) : 'border-[#8B5A2B]'
                }`}>
                  <div className="grid grid-cols-4 gap-0 border-2 border-[#8B5A2B] bg-[#F5DEB3]">
                  {Array(ROWS).fill(null).map((_, r) =>
                    Array(COLS).fill(null).map((_, c) => {
                      const currentPos = gameState.turn === 'red' ? gameState.redPos : gameState.blackPos;
                      const isAdjacent = Math.abs(r - currentPos.row) + Math.abs(c - currentPos.col) === 1;
                      const isValidMove = isAdjacent && !(gameState.turn === 'black' && r === gameState.redPos.row && c === gameState.redPos.col);
                      const isTarget = (gameState.turn === 'black' && r === 0 && c === 0) || (gameState.turn === 'red' && r === 3 && c === 3);
                      
                      return (
                        <div
                          key={`${r}-${c}`}
                          className={`w-12 h-12 sm:w-16 sm:h-16 border border-[#8B5A2B] flex items-center justify-center cursor-pointer relative
                            ${isValidMove ? 'ring-4 ring-green-400 ring-inset' : ''}
                            ${isTarget ? 'bg-[#E4C59E]' : ''}
                          `}
                        onClick={() => handleCellClick(r, c)}
                      >
                        {gameState.redPos.row === r && gameState.redPos.col === c && (
                          <motion.div layoutId="red" className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full p-[3px] bg-gradient-to-br from-yellow-300 via-orange-500 to-red-600 z-10`}>
                            <div className="w-full h-full bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">兵</div>
                          </motion.div>
                        )}
                        {gameState.blackPos.row === r && gameState.blackPos.col === c && (
                          <motion.div layoutId="black" className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full p-[3px] bg-gradient-to-br from-blue-300 via-purple-500 to-zinc-800 z-10`}>
                            <div className="w-full h-full bg-zinc-800 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">將</div>
                          </motion.div>
                        )}
                        {isValidMove && !(gameState.redPos.row === r && gameState.redPos.col === c) && !(gameState.blackPos.row === r && gameState.blackPos.col === c) && (
                          <div className="w-4 h-4 rounded-full bg-green-400 opacity-50" />
                        )}
                      </div>
                    );
                  })
                )}
                </div>
              </div>
            </div>
            
            {/* 當前回合 */}
            <div className="bg-white px-8 py-3 rounded-full shadow-md border border-zinc-200 flex items-center gap-4">
              <span className="text-lg font-bold text-zinc-700">當前回合：</span>
              <span className={`text-xl font-bold ${gameState.turn === 'red' ? 'text-red-500' : 'text-zinc-800'}`}>
                {gameState.turn === 'red' ? '紅方 (兵)' : '黑方 (將)'}
              </span>
            </div>
          </div>
            
          <div className="bg-white p-6 rounded-xl shadow-lg border border-zinc-200 w-full max-w-sm lg:w-64">
              <h2 className="text-2xl font-bold mb-4">遊戲規則說明</h2>
              <ul className="list-disc list-inside space-y-2 text-zinc-700">
                <li>玩家分為「黑隊」與「紅隊」。</li>
                <li>玩家1持黑棋「將」，玩家2持紅棋「兵」。</li>
                <li>一次只能走一格。</li>
                <li>「兵」吃到「將」及紅隊獲勝，或「將」由起點移動到黑色箭頭處，即黑隊獲勝。</li>
                <li>黑方 (將) 不可移動至紅方 (兵) 所在位置。</li>
              </ul>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="mt-12 pb-8 text-center text-sm text-zinc-500 w-full">
        <p>© 2026 遊戲靈感來源：Threads @幼教老師起步驟</p>
      </div>
    </div>
  );
}

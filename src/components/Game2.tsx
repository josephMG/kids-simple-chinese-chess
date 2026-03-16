import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Player, Position, GameMode } from '../types';

const ROWS = 4;
const COLS = 4;

type PieceType = '帥' | '兵' | '將' | '卒';

interface Piece {
  id: string;
  type: PieceType;
  player: Player;
  row: number;
  col: number;
  alive: boolean;
}

interface Game2State {
  pieces: Piece[];
  turn: Player;
  winner: Player | null;
  mode: GameMode;
  playerSide: Player | null;
  selectedPieceId: string | null;
}

const INITIAL_PIECES: Piece[] = [
  { id: 'red-shuai', type: '帥', player: 'red', row: 0, col: 0, alive: true },
  { id: 'red-bing', type: '兵', player: 'red', row: 3, col: 0, alive: true },
  { id: 'black-zu', type: '卒', player: 'black', row: 0, col: 3, alive: true },
  { id: 'black-jiang', type: '將', player: 'black', row: 3, col: 3, alive: true },
];

const INITIAL_STATE: Game2State = {
  pieces: INITIAL_PIECES,
  turn: 'black',
  winner: null,
  mode: 'double',
  playerSide: null,
  selectedPieceId: null,
};

export default function Game2() {
  const [gameState, setGameState] = useState<Game2State>(INITIAL_STATE);
  const [gameStarted, setGameStarted] = useState(false);

  const movePiece = useCallback((pieceId: string, newRow: number, newCol: number) => {
    setGameState(prev => {
      if (prev.winner) return prev;

      const newPieces = prev.pieces.map(p => ({ ...p }));
      const pieceToMove = newPieces.find(p => p.id === pieceId);
      if (!pieceToMove) return prev;

      // Check for capture
      const targetPiece = newPieces.find(p => p.row === newRow && p.col === newCol && p.alive);
      if (targetPiece) {
        targetPiece.alive = false;
      }

      pieceToMove.row = newRow;
      pieceToMove.col = newCol;

      // Check win conditions
      let winner = prev.winner;
      
      // Red wins if any red piece reaches (3,3)
      if (pieceToMove.player === 'red' && newRow === 3 && newCol === 3) {
        winner = 'red';
      }
      // Black wins if any black piece reaches (0,0)
      if (pieceToMove.player === 'black' && newRow === 0 && newCol === 0) {
        winner = 'black';
      }

      // If opponent has no pieces left, current player wins
      const redAlive = newPieces.some(p => p.player === 'red' && p.alive);
      const blackAlive = newPieces.some(p => p.player === 'black' && p.alive);
      if (!redAlive) winner = 'black';
      if (!blackAlive) winner = 'red';

      return {
        ...prev,
        pieces: newPieces,
        turn: prev.turn === 'red' ? 'black' : 'red',
        winner,
        selectedPieceId: null,
      };
    });
  }, []);

  const getValidMoves = useCallback((piece: Piece, pieces: Piece[]) => {
    const moves: Position[] = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    for (const [dr, dc] of directions) {
      const nr = piece.row + dr;
      const nc = piece.col + dc;

      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
        const targetPiece = pieces.find(p => p.row === nr && p.col === nc && p.alive);
        
        if (!targetPiece) {
          moves.push({ row: nr, col: nc });
        } else if (targetPiece.player !== piece.player) {
          // Can only capture specific counterpart
          if (
            (piece.type === '兵' && targetPiece.type === '卒') ||
            (piece.type === '卒' && targetPiece.type === '兵') ||
            (piece.type === '帥' && targetPiece.type === '將') ||
            (piece.type === '將' && targetPiece.type === '帥')
          ) {
            moves.push({ row: nr, col: nc });
          }
        }
      }
    }
    return moves;
  }, []);

  // Simple AI
  useEffect(() => {
    if (gameStarted && !gameState.winner && gameState.turn !== gameState.playerSide && gameState.mode === 'single') {
      const timer = setTimeout(() => {
        const myPieces = gameState.pieces.filter(p => p.player === gameState.turn && p.alive);
        const allPossibleMoves: { pieceId: string, move: Position }[] = [];

        myPieces.forEach(piece => {
          const validMoves = getValidMoves(piece, gameState.pieces);
          validMoves.forEach(move => {
            allPossibleMoves.push({ pieceId: piece.id, move });
          });
        });

        if (allPossibleMoves.length > 0) {
          // Try to find a winning move
          const winningMove = allPossibleMoves.find(m => {
            if (gameState.turn === 'red' && m.move.row === 3 && m.move.col === 3) return true;
            if (gameState.turn === 'black' && m.move.row === 0 && m.move.col === 0) return true;
            return false;
          });

          // Try to find a capturing move
          const capturingMove = allPossibleMoves.find(m => {
            return gameState.pieces.some(p => p.row === m.move.row && p.col === m.move.col && p.alive && p.player !== gameState.turn);
          });

          const chosenMove = winningMove || capturingMove || allPossibleMoves[Math.floor(Math.random() * allPossibleMoves.length)];
          movePiece(chosenMove.pieceId, chosenMove.move.row, chosenMove.move.col);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameStarted, gameState.turn, gameState.winner, gameState.playerSide, gameState.mode, gameState.pieces, movePiece, getValidMoves]);

  const handleCellClick = (row: number, col: number) => {
    if (gameState.winner || !gameStarted) return;
    if (gameState.mode === 'single' && gameState.turn !== gameState.playerSide) return;

    const clickedPiece = gameState.pieces.find(p => p.row === row && p.col === col && p.alive);

    if (gameState.selectedPieceId) {
      const selectedPiece = gameState.pieces.find(p => p.id === gameState.selectedPieceId);
      if (selectedPiece) {
        if (clickedPiece && clickedPiece.player === gameState.turn) {
          // Select another own piece
          setGameState(prev => ({ ...prev, selectedPieceId: clickedPiece.id }));
          return;
        }

        const validMoves = getValidMoves(selectedPiece, gameState.pieces);
        const isValidMove = validMoves.some(m => m.row === row && m.col === col);

        if (isValidMove) {
          movePiece(selectedPiece.id, row, col);
        } else {
          // Deselect if clicking invalid empty cell
          setGameState(prev => ({ ...prev, selectedPieceId: null }));
        }
      }
    } else {
      if (clickedPiece && clickedPiece.player === gameState.turn) {
        setGameState(prev => ({ ...prev, selectedPieceId: clickedPiece.id }));
      }
    }
  };

  const selectedPiece = gameState.pieces.find(p => p.id === gameState.selectedPieceId);
  const validMoves = selectedPiece ? getValidMoves(selectedPiece, gameState.pieces) : [];

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto">
      {!gameStarted ? (
        <>
          <h1 className="text-4xl font-bold mb-8 text-zinc-800">小帥小將</h1>
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
            <h1 className="text-3xl md:text-4xl font-bold text-zinc-800 m-0 text-center">小帥小將</h1>
            {gameState.winner && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-md flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                <p className="font-bold text-lg md:text-xl m-0 text-center sm:text-left">
                  遊戲結束！{gameState.winner === 'red' ? '紅隊' : '黑隊'}獲勝！
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
                {/* Black Arrow */}
                <div className="absolute -left-12 top-8 -translate-y-1/2 text-zinc-800">
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                </div>
                {/* Red Arrow */}
                <div className="absolute -right-12 bottom-8 translate-y-1/2 text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
                
                <div className={`bg-[#E4C59E] p-4 rounded-lg shadow-2xl border-4 transition-colors duration-500 ${
                  !gameState.winner ? (
                    gameState.turn === 'red' ? 'border-pulse-red' : 'border-pulse-black'
                  ) : 'border-[#8B5A2B]'
                }`}>
                  <div className="grid grid-cols-4 gap-0 border-2 border-[#8B5A2B] bg-[#F5DEB3]">
                  {Array(ROWS).fill(null).map((_, r) =>
                    Array(COLS).fill(null).map((_, c) => {
                      const isHighlight = validMoves.some(m => m.row === r && m.col === c);
                      const piece = gameState.pieces.find(p => p.row === r && p.col === c && p.alive);
                      const isSelected = piece?.id === gameState.selectedPieceId;
                      const isTarget = (r === 0 && c === 0) || (r === 3 && c === 3);
  
                      return (
                        <div
                          key={`${r}-${c}`}
                          className={`w-12 h-12 sm:w-16 sm:h-16 border border-[#8B5A2B] flex items-center justify-center cursor-pointer relative
                            ${isHighlight ? 'ring-4 ring-green-400 ring-inset' : ''}
                            ${isTarget ? 'bg-[#E4C59E]' : ''}
                          `}
                        onClick={() => handleCellClick(r, c)}
                      >
                        {piece && (
                          <motion.div
                            layoutId={piece.id}
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full p-[3px] z-10 ${
                              piece.player === 'red' 
                                ? 'bg-gradient-to-br from-yellow-300 via-orange-500 to-red-600' 
                                : 'bg-gradient-to-br from-blue-300 via-purple-500 to-zinc-800'
                            } ${isSelected ? 'ring-4 ring-blue-400' : ''}`}
                          >
                            <div className={`w-full h-full rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-xl ${piece.player === 'red' ? 'bg-red-500' : 'bg-zinc-800'}`}>
                              {piece.type}
                            </div>
                          </motion.div>
                        )}
                        {isHighlight && !piece && (
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
                {gameState.turn === 'red' ? '紅方 (帥/兵)' : '黑方 (將/卒)'}
              </span>
            </div>
          </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg border border-zinc-200 w-full max-w-sm lg:w-64">
              <h2 className="text-2xl font-bold mb-4">遊戲規則說明</h2>
              <ul className="list-disc list-inside space-y-2 text-zinc-700">
                <li>玩家分為「黑隊」與「紅隊」。</li>
                <li>黑隊持「將」與「卒」，紅隊持「帥」與「兵」。</li>
                <li>一次只能走一格 (上下左右)。</li>
                <li>「兵」與「卒」可互相吃子，「帥」與「將」可互相吃子。</li>
                <li>紅隊「兵」或「帥」移動到紅色箭頭處 (右下角) 即獲勝。</li>
                <li>黑隊「將」或「卒」移動到黑色箭頭處 (左上角) 即獲勝。</li>
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

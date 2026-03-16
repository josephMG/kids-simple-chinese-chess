import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';

const ROWS = 4;
const COLS = 6;

type Player = 'red' | 'black';
type PieceType = '相' | '象';

interface Position {
  row: number;
  col: number;
}

interface Piece {
  id: string;
  type: PieceType;
  player: Player;
  row: number;
  col: number;
  alive: boolean;
}

interface GameState {
  pieces: Piece[];
  turn: Player;
  selectedPieceId: string | null;
  winner: Player | null;
  mode: 'single' | 'double';
  playerSide: Player;
}

const INITIAL_PIECES: Piece[] = [
  { id: 'red1', type: '相', player: 'red', row: 0, col: 0, alive: true },
  { id: 'red2', type: '相', player: 'red', row: 3, col: 0, alive: true },
  { id: 'black1', type: '象', player: 'black', row: 0, col: 5, alive: true },
  { id: 'black2', type: '象', player: 'black', row: 3, col: 5, alive: true },
];

const INITIAL_STATE: GameState = {
  pieces: INITIAL_PIECES,
  turn: 'black',
  selectedPieceId: null,
  winner: null,
  mode: 'single',
  playerSide: 'red',
};

export default function Game4() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [gameStarted, setGameStarted] = useState(false);

  const getValidMoves = useCallback((piece: Piece, pieces: Piece[]): Position[] => {
    if (!piece.alive) return [];
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
          // Can capture opponent's piece
          moves.push({ row: nr, col: nc });
        }
      }
    }
    return moves;
  }, []);

  const movePiece = useCallback((pieceId: string, toRow: number, toCol: number) => {
    setGameState(prev => {
      if (prev.winner) return prev;

      const newPieces = prev.pieces.map(p => ({ ...p }));
      const pieceToMove = newPieces.find(p => p.id === pieceId);
      if (!pieceToMove) return prev;

      // Check for capture
      const targetPiece = newPieces.find(p => p.row === toRow && p.col === toCol && p.alive);
      if (targetPiece && targetPiece.player !== pieceToMove.player) {
        targetPiece.alive = false;
      }

      pieceToMove.row = toRow;
      pieceToMove.col = toCol;

      // Check win conditions
      let winner: Player | null = null;
      
      const redAlive = newPieces.filter(p => p.player === 'red' && p.alive).length;
      const blackAlive = newPieces.filter(p => p.player === 'black' && p.alive).length;

      if (redAlive === 0) {
        winner = 'black';
      } else if (blackAlive === 0) {
        winner = 'red';
      }

      return {
        ...prev,
        pieces: newPieces,
        turn: prev.turn === 'red' ? 'black' : 'red',
        selectedPieceId: null,
        winner,
      };
    });
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
          // Try to find a capturing move
          const capturingMove = allPossibleMoves.find(m => {
            return gameState.pieces.some(p => p.row === m.move.row && p.col === m.move.col && p.alive && p.player !== gameState.turn);
          });

          if (capturingMove) {
            movePiece(capturingMove.pieceId, capturingMove.move.row, capturingMove.move.col);
            return;
          }

          // Otherwise, move towards the closest opponent piece
          const opponentPieces = gameState.pieces.filter(p => p.player !== gameState.turn && p.alive);
          
          let bestMove = allPossibleMoves[0];
          let minDistance = Infinity;

          allPossibleMoves.forEach(m => {
            let distToNearestOpponent = Infinity;
            opponentPieces.forEach(opp => {
              const dist = Math.abs(m.move.row - opp.row) + Math.abs(m.move.col - opp.col);
              if (dist < distToNearestOpponent) {
                distToNearestOpponent = dist;
              }
            });

            if (distToNearestOpponent < minDistance) {
              minDistance = distToNearestOpponent;
              bestMove = m;
            }
          });

          movePiece(bestMove.pieceId, bestMove.move.row, bestMove.move.col);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameState, gameStarted, movePiece, getValidMoves]);

  const handleCellClick = (row: number, col: number) => {
    if (!gameStarted || gameState.winner) return;
    if (gameState.mode === 'single' && gameState.turn !== gameState.playerSide) return;

    const clickedPiece = gameState.pieces.find(p => p.row === row && p.col === col && p.alive);

    if (gameState.selectedPieceId) {
      const selectedPiece = gameState.pieces.find(p => p.id === gameState.selectedPieceId);
      if (selectedPiece) {
        const validMoves = getValidMoves(selectedPiece, gameState.pieces);
        const isValidMove = validMoves.some(m => m.row === row && m.col === col);

        if (isValidMove) {
          movePiece(selectedPiece.id, row, col);
          return;
        }
      }
    }

    if (clickedPiece && clickedPiece.player === gameState.turn) {
      setGameState(prev => ({ ...prev, selectedPieceId: clickedPiece.id }));
    } else {
      setGameState(prev => ({ ...prev, selectedPieceId: null }));
    }
  };

  const startGame = (mode: 'single' | 'double', playerSide: Player = 'red') => {
    setGameState({
      ...INITIAL_STATE,
      pieces: INITIAL_PIECES.map(p => ({ ...p })),
      mode,
      playerSide,
      turn: 'black',
    });
    setGameStarted(true);
  };

  const selectedPiece = gameState.pieces.find(p => p.id === gameState.selectedPieceId);
  const validMoves = selectedPiece ? getValidMoves(selectedPiece, gameState.pieces) : [];

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto">
      {!gameStarted ? (
        <>
          <h1 className="text-4xl font-bold mb-8 text-zinc-800">雙相象棋</h1>
          <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center gap-6">
            <h2 className="text-2xl font-bold text-zinc-800">選擇遊戲模式</h2>
            <div className="flex flex-col gap-4 w-full">
              <button 
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-xl transition-colors text-lg"
                onClick={() => startGame('double')}
              >
                雙人遊戲
              </button>
              <button 
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-xl transition-colors text-lg"
                onClick={() => startGame('single', 'red')}
              >
                單人遊戲 (玩家持紅隊)
              </button>
              <button 
                className="w-full bg-zinc-800 hover:bg-zinc-900 text-white font-bold py-4 px-8 rounded-xl transition-colors text-lg"
                onClick={() => startGame('single', 'black')}
              >
                單人遊戲 (玩家持黑隊)
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 w-full mb-8 min-h-[80px]">
            <h1 className="text-3xl md:text-4xl font-bold text-zinc-800 m-0 text-center">雙相象棋</h1>
            {gameState.winner && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-md flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                <p className="font-bold text-lg md:text-xl m-0 text-center sm:text-left">
                  遊戲結束！{gameState.winner === 'red' ? '紅方' : '黑方'}獲勝！
                </p>
                <button 
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition-colors whitespace-nowrap w-full sm:w-auto"
                  onClick={() => setGameStarted(false)}
                >
                  重新開始
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-12 lg:gap-20 w-full">
            <div className="flex flex-col items-center gap-6">
              <div className={`bg-[#E4C59E] p-4 rounded-lg shadow-2xl border-4 transition-colors duration-500 ${
                !gameState.winner ? (
                  gameState.turn === 'red' ? 'border-pulse-red' : 'border-pulse-black'
                ) : 'border-[#8B5A2B]'
              }`}>
                <div className="grid grid-cols-6 gap-0 border-2 border-[#8B5A2B] bg-[#F5DEB3]">
                {Array(ROWS).fill(null).map((_, r) =>
                  Array(COLS).fill(null).map((_, c) => {
                    const piece = gameState.pieces.find(p => p.row === r && p.col === c && p.alive);
                    const isSelected = piece && piece.id === gameState.selectedPieceId;
                    const isValidMove = validMoves.some(m => m.row === r && m.col === c);
                    
                    return (
                      <div 
                        key={`${r}-${c}`}
                        className={`
                          w-12 h-12 sm:w-16 sm:h-16 border border-[#8B5A2B] flex items-center justify-center relative cursor-pointer
                          ${isValidMove ? 'ring-4 ring-green-400 ring-inset' : ''}
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
                        {isValidMove && !piece && (
                          <div className="w-4 h-4 rounded-full bg-green-400 opacity-50" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            
            {/* 當前回合 */}
            <div className="bg-white px-8 py-3 rounded-full shadow-md border border-zinc-200 flex items-center gap-4">
              <span className="text-lg font-bold text-zinc-700">當前回合：</span>
              <span className={`text-xl font-bold ${gameState.turn === 'red' ? 'text-red-500' : 'text-zinc-800'}`}>
                {gameState.turn === 'red' ? '紅方 (相)' : '黑方 (象)'}
              </span>
            </div>
          </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg border border-zinc-200 w-full max-w-sm lg:w-64">
              <h2 className="text-2xl font-bold mb-4">遊戲規則說明</h2>
              <ul className="list-disc list-inside space-y-2 text-zinc-700">
                <li>玩家分為「黑隊」與「紅隊」。</li>
                <li>紅隊持 2 顆「相」，黑隊持 2 顆「象」。</li>
                <li>一次只能走一格 (上下左右)。</li>
                <li>雙方皆可吃掉對方的棋子。</li>
                <li>率先將對方的 2 顆棋子全部吃光即獲勝。</li>
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

export type Player = 'red' | 'black';
export type Cell = Player | null;
export type Position = { row: number; col: number };
export type GameMode = 'single' | 'double';
export type GameState = {
  board: Cell[][];
  redCommanderPos: Position;
  redSoldierPos: Position;
  blackGeneralPos: Position;
  blackSoldierPos: Position;
  turn: Player;
  winner: Player | 'draw' | null;
  mode: GameMode;
  playerSide: Player | null; // For single player mode
};

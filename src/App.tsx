/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Game1 from './components/Game1';
import Game2 from './components/Game2';
import Game3 from './components/Game3';
import Game4 from './components/Game4';

type GameType = '大兵小將' | '小帥小將' | '雙仕對卒' | '雙相象棋';

export default function App() {
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [showRules, setShowRules] = useState(false);

  if (!selectedGame) {
    return (
      <div className="min-h-screen bg-zinc-100 flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-8">遊戲主選單</h1>
        <div className="flex gap-4">
          <button className="bg-blue-500 text-white p-6 rounded-xl text-xl" onClick={() => setSelectedGame('大兵小將')}>大兵小將</button>
          <button className="bg-purple-500 text-white p-6 rounded-xl text-xl" onClick={() => setSelectedGame('小帥小將')}>小帥小將</button>
          <button className="bg-emerald-500 text-white p-6 rounded-xl text-xl" onClick={() => setSelectedGame('雙仕對卒')}>雙仕對卒</button>
          <button className="bg-amber-500 text-white p-6 rounded-xl text-xl" onClick={() => setSelectedGame('雙相象棋')}>雙相象棋</button>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-zinc-500">
          <p>© 2026 遊戲靈感來源：Threads @幼教老師起步驟</p>
        </div>
      </div>
    );
  }

  if (!showRules) {
    return (
      <div className="min-h-screen bg-zinc-100 flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold mb-4">{selectedGame} - 規則說明</h1>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-zinc-200 w-full max-w-md mb-8">
          {selectedGame === '大兵小將' ? (
            <ul className="list-disc list-inside space-y-2 text-zinc-700">
              <li>玩家分為「黑隊」與「紅隊」。</li>
              <li>玩家1持黑棋「將」，玩家2持紅棋「兵」。</li>
              <li>一次只能走一格。</li>
              <li>「兵」吃到「將」即紅隊獲勝，或「將」由起點移動到黑色箭頭處，即黑隊獲勝。</li>
              <li>黑方 (將) 不可移動至紅方 (兵) 所在位置。</li>
            </ul>
          ) : selectedGame === '小帥小將' ? (
            <ul className="list-disc list-inside space-y-2 text-zinc-700">
              <li>玩家分為「黑隊」與「紅隊」。</li>
              <li>黑隊持「將」與「卒」，紅隊持「帥」與「兵」。</li>
              <li>一次只能走一格 (上下左右)。</li>
              <li>「兵」與「卒」可互相吃子，「帥」與「將」可互相吃子。</li>
              <li>紅隊「兵」或「帥」移動到紅色箭頭處 (右下角) 即獲勝。</li>
              <li>黑隊「將」或「卒」移動到黑色箭頭處 (左上角) 即獲勝。</li>
            </ul>
          ) : selectedGame === '雙仕對卒' ? (
            <ul className="list-disc list-inside space-y-2 text-zinc-700">
              <li>玩家分為「黑隊」與「紅隊」。</li>
              <li>紅隊持 2 顆「仕」，黑隊持 4 顆「卒」。</li>
              <li>一次只能走一格 (上下左右)。</li>
              <li>紅方「仕」可以吃掉黑方「卒」，黑方「卒」不能吃子。</li>
              <li>紅隊將 4 顆「卒」全部吃光即獲勝。</li>
              <li>黑隊只要有任何 1 顆「卒」移動到左方箭頭處即獲勝。</li>
            </ul>
          ) : (
            <ul className="list-disc list-inside space-y-2 text-zinc-700">
              <li>玩家分為「黑隊」與「紅隊」。</li>
              <li>紅隊持 2 顆「相」，黑隊持 2 顆「象」。</li>
              <li>一次只能走一格 (上下左右)。</li>
              <li>雙方皆可吃掉對方的棋子。</li>
              <li>率先將對方的 2 顆棋子全部吃光即獲勝。</li>
            </ul>
          )}
        </div>
        <div className="flex gap-4">
          <button className="bg-zinc-500 text-white p-4 rounded-xl" onClick={() => setSelectedGame(null)}>返回主選單</button>
          <button className="bg-zinc-800 text-white p-4 rounded-xl" onClick={() => setShowRules(true)}>確認並選擇模式</button>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-zinc-500">
          <p>© 2026 遊戲靈感來源：Threads @幼教老師起步驟</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col items-center p-4">
      <div className="w-full max-w-7xl mx-auto flex flex-col">
        <div className="w-full flex justify-start mb-4">
          <button 
            className="bg-zinc-200 text-zinc-800 px-4 py-2 rounded-lg hover:bg-zinc-300 transition-colors shadow-sm font-medium"
            onClick={() => { setSelectedGame(null); setShowRules(false); }}
          >
            返回主選單
          </button>
        </div>
        <div className="flex flex-col items-center justify-center w-full">
          {selectedGame === '大兵小將' ? <Game1 /> : selectedGame === '小帥小將' ? <Game2 /> : selectedGame === '雙仕對卒' ? <Game3 /> : <Game4 />}
        </div>
      </div>
    </div>
  );
}

import type { BoardState } from '@/types/game'
import { createInitialState } from './state'
import { BoardScene } from './scene/three'
import { Interaction } from './input/interaction'

export type GameController = {
  destroy(): void;
  getState(): BoardState;
  resize(): void;
}

export function createGame(mountEl: HTMLDivElement): GameController {
  const state = createInitialState();
  const scene = new BoardScene(mountEl);
  scene.init();
  scene.syncPieces(state);

  const inter = new Interaction(mountEl, scene, state, (s) => {
    // 状態が変わったときに必要ならここで通知や保存を行う
    scene.syncPieces(s); // 今は念のため再同期（即時反映しているので省略可）
  });

  let raf = 0;
  const loop = () => {
    raf = requestAnimationFrame(loop);
    scene.render();
  };
  loop();

  function destroy() {
    cancelAnimationFrame(raf);
    inter.destroy();
    scene.dispose();
  }

  function resize() {
    scene.resize();
  }

  return { destroy, getState: () => state, resize };
}
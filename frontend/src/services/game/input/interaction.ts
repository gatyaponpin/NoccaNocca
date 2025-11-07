import * as THREE from 'three'
import type { BoardState, Piece } from '../../../types/game'
import { legalMoves, movePiece, topPieceAt } from '../state'
import { BoardScene, markerYAboveTop } from '../scene/three'

export class Interaction {
  private ray = new THREE.Raycaster();
  private ndc = new THREE.Vector2();
  private selected: Piece | null = null;

  constructor(
    private el: HTMLDivElement,
    private scene: BoardScene,
    private state: BoardState,
    private onStateChanged: (state: BoardState)=>void
  ){
    this.onPointerDown = this.onPointerDown.bind(this);
    el.addEventListener('pointerdown', this.onPointerDown);
  }

  destroy() {
    this.el.removeEventListener('pointerdown', this.onPointerDown);
  }

  private setPointer(ev: PointerEvent) {
    const rect = (this.scene.renderer.domElement as HTMLCanvasElement).getBoundingClientRect();
    this.ndc.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    this.ndc.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
  }

  /**
   * 画面をクリックした際の処理
   * @param ev 
   * @returns 
   */
  private onPointerDown(ev: PointerEvent) {
    this.setPointer(ev);
    this.ray.setFromCamera(this.ndc, this.scene.camera);

    // 1) マーカーヒット（優先）
    const markerHits = this.ray.intersectObjects(this.scene.markers, false);
    if (markerHits[0] && this.selected) {
      const obj = markerHits[0].object as THREE.Mesh
      const { col, row } = obj.userData as { col: number; row: number }
      const ok = movePiece(this.state, this.selected.id, { col, row })
      if (ok) {
        this.scene.syncPieces(this.state)
        this.onStateChanged(this.state)
      }
      this.selected = null
      this.scene.clearMarkers()
      return
   }

    // 2) 駒ヒット
    const pieceMeshes = [...this.scene.meshes.values()];
    const hits = this.ray.intersectObjects(pieceMeshes, false);
    if (hits[0]) {
      const mesh = hits[0].object as THREE.Mesh;
      const pieceId: string = mesh.userData.pieceId;
      const piece = this.state.pieces.find(p => p.id === pieceId) || null;
      if (!piece) return;

      const top = topPieceAt(this.state, piece.col, piece.row) || piece;

      this.selected = top;
      this.scene.clearMarkers();

      // 選択切替 & 候補表示
      this.selected = piece;
      this.scene.clearMarkers();
      for (const cell of legalMoves(this.state, piece)) {
        const topOnDest = topPieceAt(this.state, cell.col, cell.row);
        const y = markerYAboveTop(topOnDest?.level);
        this.scene.addMarkerAt(cell.col, cell.row, y);
      }
      return;
    }

    // 3) 空白クリック → 解除
    this.selected = null;
    this.scene.clearMarkers();
  }
}
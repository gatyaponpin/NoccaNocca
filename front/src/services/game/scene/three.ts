import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { COLS, ROWS, CELL, BOARD_H, GRID_LIFT, PIECE_H, PIECE_SIZE, PIECE_RADIUS, PIECE_LIFT, STACK_GAP } from '../constants'
import type { BoardState } from '@/types/game'

const HALF_W = (COLS * CELL) / 2;
const HALF_H = (ROWS * CELL) / 2;

export function cellToWorld(col: number, row: number) {
  const x = -HALF_W + CELL/2 + col * CELL;
  const z = -HALF_H + CELL/2 + row * CELL;
  return { x, z };
}
// ボード上面から: 下段中心の高さ + (段差)
export function pieceCenterY(level = 0) {
  return BOARD_H/2 + PIECE_LIFT + (PIECE_H/2) + level * (PIECE_H + STACK_GAP);
}
export function markerYAboveTop(topLevel?: number) {
  if (topLevel == null) return BOARD_H/2 + GRID_LIFT + 0.01;         // 空マス
  const topSurface = pieceCenterY(topLevel) + (PIECE_H/2);
  return topSurface + 0.02;                                          // ほんの少し上
}

export class BoardScene {
  renderer!: THREE.WebGLRenderer;
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  controls!: OrbitControls;

  private pieceGeo = new RoundedBoxGeometry(PIECE_SIZE, PIECE_H, PIECE_SIZE, 5, PIECE_RADIUS);
  private whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.1 });
  private blackMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3, metalness: 0.1 });

  /** piece.id -> mesh */
  meshes = new Map<string, THREE.Mesh>();
  /** 移動候補マーカー */
  markers: THREE.Mesh[] = [];

  constructor(private mount: HTMLDivElement) {}

  init() {
    const w = this.mount.clientWidth, h = this.mount.clientHeight;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);
    this.renderer.shadowMap.enabled = true;
    this.mount.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);

    this.camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    this.camera.position.set(4.5, 7.2, 8.2);
    this.camera.lookAt(0,0,0);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.target.set(0, BOARD_H/2, 0);

    // lights
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(6, 10, 6);
    dir.castShadow = true;
    dir.shadow.mapSize.set(1024, 1024);
    this.scene.add(dir);

    // board
    const geom = new THREE.BoxGeometry(COLS*CELL, BOARD_H, ROWS*CELL);
    const mat  = new THREE.MeshStandardMaterial({
      color: 0xeeeeee, roughness: 0.8, metalness: 0,
      polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1
    });
    const board = new THREE.Mesh(geom, mat);
    board.receiveShadow = true;
    board.position.set(0, BOARD_H/2, 0);
    this.scene.add(board);

    // grid
    this.addGridLines(BOARD_H/2 + GRID_LIFT);
  }

  addGridLines(y: number) {
    const m = new THREE.LineBasicMaterial({ color: 0x6e6e6e, depthTest: false, transparent: true });
    const g = new THREE.Group(); g.renderOrder = 10;
    for (let c = 0; c<=COLS; c++) {
      const x = -HALF_W + c*CELL;
      const bg = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x,y,-HALF_H), new THREE.Vector3(x,y,+HALF_H)]);
      g.add(new THREE.Line(bg, m));
    }
    for (let r = 0; r<=ROWS; r++) {
      const z = -HALF_H + r*CELL;
      const bg = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-HALF_W,y,z), new THREE.Vector3(+HALF_W,y,z)]);
      g.add(new THREE.Line(bg, m));
    }
    this.scene.add(g);
  }

  /** 状態→メッシュへ（初回生成または位置同期） */
  syncPieces(state: BoardState) {
    for (const p of state.pieces) {
      let mesh = this.meshes.get(p.id);
      const pos = cellToWorld(p.col, p.row);
      const y = pieceCenterY(p.level ?? 0);
      if (!mesh) {
        mesh = new THREE.Mesh(this.pieceGeo, p.color === 'WHITE' ? this.whiteMat : this.blackMat);
        mesh.castShadow = true;
        mesh.position.set(pos.x, y, pos.z);
        mesh.userData.type = 'piece';
        mesh.userData.pieceId = p.id;
        this.scene.add(mesh);
        this.meshes.set(p.id, mesh);
      } else {
        mesh.position.set(pos.x, y, pos.z);
      }
    }
  }

  clearMarkers() {
    for (const m of this.markers) this.scene.remove(m);
    this.markers.length = 0;
  }

  addMarkerAt(col: number, row: number, y: number) {
    const { x, z } = cellToWorld(col, row);
    const geo = new THREE.CircleGeometry(0.40, 24);
    const mat = new THREE.MeshBasicMaterial({ 
      color: 0x2196f3,
      opacity: 0.35,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const marker = new THREE.Mesh(geo, mat);
    marker.rotation.x = -Math.PI/2;
    marker.position.set(x, y, z);
    marker.userData = { type: 'marker', col, row };
    marker.renderOrder = 20
    this.scene.add(marker);
    this.markers.push(marker);
  }

  resize() {
    const w = this.mount.clientWidth, h = this.mount.clientHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  render() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.mount.removeChild(this.renderer.domElement);
    this.controls.dispose();
    this.renderer.dispose();
    this.meshes.clear();
    this.clearMarkers();
  }
}
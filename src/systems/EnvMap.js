// EnvMap.js — the one shared image-based lighting environment.
//
// Extracted from EmblemScene.js on 2026-09-05, when the Atalanta Fugiens side
// was removed from the site (DECISIONS.md). This was the only thing the
// Hypnerotomachia world still needed from that module, and keeping a whole
// emblem-scene engine loaded to get one PMREM texture was not worth it.
//
// Generated once from RoomEnvironment — no HDRI file to fetch — and shared
// across every scene for the app's lifetime, so that MeshStandardMaterial has
// something to reflect and metal does not read as flat paint.

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

let _sharedEnv = null;

export function getEnvMap(renderer) {
  if (_sharedEnv) return _sharedEnv;
  const pmrem = new THREE.PMREMGenerator(renderer);
  _sharedEnv = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  return _sharedEnv;
}

// game/stage3d.js — mounts the actual Dream Garden behind the novel's text.
//
// This is the combinability claim of GAMIFYVRHP.md §5 made real: the visual
// novel's backdrop is not a picture of the world, it IS the world —
// HPWorldScene, built live, camera parked at whichever station the current
// scene names, gliding between them as the reader turns the page. Every
// improvement to the garden improves the novel for free.
//
// Opt-in (the button in the novel's masthead), because it downloads and runs
// the full 3-D world. The walker's input listeners are removed immediately
// after build so the reader's keys drive the story, never the stage.

export async function mountStage(stageEl, initialStation) {
  const THREE = await import('three');
  const { EffectComposer } = await import('three/addons/postprocessing/EffectComposer.js');
  const { RenderPass } = await import('three/addons/postprocessing/RenderPass.js');
  const { UnrealBloomPass } = await import('three/addons/postprocessing/UnrealBloomPass.js');
  const { HPWorldScene, HP_STATIONS } = await import('../src/scenes/HPWorldScene.js?v=40');

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
  stageEl.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(new THREE.Scene(), new THREE.PerspectiveCamera()));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.35, 0.4, 0.85));

  const scene = new HPWorldScene(renderer, composer, { style: 'lit', station: initialStation });
  await scene.build();
  scene.walker.dispose();               // stage takes no input
  composer.passes[0].scene = scene.scene;
  composer.passes[0].camera = scene.camera;

  const resize = () => {
    const w = stageEl.clientWidth || window.innerWidth;
    const h = stageEl.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    scene.camera.aspect = w / h;
    scene.camera.updateProjectionMatrix();
  };
  window.addEventListener('resize', resize);
  resize();

  const clock = new THREE.Clock();
  (function tick() {
    requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05);
    scene.update(dt);                   // walker glide + all the living systems
    composer.render();
  })();

  return {
    // glide the parked camera to the station a novel scene names
    park(stationKey) {
      const st = HP_STATIONS.find(s => s.key === stationKey);
      if (!st) return;
      const yaw = scene.walker.yawToward(st.pos, st.look);
      scene.walker.teleportTo(st.pos[0], st.pos[1], yaw, st.pitch ?? -0.04, 2.4);
    },
  };
}

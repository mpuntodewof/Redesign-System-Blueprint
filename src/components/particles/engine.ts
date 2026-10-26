import * as THREE from "three";
import { FRAGMENT_SHADER, VERTEX_SHADER } from "./shaders";
import { createRng, shapeCore, shapeMesh, shapeSphere, shapeStack, shapeText } from "./shapes";
import { onStageSourceChange, sampleStage, type StageSample } from "./stage";

export type FieldTheme = "dark" | "light";

export interface ParticleEngine {
  setTheme(theme: FieldTheme): void;
  dispose(): void;
}

/** Below this width the content is single-column, so the shape centres behind it. */
const NARROW = 1280;

const THEMES: Record<FieldTheme, { a: string; b: string; c: string; opacity: number; blending: THREE.Blending }> = {
  // Additive glow on navy.
  dark: { a: "#3B82F6", b: "#60A5FA", c: "#E6F0FF", opacity: 0.8, blending: THREE.AdditiveBlending },
  // Additive light vanishes on a pale page, so light mode paints ink-like azure dots.
  light: { a: "#1D4ED8", b: "#3B82F6", c: "#0B1A33", opacity: 0.5, blending: THREE.NormalBlending },
};

/**
 * Mounts the WebGL particle field on `canvas`. Returns null when WebGL is
 * unavailable so the caller can show the CSS fallback.
 */
export function createParticleEngine(canvas: HTMLCanvasElement, onFailure: () => void): ParticleEngine | null {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = window.matchMedia("(max-width: 760px), (pointer: coarse)").matches;

  let renderer: THREE.WebGLRenderer;
  try {
    const probe = document.createElement("canvas");
    if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) return null;
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
  } catch {
    return null;
  }

  let failed = false;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.debug.checkShaderErrors = true;
  renderer.debug.onShaderError = (gl, program, vs, fs) => {
    console.error(
      "[particle-field] shader error",
      gl.getProgramInfoLog(program),
      gl.getShaderInfoLog(vs),
      gl.getShaderInfoLog(fs),
    );
    failed = true;
    onFailure();
  };

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 9.5);

  const count = mobile ? 4000 : 16000;
  const rand = createRng(20251026);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(shapeSphere(count, rand), 3));
  geometry.setAttribute("aMesh", new THREE.BufferAttribute(shapeMesh(count, rand), 3));
  geometry.setAttribute("aStack", new THREE.BufferAttribute(shapeStack(count, rand), 3));
  // Filled once the font is ready; until then the text stage collapses to the origin.
  geometry.setAttribute("aText", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geometry.setAttribute("aCore", new THREE.BufferAttribute(shapeCore(count, rand), 3));
  const random = new Float32Array(count * 4);
  for (let i = 0; i < random.length; i++) random[i] = rand();
  geometry.setAttribute("aRand", new THREE.BufferAttribute(random, 4));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 12);

  const baseOpacity = { value: THEMES.dark.opacity * (mobile ? 1.1 : 1) };
  const material = new THREE.ShaderMaterial({
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uStage: { value: 0 },
      uDrift: { value: reduce ? 0 : 0.06 },
      uMorphNoise: { value: reduce ? 0 : 1 },
      uSize: { value: mobile ? 30 : 24 },
      uPR: { value: renderer.getPixelRatio() },
      uRepel: { value: 0 },
      uRadius: { value: 0.32 },
      uAspect: { value: window.innerWidth / window.innerHeight },
      uMouse: { value: new THREE.Vector2(9, 9) },
      uColA: { value: new THREE.Color(THEMES.dark.a) },
      uColB: { value: new THREE.Color(THEMES.dark.b) },
      uColC: { value: new THREE.Color(THEMES.dark.c) },
      uOpacity: { value: baseOpacity.value },
    },
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);

  const initial = sampleStage();
  const state = {
    stage: initial.stage,
    x: initial.x,
    dim: initial.dim,
    t: 0,
    mx: 9,
    my: 9,
    tmx: 9,
    tmy: 9,
    repel: 0,
    targetRepel: 0,
  };
  let halfWidth = 6;
  let disposed = false;

  const resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    material.uniforms.uAspect.value = w / h;
    material.uniforms.uPR.value = renderer.getPixelRatio();
    halfWidth = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z * camera.aspect;
    points.scale.setScalar(w < NARROW ? Math.min(1, halfWidth / 3.4) : Math.min(1.08, halfWidth / 5.4));
  };

  const render = () => {
    if (failed || disposed) return;
    const u = material.uniforms;
    const narrow = window.innerWidth < NARROW;
    u.uStage.value = state.stage;
    u.uTime.value = state.t;
    u.uMouse.value.set(state.mx, state.my);
    u.uRepel.value = state.repel;
    u.uOpacity.value = baseOpacity.value * state.dim;
    points.position.x = narrow ? 0 : state.x * halfWidth;
    points.position.y = narrow ? 0.6 : 0;
    if (!reduce && state.mx !== 9) {
      camera.position.x += (state.mx * 0.55 - camera.position.x) * 0.04;
      camera.position.y += (state.my * 0.35 - camera.position.y) * 0.04;
    }
    camera.lookAt(points.position.x * 0.15, 0, 0);
    renderer.render(scene, camera);
  };

  resize();
  renderer.compile(scene, camera);

  shapeText(count, rand).then((positions) => {
    if (disposed) return;
    (geometry.attributes.aText.array as Float32Array).set(positions);
    geometry.attributes.aText.needsUpdate = true;
    render();
  });

  /* ---- input ---- */
  const onPointerMove = (event: PointerEvent) => {
    state.tmx = (event.clientX / window.innerWidth) * 2 - 1;
    state.tmy = -(event.clientY / window.innerHeight) * 2 + 1;
    if (state.mx === 9) {
      state.mx = state.tmx;
      state.my = state.tmy;
    }
    state.targetRepel = event.pointerType === "touch" ? 0 : 1;
  };
  const onPointerOut = () => {
    state.targetRepel = 0;
  };

  /* ---- loop ---- */
  let raf = 0;
  let last = performance.now();
  let running = false;

  const follow = (target: StageSample, rate: number) => {
    state.stage += (target.stage - state.stage) * rate;
    state.x += (target.x - state.x) * rate;
    state.dim += (target.dim - state.dim) * rate;
  };

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    // Critically damped follow: scrubbed to scroll, never jittery, and a route
    // change morphs smoothly from wherever the field currently is.
    follow(sampleStage(), 1 - Math.exp(-dt * 7));
    if (state.mx !== 9) {
      state.mx += (state.tmx - state.mx) * (1 - Math.exp(-dt * 10));
      state.my += (state.tmy - state.my) * (1 - Math.exp(-dt * 10));
    }
    state.repel += (state.targetRepel - state.repel) * (1 - Math.exp(-dt * 5));
    state.t += dt;
    render();
  };
  const start = () => {
    if (running || reduce || disposed) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };
  const onVisibility = () => (document.hidden ? stop() : start());

  /* Reduced motion: one still frame per section, switched rather than tweened. */
  let staticRaf = 0;
  const staticFrame = () => {
    cancelAnimationFrame(staticRaf);
    staticRaf = requestAnimationFrame(() => {
      const target = sampleStage();
      state.stage = Math.round(target.stage);
      state.x = target.x;
      state.dim = target.dim;
      render();
    });
  };

  let resizeTimer = 0;
  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      resize();
      if (reduce) staticFrame();
    }, 120);
  };
  window.addEventListener("resize", onResize);

  let releaseSource = () => {};
  if (reduce) {
    window.addEventListener("scroll", staticFrame, { passive: true });
    releaseSource = onStageSourceChange(staticFrame);
    staticFrame();
  } else {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onPointerOut);
    window.addEventListener("blur", onPointerOut);
    document.addEventListener("visibilitychange", onVisibility);
    if (!document.hidden) start();
  }

  return {
    setTheme(theme) {
      const palette = THEMES[theme];
      material.uniforms.uColA.value.set(palette.a);
      material.uniforms.uColB.value.set(palette.b);
      material.uniforms.uColC.value.set(palette.c);
      baseOpacity.value = palette.opacity * (mobile ? 1.1 : 1);
      material.blending = palette.blending;
      material.needsUpdate = true;
      if (reduce) staticFrame();
    },
    dispose() {
      disposed = true;
      stop();
      cancelAnimationFrame(staticRaf);
      window.clearTimeout(resizeTimer);
      releaseSource();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", staticFrame);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("mouseleave", onPointerOut);
      window.removeEventListener("blur", onPointerOut);
      document.removeEventListener("visibilitychange", onVisibility);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}

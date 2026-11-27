// ONCE UPON A WHY: materials and small geometry helpers (bible §2 "Materials").
// Everything is MATTE (roughness 0.7–0.95, no clearcoat) and FLAT SHADED, so rounded shapes show a very slight
// low-poly faceting. Emissive parts (neon, bulbs, screens) push above 1.0 so the bloom pass picks them up.
import * as THREE from "three";

const MATS = new Map<string, THREE.Material>();

/** matte, faceted toy material */
export const matte = (c: string, rough = 0.82, opts: { flat?: boolean; side?: THREE.Side; metal?: number; env?: number } = {}) => {
  const k = `m|${c}|${rough}|${opts.flat ?? true}|${opts.side ?? 0}|${opts.metal ?? 0}|${opts.env ?? 1}`;
  let m = MATS.get(k);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color: c,
      roughness: rough,
      metalness: opts.metal ?? 0,
      flatShading: opts.flat ?? true,
      side: opts.side ?? THREE.FrontSide,
      envMapIntensity: opts.env ?? 1,
    });
    MATS.set(k, m);
  }
  return m;
};

/** brushed chrome (cassette player, train, lamp stems). Still soft: roughness 0.35. */
export const chrome = (c = "#C9CDD6") => matte(c, 0.35, { metal: 0.85, flat: true });

/** glowing material: neon tubes, bulbs, screens. intensity > 1 blooms */
export const glow = (c: string, intensity = 2.5) => {
  const k = `g|${c}|${intensity}`;
  let m = MATS.get(k);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color: "#000000", emissive: c, emissiveIntensity: intensity, roughness: 1, toneMapped: true });
    MATS.set(k, m);
  }
  return m;
};

/** unlit flat colour (decals, face ink) */
export const flat = (c: string, opacity = 1, depthWrite = true) => {
  const k = `f|${c}|${opacity}|${depthWrite}`;
  let m = MATS.get(k);
  if (!m) {
    m = new THREE.MeshBasicMaterial({ color: c, transparent: opacity < 1, opacity, depthWrite, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, toneMapped: true });
    MATS.set(k, m);
  }
  return m;
};

/** matte decal that still takes light (face features, freckles), drawn on top of its surface */
export const decal = (c: string, opacity = 1, rough = 0.9) => {
  const k = `d|${c}|${opacity}|${rough}`;
  let m = MATS.get(k);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color: c, roughness: rough, transparent: opacity < 1, opacity, depthWrite: opacity >= 1, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
    MATS.set(k, m);
  }
  return m;
};

/** paint a geometry facet by facet: fn(centroid) → colour. Returns a NON-indexed geometry with vertex colours. */
export const paint = (geo: THREE.BufferGeometry, fn: (x: number, y: number, z: number) => string) => {
  const g = geo.index ? geo.toNonIndexed() : geo;
  const pos = g.getAttribute("position");
  const col = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i += 3) {
    const x = (pos.getX(i) + pos.getX(i + 1) + pos.getX(i + 2)) / 3;
    const y = (pos.getY(i) + pos.getY(i + 1) + pos.getY(i + 2)) / 3;
    const z = (pos.getZ(i) + pos.getZ(i + 1) + pos.getZ(i + 2)) / 3;
    c.set(fn(x, y, z)).convertSRGBToLinear();
    for (let j = 0; j < 3; j++) col.set([c.r, c.g, c.b], (i + j) * 3);
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
};

const VC = new Map<string, THREE.Material>();
/** matte material that uses vertex colours (for paint()) */
export const painted = (rough = 0.82, side: THREE.Side = THREE.FrontSide) => {
  const k = `${rough}|${side}`;
  let m = VC.get(k);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: rough, flatShading: true, side });
    VC.set(k, m);
  }
  return m;
};

// ---------- canvas textures (cached by id) ----------
const TEX = new Map<string, THREE.CanvasTexture>();
export const canvasTex = (id: string, w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, opts: { repeat?: [number, number]; srgb?: boolean } = {}) => {
  let t = TEX.get(id);
  if (!t) {
    const cv = document.createElement("canvas");
    cv.width = w;
    cv.height = h;
    const g = cv.getContext("2d")!;
    draw(g, w, h);
    t = new THREE.CanvasTexture(cv);
    if (opts.srgb !== false) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    if (opts.repeat) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(...opts.repeat);
    }
    TEX.set(id, t);
  }
  return t;
};

/** a texture redrawn every frame (split-flap, screens with motion). Re-uses one canvas per id. */
const LIVE = new Map<string, { t: THREE.CanvasTexture; g: CanvasRenderingContext2D; key: string }>();
export const liveTex = (id: string, w: number, h: number, key: string, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void) => {
  let e = LIVE.get(id);
  if (!e) {
    const cv = document.createElement("canvas");
    cv.width = w;
    cv.height = h;
    const g = cv.getContext("2d")!;
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    e = { t, g, key: "" };
    LIVE.set(id, e);
  }
  if (e.key !== key) {
    e.g.clearRect(0, 0, w, h);
    draw(e.g, w, h);
    e.t.needsUpdate = true;
    e.key = key;
  }
  return e.t;
};

const TMATS = new Map<string, THREE.Material>();
/** matte material with a texture map */
export const texMat = (id: string, map: THREE.Texture, opts: { rough?: number; emissive?: number; transparent?: boolean; basic?: boolean; additive?: boolean; opacity?: number; side?: THREE.Side } = {}) => {
  const k = `${id}|${JSON.stringify(opts)}`;
  let m = TMATS.get(k);
  if (!m) {
    if (opts.basic) {
      m = new THREE.MeshBasicMaterial({ map, transparent: opts.transparent || opts.additive, opacity: opts.opacity ?? 1, blending: opts.additive ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: !opts.additive && !opts.transparent, side: opts.side ?? THREE.FrontSide });
    } else {
      m = new THREE.MeshStandardMaterial({
        map,
        roughness: opts.rough ?? 0.85,
        transparent: opts.transparent,
        opacity: opts.opacity ?? 1,
        emissiveMap: opts.emissive ? map : null,
        emissive: opts.emissive ? new THREE.Color("#ffffff") : new THREE.Color("#000000"),
        emissiveIntensity: opts.emissive ?? 0,
        side: opts.side ?? THREE.FrontSide,
      });
    }
    TMATS.set(k, m);
  } else if ((m as THREE.MeshBasicMaterial).map !== map) {
    (m as THREE.MeshBasicMaterial).map = map;
  }
  return m;
};

// ---------- deterministic noise ----------
export const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
export const rng = (seed: number) => {
  let s = Math.floor(seed * 9973) % 2147483647 || 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

export type V3 = [number, number, number];
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** 0→1 progress between frames a and b, eased */
export const prog = (f: number, a: number, b: number) => smooth((f - a) / (b - a));
/** damped overshoot spring 0→1 for squash / pop moves (t in frames since start) */
export const springy = (t: number, k = 0.22, damp = 0.12) => (t <= 0 ? 0 : 1 - Math.exp(-damp * t) * Math.cos(k * t));

/** soft translucent material (steam, dust, holograms). Opacity is quantised so materials are re-used. */
export const fade = (c: string, opacity: number, opts: { additive?: boolean; emissive?: number } = {}) => {
  const o = Math.round(Math.max(0, Math.min(1, opacity)) * 40) / 40;
  const k = `fa|${c}|${o}|${opts.additive ? 1 : 0}|${opts.emissive ?? 0}`;
  let m = MATS.get(k);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color: c,
      transparent: true,
      opacity: o,
      depthWrite: false,
      roughness: 1,
      flatShading: true,
      emissive: opts.emissive ? c : "#000000",
      emissiveIntensity: opts.emissive ?? 0,
      blending: opts.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    MATS.set(k, m);
  }
  return m;
};

/** a rounded block with gently faceted corners (Claude, furniture): box subdivided, corners pushed round */
export const roundedBlock = (w: number, h: number, d: number, r: number, seg = 3) => {
  const g = new THREE.BoxGeometry(w, h, d, seg * 2 + 1, seg * 2 + 1, seg * 2 + 1);
  const pos = g.getAttribute("position");
  const v = new THREE.Vector3();
  const inner = new THREE.Vector3(w / 2 - r, h / 2 - r, d / 2 - r);
  const nor = g.getAttribute("normal");
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const c = new THREE.Vector3(Math.max(-inner.x, Math.min(inner.x, v.x)), Math.max(-inner.y, Math.min(inner.y, v.y)), Math.max(-inner.z, Math.min(inner.z, v.z)));
    const off = v.clone().sub(c);
    if (off.lengthSq() > 1e-12) {
      off.normalize();
      v.copy(c.clone().add(off.clone().multiplyScalar(r)));
      // analytic normal: seamless smooth shading across the box's face seams
      nor.setXYZ(i, off.x, off.y, off.z);
    }
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  nor.needsUpdate = true;
  return g;
};

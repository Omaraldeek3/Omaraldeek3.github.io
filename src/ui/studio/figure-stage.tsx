"use client";

import { useEffect, useRef } from "react";
import { loadChoice, lookById, modelById, readChoice } from "./figure-fx";

/**
 * The particle figure behind the home page.
 *
 * One fixed WebGL canvas. Every section that wants the figure to do something
 * carries `data-scene="…"`; each frame the stage measures how much of each
 * scene is on screen and how far through it the reader is, blends the poses
 * those scenes ask for, and eases the figure toward the result. So the
 * choreography lives in the page's own scroll, and the stage never needs to
 * know the section order.
 *
 * With no WebGL the canvas simply stays empty; the page reads the same.
 */

type Pose = {
  camZ: number; // camera distance
  lookY: number; // height the camera looks at
  offX: number; // figure offset, as a share of half the visible width (+ = towards the text's end side)
  yaw: number;
  pitch: number;
  morph: number; // 0 bust, 1 letter
  scatter: number; // 0 formed, 1 dispersed
  dim: number; // overall brightness
  follow: number; // how much the head turns to the pointer
};

const BASE: Pose = { camZ: 13, lookY: 0.9, offX: 0, yaw: 0, pitch: 0, morph: 0, scatter: 0, dim: 1, follow: 1 };
const KEYS = Object.keys(BASE) as (keyof Pose)[];
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => t * t * (3 - 2 * t);

function scenePose(scene: string, p: number, phone: boolean, rtl: boolean): Pose {
  const side = phone ? 0 : 1;
  // The text sits at the start side; the face turns to it, less whatever turn
  // the figure already has (David's head is carved looking to his left).
  const model = modelById(readChoice().model);
  const faceText = (rtl ? 0.45 : -0.45) - model.turn;
  switch (scene) {
    case "hero":
      return { ...BASE, camZ: mix(15.5, 12, ease(clamp01((p - 0.5) * 2))), lookY: 1.05 };
    case "fields": {
      // Dolly in past the cheek and turn the head into profile, then hold.
      const t = ease(clamp01(p * 2.2));
      return {
        ...BASE,
        camZ: mix(12, phone ? 11 : 10, t),
        lookY: mix(1.05, model.faceY, t),
        offX: mix(0, 0.55 * side, t),
        yaw: mix(0, faceText, t) + (p - 0.5) * 0.3,
        pitch: mix(0, 0.08, t),
        follow: 1 - t * 0.8,
      };
    }
    case "craft": {
      const t = ease(clamp01((p - 0.12) * 2.4));
      return {
        ...BASE,
        // Further back and nearer the middle of the free half, so the letter
        // stands whole beside the design panel instead of off the edge.
        // Close on the face first; back off as it becomes the letter.
        camZ: mix(phone ? 16 : 14, phone ? 21 : 21, t),
        lookY: 0.8,
        offX: -0.16 * side,
        morph: t,
        yaw: mix(-0.6, 0.35, p),
        pitch: -0.06,
        follow: 0.25,
      };
    }
    case "lab":
      return { ...BASE, camZ: 17, lookY: 1, yaw: (p - 0.5) * 1.6, dim: 0.28, follow: 0.4 };
    case "about":
      return { ...BASE, camZ: 9.5, lookY: 1.6, offX: -0.45 * side, yaw: 0.55, pitch: 0.02, follow: 0.6 };
    case "contact":
      return { ...BASE, camZ: 12, lookY: 1, scatter: ease(clamp01(p * 1.4)), dim: 0.85, follow: 0.6 };
    default:
      return BASE;
  }
}

const TRAIL = 18;

const VERTEX = /* glsl */ `
  attribute vec3 aNormal;
  attribute vec4 shade;      // albedo, ao, seed, region
  attribute vec3 tint;       // sRGB albedo colour
  attribute vec3 letter;
  attribute vec3 letterNormal;
  attribute vec3 scatter;

  uniform mat3 uHead;        // the head's own turn, at the neck
  uniform mat3 uBody;        // the whole figure's turn
  uniform vec2 uNeck;        // y band over which the head's turn fades out
  uniform vec2 uPivot;       // neck pivot (y, z)
  uniform mat3 uLetterRot;
  uniform float uTime, uMorph, uScatter, uIntro, uDim, uSize, uMask, uHover;
  uniform vec2 uMouse;       // NDC
  uniform float uAspect;
  uniform vec3 uCam;

  // Touch: recent pointer marks (ndc x, ndc y, age in seconds, energy).
  uniform vec4 uTrail[TRAIL];
  uniform float uMode;       // 1 scatter · 2 ripple · 3 vortex · 4 dust

  // Look: the palette and exposure, set per experiment from JavaScript.
  uniform vec3 uKey, uFill, uRim, uLow, uTop, uAccent;
  uniform float uExposure, uFloor, uOpacity;
  uniform float uDensity;    // fewer, brighter points or more, fainter ones
  uniform float uBreath;     // -1..1, the breathing cycle
  uniform float uPhoto;      // 1: albedo is a photo; let it shade everything
  uniform vec3 uKeyDir;      // the key light drifts slowly

  varying vec3 vColor;
  varying float vAlpha;

  vec3 hash3(float n) {
    return fract(sin(vec3(n, n + 1.7, n + 3.1)) * vec3(43758.5453, 22578.1459, 19642.3490)) - 0.5;
  }

  void main() {
    float seed = shade.z;
    float idx = float(gl_VertexID);
    vec3 rnd = hash3(idx) * 2.0;

    // Morph: each point leaves on its own beat and arcs on the way.
    float m = smoothstep(0.0, 1.0, clamp(uMorph * 1.7 - seed * 0.7, 0.0, 1.0));
    // Breathing: the chest and shoulders rise and widen, the head rides on top.
    vec3 rest = position;
    float chest = smoothstep(0.4, -2.6, rest.y);
    rest.y += uBreath * (0.035 + chest * 0.05);
    rest.xz *= 1.0 + uBreath * chest * 0.012;
    // The head turns at the neck, the body turns as a whole: blend the two
    // across the neck so the turn reads as a twist, not a hinge.
    float neckW = smoothstep(uNeck.x, uNeck.y, rest.y);
    vec3 pivot = vec3(0.0, uPivot.x, uPivot.y);
    vec3 turned = mix(rest, uHead * (rest - pivot) + pivot, neckW);
    vec3 bust = uBody * turned;
    vec3 bn = uBody * normalize(mix(aNormal, uHead * aNormal, neckW));
    vec3 lp = uLetterRot * letter;
    vec3 ln = uLetterRot * letterNormal;
    vec3 p = mix(bust, lp, m);
    p += rnd * 0.5 * sin(m * 3.14159) * 2.4;
    vec3 n = normalize(mix(bn, ln, m));

    // Arrive on load from the scattered shell, leave to it at the end.
    float arrive = smoothstep(0.0, 1.0, clamp(uIntro * 1.8 - seed * 0.8, 0.0, 1.0));
    float leave = smoothstep(0.0, 1.0, clamp(uScatter * 1.6 - (1.0 - seed) * 0.6, 0.0, 1.0));
    float away = max(1.0 - arrive, leave);
    vec3 drift = scatter + vec3(sin(uTime * 0.11 + seed * 40.0), cos(uTime * 0.09 + seed * 31.0), 0.0) * 0.9;
    p = mix(p, drift, away);

    // Breathing: a slow shimmer so the surface never sits dead still.
    p += n * sin(uTime * 1.3 + seed * 60.0 + p.y * 2.0) * 0.012;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec4 clip = projectionMatrix * mv;
    vec2 ndc = clip.xy / clip.w;
    vec2 aspect = vec2(uAspect, 1.0);
    float s = -mv.z / 10.0;               // keeps a push the same size on screen
    float formed = 1.0 - away;

    // The resting cursor: a soft dent wherever the pointer sits.
    vec2 d0 = (ndc - uMouse) * aspect;
    float hover = exp(-dot(d0, d0) / 0.006) * uHover * formed;
    mv.xy += normalize(d0 + 1e-5) * hover * 0.3 * s;

    // The trail: every recent move or tap leaves a mark that disturbs the
    // points around it, then heals as the mark ages.
    float touch = 0.0;
    vec2 swirl = vec2(0.0);
    vec2 outward = vec2(0.0);
    float ring = 0.0;
    for (int i = 0; i < TRAIL; i++) {
      vec4 tr = uTrail[i];
      if (tr.w <= 0.0) continue;
      vec2 dd = (ndc - tr.xy) * aspect;
      float dist = length(dd);
      float age = tr.z;
      vec2 dir = dd / (dist + 1e-4);
      if (uMode < 1.5) {
        float k = exp(-dist * dist / 0.009) * tr.w * exp(-age * 1.6);
        touch += k; outward += dir * k;
      } else if (uMode < 2.5) {
        float radius = age * 0.75;
        float band = exp(-pow((dist - radius) / 0.035, 2.0)) * tr.w * exp(-age * 1.5);
        ring += band; touch += band * 0.6;
      } else if (uMode < 3.5) {
        float k = exp(-dist * dist / 0.016) * tr.w * exp(-age * 1.3);
        touch += k; swirl += vec2(-dir.y, dir.x) * k - dir * k * 0.45;
      } else {
        float k = exp(-dist * dist / 0.011) * tr.w * exp(-age * 0.7);
        touch += k;
      }
    }
    // Overlapping marks add up; ease the sum so a long stroke never blows out.
    touch = (1.0 - exp(-touch)) * formed;
    ring = 1.0 - exp(-ring);
    float pull = length(outward) + 1e-4;
    outward *= (1.0 - exp(-pull)) / pull;
    float turn = length(swirl) + 1e-4;
    swirl *= (1.0 - exp(-turn)) / turn;
    vec3 nView = normalize((viewMatrix * vec4(n, 0.0)).xyz);
    if (uMode < 1.5) {
      // Scatter: points burst apart like struck sand and settle back.
      mv.xy += outward * formed * 0.55 * s;
      mv.xyz += rnd * touch * 0.55 * s;
    } else if (uMode < 2.5) {
      // Ripple: a ring runs across the surface, lifting it as it passes.
      mv.xyz += nView * ring * formed * 0.32 * s;
      mv.xy += rnd.xy * ring * formed * 0.05 * s;
    } else if (uMode < 3.5) {
      // Vortex: the points around the pointer wheel round it like a drain.
      mv.xy += swirl * formed * 0.32 * s;
      mv.z += touch * 0.25;
    } else {
      // Dust: the touched surface lifts off as embers and drifts upward.
      float lift = touch * (0.6 + seed);
      mv.y += lift * 0.9 * s;
      mv.x += (rnd.x + sin(uTime * 2.0 + seed * 30.0) * 0.5) * lift * 0.5 * s;
      mv.z += rnd.z * lift * 0.6;
    }
    // The mask pass sits a hair behind the surface it draws, so the glow pass
    // can depth-test against it: the front of the figure hides its own back.
    if (uMask > 0.5) mv.z -= 0.09;
    gl_Position = projectionMatrix * mv;

    float albedo = mix(shade.x, 0.85, m);
    float ao = mix(shade.y, 1.0, m);

    vec3 view = normalize(uCam - p);
    vec3 key = uKeyDir;
    vec3 rimDir = normalize(vec3(0.85, 0.25, -0.45));
    vec3 fillDir = normalize(vec3(0.85, -0.05, 0.5));
    float facing = dot(n, view);
    float diff = max(dot(n, key), 0.0);
    float fill = max(dot(n, fillDir), 0.0);
    float sky = 0.5 + 0.5 * n.y;
    float rim = (1.0 - smoothstep(0.0, 0.22, facing)) * (0.25 + 0.75 * max(dot(n, rimDir), 0.0));

    // A photographed figure carries its own colour (below), so its light
    // starts neutral; a sculpture's grey albedo shades the light directly.
    float albedoTerm = mix(0.18 + 0.82 * pow(albedo, 1.5), 1.0, uPhoto);
    float light = pow(ao, 1.45) * pow(diff, 1.7) * albedoTerm;
    float eye = step(1.5, shade.w) * (1.0 - m);   // the crowded patch round each eye
    float iris = step(2.5, shade.w) * (1.0 - m);  // the eye itself
    // A photographed head is lit by plain daylight, so its own colours stay
    // true: under a gold key every shadow (beside the eyes, in the beard)
    // reads gold. The look's colours stay on the shoulders and the rim.
    float daylight = uPhoto * smoothstep(-1.4, -0.2, position.y) * (1.0 - m);
    vec3 keyCol = mix(uKey, vec3(1.0, 0.98, 0.95), daylight);
    vec3 fillCol = mix(uFill, vec3(0.78, 0.84, 0.95), daylight);
    vec3 col = keyCol * light * (2.5 + min(shade.w, 1.0) * 0.8 * (1.0 - m))
             + fillCol * pow(fill, 1.6) * 0.6 * ao * (0.4 + 0.6 * albedo)
             + keyCol * sky * ao * uFloor
             + uRim * rim * 0.75 * (1.0 - 0.6 * daylight);

    // A photographed figure: its real colours (skin, beard, eyes, hair)
    // multiply every light, so they survive the gold key without turning gold.
    col *= mix(vec3(1.0), tint * tint * 1.45 + 0.01, uPhoto * (1.0 - m));
    // The eyes light themselves a little, so the white, the green iris and the
    // black pupil read even in the socket's shadow.
    col += tint * tint * 0.85 * iris;

    // A vertical grade: the head takes the top colour, the shoulders the low.
    float y = position.y;
    float grade = smoothstep(2.8, -2.6, y) * (1.0 - m);
    col *= mix(uTop, uLow, grade);
    float fade = mix(smoothstep(-3.95, -1.6, y), 1.0, m);

    col += uAccent * (hover * 0.35 + touch * 0.35 + ring * 0.3);
    // Life: a few points catch the light at any moment, and every few seconds
    // a soft band of light passes down the figure like a slow scan.
    float twinkle = pow(0.5 + 0.5 * sin(uTime * (1.2 + seed * 2.6) + seed * 97.0), 14.0) * (1.0 - m);
    float scanY = mix(4.6, -4.2, fract(uTime / 8.0));
    float scan = exp(-pow((position.y - scanY) / 0.16, 2.0)) * (1.0 - m) * smoothstep(-0.2, 0.4, facing);
    col += uAccent * (twinkle * 0.55 + scan * 0.45) + uKey * twinkle * 0.4;
    // The letter's walls glow like a fresh laser cut in acrylic.
    float wall = (1.0 - abs(letterNormal.z)) * m;
    col = mix(col, uAccent * 1.25 + vec3(0.15, 0.05, 0.0), wall * 0.75);

    col = vec3(1.0) - exp(-col * uExposure);
    // Let the shadow side fall away so the lit side carves the form.
    float luma = dot(col, vec3(0.3, 0.59, 0.11));
    float front = smoothstep(-0.35, 0.25, facing);
    vAlpha = (0.05 + 0.95 * front) * mix(0.42, 0.85, clamp(facing, 0.0, 1.0)) * uOpacity * uDensity
           * fade * uDim * (1.0 - away * 0.65) * (0.55 + 0.45 * arrive);
    vAlpha *= smoothstep(0.0, mix(0.3, 0.16, uPhoto), luma);
    // The eyes carry several times the points, each drawn half size: even out.
    vAlpha = min(1.0, vAlpha * (1.0 + iris * 0.6 - (eye - iris) * 0.35));
    vAlpha = min(1.0, vAlpha + touch * 0.12 + twinkle * 0.25 * formed + scan * 0.12 * formed);
    vColor = col;

    float size = uSize * (0.8 + 0.4 * fract(seed * 7.13)) * (1.0 - eye * 0.35);
    size *= 1.0 + hover * 0.8 + touch * 0.4 + twinkle * 0.6;
    gl_PointSize = uMask > 0.5 ? max(size * 3.0, uSize * 1.4) / -mv.z : size / -mv.z;
    if (uMask > 0.5) {
      // The mask pass: a dark silhouette that hides the giant name behind the
      // head. Only the formed figure masks; drifting or disturbed points do not.
      vAlpha = formed * front * fade * (1.0 - m) * (1.0 - clamp(touch * 3.0, 0.0, 1.0));
    }
  }
`.replace(/TRAIL/g, String(TRAIL));

const FRAGMENT = /* glsl */ `
  precision highp float;
  uniform float uMask;
  uniform vec3 uBg;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    if (uMask > 0.5) {
      if (vAlpha < 0.5) discard;
      gl_FragColor = vec4(uBg, 1.0);
      return;
    }
    float a = exp(-r * r * 14.0) * vAlpha;
    gl_FragColor = vec4(vColor * a, a);
  }
`;

/**
 * `framed`: the canvas lives in a box of its own (the board's carved hollow)
 * instead of covering the window. It then takes its size and pointer from
 * that box, never shifts the figure sideways (the box is already beside the
 * words), and masks with the box's ground (`--hollow`) instead of the page's.
 */
/*
 * `avoid`: a selector for the page's content. Outside the hero, the figure
 * never stands behind it: each few frames the stage maps which columns (and,
 * on a narrow screen, which rows) of the window content covers, moves the
 * figure into the widest free stretch and turns it toward the content; with
 * no free stretch wide enough it fades out, and comes back where one opens.
 */
export function FigureStage({ rtl, glyph, framed = false, className, avoid }: { rtl: boolean; glyph: string; framed?: boolean; className?: string; avoid?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      const { loadCloud } = await import("@/lib/bust-cloud");
      if (disposed) return;

      const phone = window.matchMedia("(max-width: 760px)").matches;
      const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
      } catch {
        return; // no WebGL: the page stands on its own
      }
      const dpr = Math.min(window.devicePixelRatio || 1, phone ? 2 : 1.75);
      renderer.setPixelRatio(dpr);
      renderer.setClearColor(0x000000, 0);

      const family = getComputedStyle(document.documentElement).getPropertyValue("--font-ar-loaded").trim() || "sans-serif";
      try { await document.fonts.load(`900 100px ${family}`, glyph); } catch {}
      const cloud = await loadCloud(`/models/${readChoice().model}.bin`, phone ? 90000 : 320000, glyph, family);
      if (disposed) { renderer.dispose(); return; }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(cloud.position, 3));
      geometry.setAttribute("aNormal", new THREE.BufferAttribute(cloud.normal, 3));
      geometry.setAttribute("shade", new THREE.BufferAttribute(cloud.shade, 4));
      geometry.setAttribute("tint", new THREE.BufferAttribute(cloud.color, 3));
      geometry.setAttribute("letter", new THREE.BufferAttribute(cloud.letter, 3));
      geometry.setAttribute("letterNormal", new THREE.BufferAttribute(cloud.letterNormal, 3));
      geometry.setAttribute("scatter", new THREE.BufferAttribute(cloud.scatter, 3));
      geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0.5, 0), 30);

      const bg = getComputedStyle(document.body).backgroundColor;
      const bgColor = new THREE.Color(bg.startsWith("rgb") ? bg : "#070708");
      const uniforms = {
        uHead: { value: new THREE.Matrix3() },
        uBody: { value: new THREE.Matrix3() },
        uNeck: { value: new THREE.Vector2(-1.6, -0.45) },
        uPivot: { value: new THREE.Vector2(-1.1, -0.5) },
        uLetterRot: { value: new THREE.Matrix3() },
        uTime: { value: 0 },
        uMorph: { value: 0 },
        uScatter: { value: 0 },
        uIntro: { value: calm ? 1 : 0 },
        uDim: { value: 1 },
        uSize: { value: 0 },
        uMask: { value: 0 },
        uHover: { value: 0 },
        uMouse: { value: new THREE.Vector2(9, 9) },
        uAspect: { value: 1 },
        uCam: { value: new THREE.Vector3() },
        uBg: { value: new THREE.Vector3(bgColor.r, bgColor.g, bgColor.b) },
        uBreath: { value: 0 },
        uPhoto: { value: 0 },
        uDensity: { value: 1 },
        uKeyDir: { value: new THREE.Vector3(-0.6, 0.38, 0.72).normalize() },
        uTrail: { value: Array.from({ length: TRAIL }, () => new THREE.Vector4(0, 0, 0, 0)) },
        uMode: { value: 1 },
        uKey: { value: new THREE.Vector3() },
        uFill: { value: new THREE.Vector3() },
        uRim: { value: new THREE.Vector3() },
        uLow: { value: new THREE.Vector3() },
        uTop: { value: new THREE.Vector3() },
        uAccent: { value: new THREE.Vector3() },
        uExposure: { value: 1.5 },
        uFloor: { value: 0.2 },
        uOpacity: { value: 1 },
      };
      loadChoice();
      // Points add up: a denser cloud must draw each point fainter, or the
      // colours sum to white. Tuned at 100k points.
      uniforms.uDensity.value = Math.min(1, Math.max(0.28, 100000 / cloud.count));
      uniforms.uPhoto.value = modelById(readChoice().model).photo;
      const model = modelById(readChoice().model);
      const maxYaw = model.maxYaw;
      uniforms.uNeck.value.set(model.neck[0], model.neck[1]);
      uniforms.uPivot.value.set(model.pivot[0], model.pivot[1]);
      let lookId = "";
      const applyLook = () => {
        const choice = readChoice();
        uniforms.uMode.value = choice.mode;
        if (choice.look + choice.palette === lookId) return;
        lookId = choice.look + choice.palette;
        // The mask must match the page ground exactly, so re-read it.
        // Read as raw sRGB numbers: the canvas is written without conversion.
        const ground = new THREE.Color().setStyle(
          (framed ? getComputedStyle(canvas).getPropertyValue("--hollow") : getComputedStyle(document.documentElement).getPropertyValue("--surface-0")).trim() || "#0b0a08",
          THREE.LinearSRGBColorSpace,
        );
        uniforms.uBg.value.set(ground.r, ground.g, ground.b);
        const l = lookById(choice.look);
        uniforms.uKey.value.set(...l.key);
        uniforms.uFill.value.set(...l.fill);
        uniforms.uRim.value.set(...l.rim);
        uniforms.uLow.value.set(...l.low);
        uniforms.uTop.value.set(...l.top);
        uniforms.uAccent.value.set(...l.accent);
        uniforms.uExposure.value = l.exposure;
        uniforms.uFloor.value = l.floor;
        uniforms.uOpacity.value = l.opacity;
      };
      applyLook();

      const glow = new THREE.ShaderMaterial({
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        uniforms,
        transparent: true,
        depthTest: true,
        depthWrite: false,
        blending: THREE.CustomBlending,
        blendEquation: THREE.AddEquation,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneMinusSrcAlphaFactor,
      });
      // Premultiplied "lighter": colour adds up, alpha stays honest.
      glow.blendDst = THREE.OneFactor;
      glow.blendSrcAlpha = THREE.OneFactor;
      glow.blendDstAlpha = THREE.OneMinusSrcAlphaFactor;

      const maskUniforms = { ...uniforms, uMask: { value: 1 } };
      const mask = new THREE.ShaderMaterial({
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        uniforms: maskUniforms,
        depthTest: true,
        depthWrite: true,
      });

      const scene = new THREE.Scene();
      const maskPoints = new THREE.Points(geometry, mask);
      const points = new THREE.Points(geometry, glow);
      maskPoints.renderOrder = 0;
      points.renderOrder = 1;
      maskPoints.frustumCulled = points.frustumCulled = false;
      // The mask paints the page ground over whatever is behind the head (the
      // giant name) and writes depth so the far side of the head stays hidden.
      // In the hollow the floor is textured, so a framed mask writes depth only.
      if (framed) mask.colorWrite = false;
      scene.add(maskPoints, points);

      // Motes: a little gold dust drifting up through the light around the
      // figure, so the air itself feels alive.
      const MOTES = phone ? 260 : 700;
      const motePos = new Float32Array(MOTES * 3);
      const moteSeed = new Float32Array(MOTES);
      for (let i = 0; i < MOTES; i++) {
        motePos[i * 3] = (Math.random() * 2 - 1) * 8;
        motePos[i * 3 + 1] = Math.random() * 10 - 4;
        motePos[i * 3 + 2] = Math.random() * 10 - 6;
        moteSeed[i] = Math.random();
      }
      const moteGeometry = new THREE.BufferGeometry();
      moteGeometry.setAttribute("position", new THREE.BufferAttribute(motePos, 3));
      moteGeometry.setAttribute("seed", new THREE.BufferAttribute(moteSeed, 1));
      const moteMaterial = new THREE.ShaderMaterial({
        uniforms: { uTime: uniforms.uTime, uSize: uniforms.uSize, uDim: uniforms.uDim, uAccent: uniforms.uAccent, uKey: uniforms.uKey },
        vertexShader: /* glsl */ `
          attribute float seed;
          uniform float uTime, uSize, uDim;
          uniform vec3 uAccent, uKey;
          varying vec3 vColor;
          varying float vAlpha;
          void main() {
            vec3 p = position;
            p.y = mod(p.y + 4.0 + uTime * (0.08 + seed * 0.12), 10.0) - 4.0;
            p.x += sin(uTime * 0.3 + seed * 40.0) * 0.35;
            p.z += cos(uTime * 0.23 + seed * 25.0) * 0.25;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            float glint = pow(0.5 + 0.5 * sin(uTime * (0.6 + seed) + seed * 50.0), 6.0);
            vAlpha = (0.15 + 0.85 * glint) * 0.55 * uDim * smoothstep(-4.0, -2.5, p.y) * (1.0 - smoothstep(4.5, 6.0, p.y));
            vColor = mix(uKey, uAccent, seed);
            gl_PointSize = uSize * (0.9 + seed * 1.6) / -mv.z;
          }
        `,
        fragmentShader: FRAGMENT.replace("uniform float uMask;", "const float uMask = 0.0;").replace("uniform vec3 uBg;", "const vec3 uBg = vec3(0.0);"),
        transparent: true,
        depthTest: false,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const motes = new THREE.Points(moteGeometry, moteMaterial);
      motes.renderOrder = 2;
      motes.frustumCulled = false;
      if (!calm) scene.add(motes);

      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);

      let width = 0, height = 0, viewH = 0;
      const resize = () => {
        width = framed ? canvas.clientWidth || window.innerWidth : window.innerWidth;
        height = framed ? canvas.clientHeight || window.innerHeight : window.innerHeight;
        viewH = window.innerHeight;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        uniforms.uAspect.value = camera.aspect;
        // Point size in pixels at distance 1, scaled with the viewport so the
        // grain reads the same on a laptop and a large monitor.
        const base = phone ? 4.2 : 3.4;
        uniforms.uSize.value = base * dpr * (height / 900) * 10;
      };
      resize();
      window.addEventListener("resize", resize);
      const boxWatch = framed ? new ResizeObserver(resize) : null;
      boxWatch?.observe(canvas);

      // Pointer, in NDC, eased. A mouse also turns the head; a finger only
      // touches the surface.
      const mouse = { x: 0, y: 0, tx: 0, ty: 0, inside: 0, tinside: 0 };
      // The trail: recent marks left by moves and taps, newest first.
      type Mark = { x: number; y: number; t: number; e: number };
      const marks: Mark[] = [];
      let lastMark = { x: 9, y: 9, t: 0 };
      const addMark = (x: number, y: number, e: number) => {
        marks.unshift({ x, y, t: performance.now(), e });
        if (marks.length > TRAIL) marks.length = TRAIL;
        lastMark = { x, y, t: performance.now() };
      };
      const toNdc = (e: PointerEvent) => {
        const r = framed ? canvas.getBoundingClientRect() : { left: 0, top: 0 };
        return [((e.clientX - r.left) / width) * 2 - 1, -(((e.clientY - r.top) / height) * 2 - 1)];
      };
      const onMove = (e: PointerEvent) => {
        const [x, y] = toNdc(e);
        if (e.pointerType === "mouse") {
          mouse.tx = x; mouse.ty = y; mouse.tinside = 1;
        }
        // Leave a mark every few pixels of travel; faster strokes hit harder.
        const now = performance.now();
        const travel = Math.hypot((x - lastMark.x) * camera.aspect, y - lastMark.y);
        if (travel > 0.045 || now - lastMark.t > 140) {
          const speed = travel / Math.max(0.016, (now - lastMark.t) / 1000);
          addMark(x, y, Math.min(0.8, 0.3 + speed * 0.2));
        }
      };
      const onDown = (e: PointerEvent) => {
        const [x, y] = toNdc(e);
        addMark(x, y, 1.1);
      };
      const onLeave = () => { mouse.tinside = 0; };
      if (!calm) {
        window.addEventListener("pointermove", onMove, { passive: true });
        window.addEventListener("pointerdown", onDown, { passive: true });
        document.documentElement.addEventListener("pointerleave", onLeave);
      }

      const pose: Pose = { ...BASE, camZ: 18 };
      const target: Pose = { ...BASE };
      const sections = () => Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"));
      let nodes = sections();
      const observer = new MutationObserver(() => { nodes = sections(); });
      observer.observe(document.body, { childList: true, subtree: true });

      // How much of the first (hero) section is on screen: on a phone the
      // framed figure is lifted into the band above the board while it shows.
      let heroShare = 0;
      const measure = () => {
        heroShare = 0;
        const acc: Pose = { ...BASE };
        for (const k of KEYS) acc[k] = 0;
        let total = 0;
        for (const node of nodes) {
          const box = node.getBoundingClientRect();
          const visible = Math.min(box.bottom, viewH) - Math.max(box.top, 0);
          if (visible <= 0) continue;
          const w = visible / viewH;
          const p = clamp01(-box.top / Math.max(1, box.height - viewH));
          const s = scenePose(node.dataset.scene || "", p, phone, rtl);
          if (node.dataset.scene === "hero") heroShare = w;
          for (const k of KEYS) acc[k] += s[k] * w;
          total += w;
        }
        if (total === 0) return;
        for (const k of KEYS) target[k] = acc[k] / total;
      };

      const head = new THREE.Matrix4();
      const euler = new THREE.Euler();
      const body = new THREE.Matrix4();
      const letterM = new THREE.Matrix4();
      const start = performance.now();
      let last = start;
      let frame = 0;
      let running = true;
      let lift = 0;
      // Free-space placement (see `avoid`): targets and eased values, in NDC.
      const free = { tx: 0, ty: 0, tv: 1, x: 0, y: 0, v: 1, face: 0, tface: 0 };
      let ticks = 0; // own frame count: requestAnimationFrame ids are shared with the page
      const COLS = 24, ROWS = 16;
      const findFree = () => {
        if (!avoid) return;
        const W = window.innerWidth, H = window.innerHeight;
        const top = H * 0.1, bottom = H * 0.96;
        const cols = new Float32Array(COLS), rows = new Float32Array(ROWS);
        let mass = 0, massX = 0;
        for (const el of Array.from(document.querySelectorAll<HTMLElement>(avoid))) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.bottom < top || r.top > bottom || r.right < 0 || r.left > W) continue;
          const y0 = Math.max(r.top, top), y1 = Math.min(r.bottom, bottom);
          const x0 = Math.max(r.left, 0), x1 = Math.min(r.right, W);
          for (let c = Math.floor((x0 / W) * COLS); c < Math.min(COLS, Math.ceil((x1 / W) * COLS)); c++) cols[c] += (y1 - y0) / (bottom - top);
          for (let k = 0; k < ROWS; k++) {
            const ry0 = top + ((bottom - top) * k) / ROWS, ry1 = ry0 + (bottom - top) / ROWS;
            if (y1 > ry0 && y0 < ry1) rows[k] += (x1 - x0) / W;
          }
          const a = (x1 - x0) * (y1 - y0);
          mass += a; massX += a * ((x0 + x1) / 2);
        }
        const run = (arr: Float32Array, n: number, limit: number) => {
          let best = 0, bestStart = 0, start = -1;
          for (let i = 0; i <= n; i++) {
            const isFree = i < n && arr[i] < limit;
            if (isFree && start < 0) start = i;
            if (!isFree && start >= 0) { if (i - start > best) { best = i - start; bestStart = start; } start = -1; }
          }
          return { len: best / n, mid: (bestStart + best / 2) / n };
        };
        const c = run(cols, COLS, 0.05), r = run(rows, ROWS, 0.08);
        const contentX = mass > 0 ? (massX / mass / W) * 2 - 1 : 0;
        if (c.len >= 0.4) {
          free.tx = c.mid * 2 - 1; free.ty = 0; free.tv = 1;
          free.tface = Math.sign(contentX - free.tx);
        } else if (r.len >= 0.4) {
          free.tx = 0; free.ty = -(r.mid * 2 - 1) * ((bottom - top) / H); free.tv = 1; free.tface = 0;
        } else {
          free.tv = 0; // nowhere free: fade, keep the last place
        }
      };

      const tick = (now: number) => {
        frame = requestAnimationFrame(tick);
        if (!running) return;
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        const t = (now - start) / 1000;

        measure();
        if (avoid && (ticks++ % 6 === 0 || calm)) findFree();
        const k = calm ? 1 : 1 - Math.exp(-dt * 3.2);
        for (const key of KEYS) pose[key] += (target[key] - pose[key]) * k;

        const km = 1 - Math.exp(-dt * 5);
        mouse.x += (mouse.tx - mouse.x) * km;
        mouse.y += (mouse.ty - mouse.y) * km;
        mouse.inside += (mouse.tinside - mouse.inside) * km;

        // Portrait screens stand further back so the head still fits.
        const aspect = camera.aspect;
        const fit = aspect < 0.95 ? Math.pow(0.95 / aspect, 0.75) : 1;
        const camZ = pose.camZ * fit;
        const halfW = Math.tan((camera.fov * Math.PI) / 360) * camZ * aspect;
        const towardEnd = rtl ? -1 : 1;
        const offX = framed ? 0 : pose.offX * halfW * towardEnd * (avoid ? 1 - Math.min(1, (1 - Math.min(1, heroShare * 1.6))) : 1);

        if (framed && phone) {
          lift += ((heroShare > 0.05 ? 0.24 : 0) - lift) * k;
          camera.setViewOffset(width, height, 0, lift * height, width, height);
        }
        // Outside the hero, stand only where the page is empty.
        let away = 0;
        if (avoid) {
          const kf = calm ? 1 : 1 - Math.exp(-dt * 2.4);
          free.x += (free.tx - free.x) * kf;
          free.y += (free.ty - free.y) * kf;
          free.v += (free.tv - free.v) * kf;
          free.face += (free.tface - free.face) * kf;
          away = 1 - Math.min(1, heroShare * 1.6);
          camera.setViewOffset(width, height, (-free.x * width) / 2 * away, (free.y * height) / 2 * away, width, height);
        }
        camera.position.set(-offX, pose.lookY + 0.25, camZ);
        camera.lookAt(-offX, pose.lookY, 0);
        uniforms.uCam.value.copy(camera.position);

        const look = pose.follow * mouse.inside;
        const sway = calm ? 0 : Math.sin(t * 0.35) * 0.05;
        // A living head never holds still: three slow, out-of-step drifts.
        const drift = calm ? 0 : 1;
        // The body turns with the scene and leans a little toward the pointer;
        // the neck does most of the looking.
        euler.set(
          pose.pitch * 0.5 - mouse.y * 0.05 * look,
          (avoid ? pose.yaw * (1 - away) + free.face * 0.5 * away : pose.yaw) + sway + mouse.x * 0.16 * look,
          0,
          "YXZ",
        );
        euler.y = Math.max(-maxYaw, Math.min(maxYaw, euler.y));
        body.makeRotationFromEuler(euler);
        uniforms.uBody.value.setFromMatrix4(body);
        euler.set(
          pose.pitch * 0.5 - mouse.y * 0.3 * look + drift * 0.035 * Math.sin(t * 0.47 + 2),
          mouse.x * 0.55 * look + drift * 0.05 * Math.sin(t * 0.73 + 1),
          drift * 0.025 * Math.sin(t * 0.29 + 0.5) - mouse.x * 0.06 * look,
          "YXZ",
        );
        uniforms.uBreath.value = calm ? 0 : Math.sin((t / 4.8) * Math.PI * 2);
        const keyAngle = -0.62 + (calm ? 0 : 0.22 * Math.sin(t * 0.16));
        uniforms.uKeyDir.value.set(Math.sin(keyAngle), 0.38 + 0.08 * Math.sin(t * 0.11), Math.cos(keyAngle)).normalize();
        // A relief figure has no back: keep its turn inside what it can show.
        euler.y = Math.max(-maxYaw, Math.min(maxYaw, euler.y));
        euler.x = Math.max(-maxYaw * 0.6, Math.min(maxYaw * 0.6, euler.x));
        head.makeRotationFromEuler(euler);
        uniforms.uHead.value.setFromMatrix4(head);
        letterM.makeRotationY(Math.sin(t * 0.4) * 0.35 + pose.yaw * 0.4);
        uniforms.uLetterRot.value.setFromMatrix4(letterM);

        uniforms.uTime.value = t;
        uniforms.uMorph.value = pose.morph;
        uniforms.uScatter.value = pose.scatter;
        uniforms.uDim.value = avoid ? pose.dim * (1 - away + away * free.v) : pose.dim;
        uniforms.uMouse.value.set(mouse.x, mouse.y);
        uniforms.uHover.value = mouse.inside;
        applyLook();
        for (let i = 0; i < TRAIL; i++) {
          const mark = marks[i];
          const slot = uniforms.uTrail.value[i];
          const age = mark ? (now - mark.t) / 1000 : 99;
          if (!mark || age > 4) slot.set(0, 0, 0, 0);
          else slot.set(mark.x, mark.y, age, mark.e);
        }
        if (!calm) uniforms.uIntro.value = Math.min(1, (t - 0.15) / 2.6);
        maskUniforms.uSize.value = uniforms.uSize.value;

        renderer.render(scene, camera);
      };
      frame = requestAnimationFrame(tick);
      canvas.dataset.ready = "true";

      const onVisibility = () => { running = !document.hidden; last = performance.now(); };
      document.addEventListener("visibilitychange", onVisibility);

      cleanup = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        window.removeEventListener("resize", resize);
        boxWatch?.disconnect();
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerdown", onDown);
        document.documentElement.removeEventListener("pointerleave", onLeave);
        document.removeEventListener("visibilitychange", onVisibility);
        geometry.dispose();
        moteGeometry.dispose();
        moteMaterial.dispose();
        glow.dispose();
        mask.dispose();
        renderer.dispose();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [rtl, glyph, framed]);

  return <canvas ref={canvasRef} className={className ?? "st-stage"} aria-hidden="true" />;
}

"use client";

import { useEffect, useRef } from "react";
import { createScene, stepScene, type Scene } from "@/lib/scene";

function token(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function draw(
  context: CanvasRenderingContext2D,
  scene: Scene,
  width: number,
  height: number,
  rtl: boolean,
) {
  const live = token("--live");
  const line = token("--border-strong");
  const muted = token("--text-muted");
  // Data flows with the reading direction, so the whole line mirrors in Arabic.
  const at = (id: string) => {
    const node = scene.nodes.find(n => n.id === id)!;
    return { x: (rtl ? 1 - node.x : node.x) * width, y: node.y * height };
  };

  context.clearRect(0, 0, width, height);
  if (scene.nodes.length === 0) return;

  context.strokeStyle = line;
  context.lineWidth = 1;
  for (const edge of scene.edges) {
    const a = at(edge.from);
    const b = at(edge.to);
    context.beginPath();
    context.moveTo(a.x, a.y);
    context.lineTo(b.x, b.y);
    context.stroke();
  }

  context.fillStyle = live;
  for (const pulse of scene.pulses) {
    const edge = scene.edges[pulse.edge];
    const a = at(edge.from);
    const b = at(edge.to);
    context.beginPath();
    context.arc(
      a.x + (b.x - a.x) * pulse.progress,
      a.y + (b.y - a.y) * pulse.progress,
      3,
      0,
      Math.PI * 2,
    );
    context.fill();
  }

  context.font = "11px ui-monospace, monospace";
  context.textAlign = "center";
  for (const node of scene.nodes) {
    const point = at(node.id);
    context.fillStyle = live;
    context.beginPath();
    context.arc(point.x, point.y, 4.5, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = muted;
    context.fillText(node.label, point.x, point.y - 14);
  }
}

export function HeroScene({ labels, rtl }: { labels: string[]; rtl: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let scene = createScene(labels);
    let frame = 0;
    let last = performance.now();

    const paint = () => {
      const rect = canvas.getBoundingClientRect();
      draw(context, scene, rect.width, rect.height, rtl);
    };

    // Before layout settles the box can measure zero. Sizing the buffer then
    // would freeze it at a single pixel under reduced motion, where no later
    // frame repaints it, so wait for a real box instead.
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * ratio);
      canvas.height = Math.round(rect.height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      paint();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    // Reduced motion never starts the loop, so the first frame stays on screen
    // and every station label remains readable.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!reduced.matches) {
      const loop = (now: number) => {
        scene = stepScene(scene, now - last);
        last = now;
        paint();
        frame = requestAnimationFrame(loop);
      };
      frame = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [labels, rtl]);

  return <canvas ref={canvasRef} className="hero-scene" aria-hidden="true" />;
}

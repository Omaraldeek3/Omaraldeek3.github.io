export type SceneNode = { id: string; x: number; y: number; label: string };
export type SceneEdge = { from: string; to: string };
export type Pulse = { edge: number; progress: number };
export type Scene = { nodes: SceneNode[]; edges: SceneEdge[]; pulses: Pulse[] };

const PULSE_PER_SECOND = 0.32;

/** Lays the real production line out as a chain: one node per station, each
 *  linked to the next, with a packet travelling along every link. */
export function createScene(labels: string[]): Scene {
  const nodes: SceneNode[] = labels.map((label, index) => {
    const t = labels.length === 1 ? 0.5 : index / (labels.length - 1);
    return {
      id: `n${index}`,
      label,
      x: 0.08 + t * 0.84,
      y: 0.5 + Math.sin(t * Math.PI * 2) * 0.22,
    };
  });

  const edges: SceneEdge[] = [];
  for (let i = 0; i < nodes.length - 1; i++)
    edges.push({ from: nodes[i].id, to: nodes[i + 1].id });

  const pulses: Pulse[] = edges.map((_, index) => ({
    edge: index,
    progress: edges.length === 0 ? 0 : (index / edges.length) % 1,
  }));

  return { nodes, edges, pulses };
}

/** Pure: returns the next frame and never mutates the one it was given. */
export function stepScene(scene: Scene, deltaMs: number): Scene {
  if (scene.edges.length === 0) return { ...scene, pulses: [...scene.pulses] };
  const advance = (deltaMs / 1000) * PULSE_PER_SECOND;
  return {
    nodes: scene.nodes,
    edges: scene.edges,
    pulses: scene.pulses.map(pulse => {
      const next = pulse.progress + advance;
      return next <= 1
        ? { edge: pulse.edge, progress: next }
        : { edge: (pulse.edge + 1) % scene.edges.length, progress: next % 1 };
    }),
  };
}

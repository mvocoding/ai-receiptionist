export type NodeType = 'start' | 'message' | 'condition' | 'action' | 'end';

export type Node = {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
};

export type Conn = {
  id: string;
  fromNode: string;
  toNode: string;
  fromPort: number;
  toPort: number;
};

export const nodeConfigs: Record<
  NodeType,
  { icon: string; color: string; inputs: number; outputs: number }
> = {
  start: {
    icon: '▶',
    color: 'from-green-500 to-emerald-500',
    inputs: 0,
    outputs: 1,
  },
  message: {
    icon: '💬',
    color: 'from-blue-500 to-cyan-500',
    inputs: 1,
    outputs: 1,
  },
  condition: {
    icon: '❓',
    color: 'from-amber-500 to-orange-500',
    inputs: 1,
    outputs: 2,
  },
  action: {
    icon: '⚙️',
    color: 'from-purple-500 to-pink-500',
    inputs: 1,
    outputs: 1,
  },
  end: { icon: '⏹', color: 'from-red-500 to-rose-500', inputs: 1, outputs: 0 },
};

export function makeId(prefix = 'node') {
  return `${prefix}_${Date.now().toString(36)}_${Math.floor(Math.random() * 1000)}`;
}

export function computePath(c: Conn, nodes: Node[]): string {
  const from = nodes.find((n) => n.id === c.fromNode);
  const to = nodes.find((n) => n.id === c.toNode);
  if (!from || !to) return '';
  const x1 = from.x + from.width;
  const y1 = from.y + from.height / 2;
  const x2 = to.x;
  const y2 = to.y + to.height / 2;
  const cx1 = x1 + 50;
  const cx2 = x2 - 50;
  return `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`;
}

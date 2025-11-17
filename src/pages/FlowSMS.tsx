import React, { useEffect, useRef, useState } from 'react';
import {
  NodeType,
  Node,
  Conn,
  nodeConfigs,
  makeId,
  computePath,
} from '../utils/flowUtils';

export default function FlowSMS(): JSX.Element {
  useEffect(() => {
    document.title = 'Fade Station · SMS Flow Builder';
    const meta =
      document.querySelector('meta[name="description"]') ??
      document.createElement('meta');
    meta.setAttribute('name', 'description');
    meta.setAttribute('content', 'Build SMS Conversation Flows');
    if (!document.querySelector('meta[name="description"]'))
      document.head.appendChild(meta);
  }, []);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [conns, setConns] = useState<Conn[]>([]);
  const nextIdRef = useRef(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const connectingFrom = useRef<{ nodeId: string; portIndex: number } | null>(
    null
  );
  const nodesContainerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // load saved or demo
  useEffect(() => {
    const saved = localStorage.getItem('fadeStationFlow_sms');
    if (saved) {
      try {
        const f = JSON.parse(saved);
        setNodes(f.nodes || []);
        setConns(f.connections || []);
        nextIdRef.current = (f.nextId || 1000) + 1;
        return;
      } catch {}
    }
    // demo sms flow
    const start = {
      id: 'node_1',
      type: 'start' as NodeType,
      x: 50,
      y: 50,
      width: 180,
      height: 120,
      text: 'Incoming SMS',
    };
    const welcome = {
      id: 'node_2',
      type: 'message' as NodeType,
      x: 300,
      y: 50,
      width: 180,
      height: 120,
      text: 'Thanks for messaging Fade Station! How can we help?',
    };
    const condition = {
      id: 'node_3',
      type: 'condition' as NodeType,
      x: 550,
      y: 50,
      width: 180,
      height: 120,
      text: 'Detect intent',
    };
    const booking = {
      id: 'node_4',
      type: 'action' as NodeType,
      x: 800,
      y: 20,
      width: 180,
      height: 120,
      text: 'Offer booking links',
    };
    const end1 = {
      id: 'node_5',
      type: 'end' as NodeType,
      x: 1050,
      y: 20,
      width: 180,
      height: 120,
      text: 'Booked / Confirmed',
    };
    const info = {
      id: 'node_6',
      type: 'action' as NodeType,
      x: 800,
      y: 140,
      width: 180,
      height: 120,
      text: 'Send info/FAQ',
    };
    const end2 = {
      id: 'node_7',
      type: 'end' as NodeType,
      x: 1050,
      y: 140,
      width: 180,
      height: 120,
      text: 'Conversation ends',
    };
    setNodes([start, welcome, condition, booking, end1, info, end2]);
    setConns([
      {
        id: 'conn_1',
        fromNode: 'node_1',
        toNode: 'node_2',
        fromPort: 0,
        toPort: 0,
      },
      {
        id: 'conn_2',
        fromNode: 'node_2',
        toNode: 'node_3',
        fromPort: 0,
        toPort: 0,
      },
      {
        id: 'conn_3',
        fromNode: 'node_3',
        toNode: 'node_4',
        fromPort: 0,
        toPort: 0,
      },
      {
        id: 'conn_4',
        fromNode: 'node_4',
        toNode: 'node_5',
        fromPort: 0,
        toPort: 0,
      },
      {
        id: 'conn_5',
        fromNode: 'node_3',
        toNode: 'node_6',
        fromPort: 1,
        toPort: 0,
      },
      {
        id: 'conn_6',
        fromNode: 'node_6',
        toNode: 'node_7',
        fromPort: 0,
        toPort: 0,
      },
    ]);
    nextIdRef.current = 8;
  }, []);

  // the rest of code mirrors FlowCall: createNode, dragging, connections, delete/update/save/export, computePath
  // ...existing code (reuse the same handlers as FlowCall but saving under 'fadeStationFlow_sms')...

  // For brevity reuse same implementations as FlowCall by duplicating functions here:
  function createNode(type: NodeType, x: number, y: number) {
    const id = makeId('node');
    const n: Node = {
      id,
      type,
      x,
      y,
      width: 180,
      height: 120,
      text:
        type === 'message'
          ? 'Enter message...'
          : type === 'condition'
          ? 'If condition...'
          : '',
    };
    setNodes((prev) => [...prev, n]);
    setSelectedId(id);
  }

  function onPaletteDragStart(e: React.DragEvent, type: NodeType) {
    e.dataTransfer.setData('nodeType', type);
  }
  function onCanvasDrop(e: React.DragEvent) {
    e.preventDefault();
    const t = e.dataTransfer.getData('nodeType') as NodeType;
    const rect = nodesContainerRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    createNode(t, x, y);
  }
  function onCanvasDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  const dragState = useRef<{
    nodeId: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  function onNodeMouseDown(e: React.MouseEvent, node: Node) {
    if ((e.target as HTMLElement).closest('.port')) return;
    dragState.current = {
      nodeId: node.id,
      offsetX: e.clientX - node.x,
      offsetY: e.clientY - node.y,
    };
    setSelectedId(node.id);
    const onMove = (ev: MouseEvent) => {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === node.id
            ? {
                ...n,
                x: ev.clientX - dragState.current!.offsetX,
                y: ev.clientY - dragState.current!.offsetY,
              }
            : n
        )
      );
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      dragState.current = null;
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  function startConnection(
    e: React.MouseEvent,
    nodeId: string,
    portIndex: number
  ) {
    e.stopPropagation();
    if (connectingFrom.current) {
      const from = connectingFrom.current;
      setConns((prev) => [
        ...prev,
        {
          id: makeId('conn'),
          fromNode: from.nodeId,
          toNode: nodeId,
          fromPort: from.portIndex,
          toPort: portIndex,
        },
      ]);
      connectingFrom.current = null;
      document.body.style.cursor = '';
    } else {
      connectingFrom.current = { nodeId, portIndex };
      document.body.style.cursor = 'crosshair';
    }
  }

  function deleteNode(nodeId: string) {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setConns((prev) =>
      prev.filter((c) => c.fromNode !== nodeId && c.toNode !== nodeId)
    );
    if (selectedId === nodeId) setSelectedId(null);
  }
  function updateNodeText(nodeId: string, text: string) {
    setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, text } : n)));
  }

  function saveFlow() {
    localStorage.setItem(
      'fadeStationFlow_sms',
      JSON.stringify({ nodes, connections: conns, nextId: nextIdRef.current })
    );
    alert('Flow saved to localStorage');
  }
  function exportFlow() {
    console.log({ nodes, connections: conns });
    alert('Flow exported to console');
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="h-screen flex flex-col">
        {/* simplified header: Back to Flow + Save */}
        <header className="border-b border-ios-border bg-black/80 backdrop-blur-md z-50">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                <span className="text-xs font-semibold">FS</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">
                  Flow Builder
                </h1>
                <p className="text-xs text-ios-textMuted">SMS Flow Designer</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const fn = (window as any).__navigate;
                  if (fn) fn('/flow');
                  else window.location.pathname = '/flow';
                }}
                className="px-3 py-1.5 rounded-xl text-xs bg-white/5 border border-white/10 hover:bg-white/10"
              >
                Back to Flow
              </button>

              <button
                onClick={saveFlow}
                className="px-3 py-1.5 rounded-xl text-xs bg-sky-500/90 hover:bg-sky-500"
              >
                Save
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-64 border-r border-ios-border bg-ios-card overflow-y-auto p-4">
            <h2 className="text-sm font-semibold mb-3 text-ios-textMuted uppercase">
              Node Types
            </h2>
            {(
              ['start', 'message', 'condition', 'action', 'end'] as NodeType[]
            ).map((t) => (
              <div
                key={t}
                draggable
                onDragStart={(e) => onPaletteDragStart(e, t)}
                className="node-template bg-white/2 border border-white/10 rounded-xl p-3 mb-2 cursor-grab"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5">{nodeConfigs[t].icon}</div>
                  <span className="text-sm font-medium capitalize">{t}</span>
                </div>
                <p className="text-xs text-ios-textMuted">
                  {t === 'message'
                    ? 'AI or user message'
                    : t === 'start'
                    ? 'Conversation begins'
                    : t === 'condition'
                    ? 'If/then decision'
                    : t === 'action'
                    ? 'Execute function'
                    : 'Conversation ends'}
                </p>
              </div>
            ))}
          </div>

          <div className="flex-1 relative overflow-hidden">
            <svg
              ref={svgRef}
              className="absolute inset-0 w-full h-full"
              onClick={() => {
                connectingFrom.current = null;
                document.body.style.cursor = '';
                setSelectedId(null);
              }}
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="#0ea5e9" />
                </marker>
              </defs>
              <g>
                {conns.map((c) => (
                  <path
                    key={c.id}
                    d={computePath(c, nodes)}
                    className="connection-line"
                    markerEnd="url(#arrowhead)"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    fill="none"
                  />
                ))}
              </g>
            </svg>

            <div
              ref={nodesContainerRef}
              id="nodesContainer"
              className="absolute inset-0"
              onDrop={onCanvasDrop}
              onDragOver={onCanvasDragOver}
            >
              {nodes.map((n) => {
                const cfg = nodeConfigs[n.type];
                const isSelected = selectedId === n.id;
                return (
                  <div
                    key={n.id}
                    data-node-id={n.id}
                    onMouseDown={(e) => onNodeMouseDown(e, n)}
                    className={`node absolute bg-gradient-to-br ${
                      cfg.color
                    } border-2 border-white/20 rounded-xl p-4 shadow-glow ${
                      isSelected ? 'selected' : ''
                    }`}
                    style={{ left: n.x, top: n.y, width: n.width }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(n.id);
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-sm">{cfg.icon}</div>
                      <span className="text-xs font-semibold uppercase">
                        {n.type}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNode(n.id);
                        }}
                        className="ml-auto h-6 w-6 rounded bg-black/20 hover:bg-red-500"
                      >
                        ✕
                      </button>
                    </div>

                    <input
                      className="w-full bg-black/30 border border-white/20 rounded px-2 py-1 text-sm"
                      value={n.text}
                      onChange={(e) => updateNodeText(n.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />

                    <div className="mt-2 flex gap-2 items-center">
                      <div className="flex-1 text-xs text-ios-textMuted"> </div>
                      <div className="flex gap-2 ml-auto">
                        {Array.from({ length: cfg.outputs }).map((_, i) => (
                          <div
                            key={i}
                            onMouseDown={(e) => startConnection(e, n.id, i)}
                            className="port w-4 h-4 rounded-full bg-sky-400 border border-white/60 cursor-pointer"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            id="propertiesPanel"
            className={`w-80 border-l border-ios-border bg-ios-card overflow-y-auto ${
              selectedId ? 'block' : 'hidden'
            }`}
          >
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide">
                  Properties
                </h2>
                <button
                  onClick={() => setSelectedId(null)}
                  className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/15"
                >
                  ✕
                </button>
              </div>
              {selectedId &&
                (() => {
                  const s = nodes.find((n) => n.id === selectedId)!;
                  return (
                    <div>
                      <div className="mb-3">
                        <label className="block text-xs text-ios-textMuted mb-2">
                          Node Type
                        </label>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-2">
                          <span>{nodeConfigs[s.type].icon}</span>
                          <span className="text-sm font-medium capitalize">
                            {s.type}
                          </span>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="block text-xs text-ios-textMuted mb-2">
                          Label/Text
                        </label>
                        <textarea
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm resize-none"
                          rows={3}
                          value={s.text}
                          onChange={(e) => updateNodeText(s.id, e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-ios-textMuted mb-2">
                          Position
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            className="bg-white/5 border border-white/10 rounded-xl p-2 text-sm"
                            value={Math.round(s.x)}
                            onChange={(e) =>
                              setNodes((prev) =>
                                prev.map((n) =>
                                  n.id === s.id
                                    ? { ...n, x: Number(e.target.value) }
                                    : n
                                )
                              )
                            }
                          />
                          <input
                            className="bg-white/5 border border-white/10 rounded-xl p-2 text-sm"
                            value={Math.round(s.y)}
                            onChange={(e) =>
                              setNodes((prev) =>
                                prev.map((n) =>
                                  n.id === s.id
                                    ? { ...n, y: Number(e.target.value) }
                                    : n
                                )
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

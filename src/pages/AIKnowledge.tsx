import React, { useEffect, useRef, useState } from 'react';
import {
  NodeType,
  Node,
  Conn,
  nodeConfigs,
  makeId,
  computePath,
} from '../utils/flowUtils';

export default function AIKnowledge(): JSX.Element {
  useEffect(() => {
    document.title = 'Fade Station · AI Knowledge';
    const meta =
      document.querySelector('meta[name="description"]') ??
      document.createElement('meta');
    meta.setAttribute('name', 'description');
    meta.setAttribute('content', 'Configure AI Knowledge Messages');
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

  // Load saved or initialize with predefined message nodes
  useEffect(() => {
    const saved = localStorage.getItem('fadeStationAIKnowledge');
    if (saved) {
      try {
        const f = JSON.parse(saved);
        setNodes(f.nodes || []);
        setConns(f.connections || []);
        nextIdRef.current = (f.nextId || 1000) + 1;
        return;
      } catch {}
    }

    // Initialize with predefined message nodes
    const predefinedNodes: Node[] = [
      {
        id: 'node_welcome',
        type: 'message' as NodeType,
        x: 50,
        y: 50,
        width: 200,
        height: 120,
        text: 'Welcome! How can I help you today?',
      },
      {
        id: 'node_end',
        type: 'message' as NodeType,
        x: 300,
        y: 50,
        width: 200,
        height: 120,
        text: 'Thank you for contacting us. Have a great day!',
      },
      {
        id: 'node_sorry',
        type: 'message' as NodeType,
        x: 550,
        y: 50,
        width: 200,
        height: 120,
        text: "I apologize, but I didn't understand that. Could you please rephrase?",
      },
      {
        id: 'node_booking',
        type: 'message' as NodeType,
        x: 50,
        y: 200,
        width: 200,
        height: 120,
        text: 'I can help you book an appointment. What date and time works for you?',
      },
      {
        id: 'node_pricing',
        type: 'message' as NodeType,
        x: 300,
        y: 200,
        width: 200,
        height: 120,
        text: 'Our services range from $40 to $45. Would you like to know more about our barbers?',
      },
      {
        id: 'node_hours',
        type: 'message' as NodeType,
        x: 550,
        y: 200,
        width: 200,
        height: 120,
        text: 'We are open Mon-Fri: 9:00 AM - 6:00 PM, Sat: 9:00 AM - 5:00 PM, Sun: Closed.',
      },
      {
        id: 'node_location',
        type: 'message' as NodeType,
        x: 50,
        y: 350,
        width: 200,
        height: 120,
        text: 'We are located at 1 Fern Court, Parafield Gardens, SA 5107.',
      },
      {
        id: 'node_contact',
        type: 'message' as NodeType,
        x: 300,
        y: 350,
        width: 200,
        height: 120,
        text: "You can reach us at 0483 804 522. We're here to help!",
      },
      {
        id: 'node_confirmation',
        type: 'message' as NodeType,
        x: 550,
        y: 350,
        width: 200,
        height: 120,
        text: 'Your appointment has been confirmed. You will receive a confirmation message shortly.',
      },
    ];

    setNodes(predefinedNodes);
    nextIdRef.current = 10;
  }, []);

  // Node dragging
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
      'fadeStationAIKnowledge',
      JSON.stringify({ nodes, connections: conns, nextId: nextIdRef.current })
    );
    alert('AI Knowledge saved successfully!');
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="h-screen flex flex-col">
        <header className="border-b border-ios-border bg-black/80 backdrop-blur-md z-50">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                <span className="text-xs font-semibold">FS</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">
                  AI Knowledge
                </h1>
                <p className="text-xs text-ios-textMuted">
                  Configure AI Messages
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const fn = (window as any).__navigate;
                  if (fn) fn('/admin');
                  else window.location.pathname = '/admin';
                }}
                className="px-3 py-1.5 rounded-xl text-xs bg-white/5 border border-white/10 hover:bg-white/10"
              >
                Back to Admin
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
              className="absolute inset-0 overflow-auto"
              style={{ padding: '20px' }}
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
                      isSelected ? 'selected ring-2 ring-sky-400' : ''
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
                        {n.id.replace('node_', '').replace('_', ' ')}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNode(n.id);
                        }}
                        className="ml-auto h-6 w-6 rounded bg-black/20 hover:bg-red-500 flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>

                    <textarea
                      className="w-full bg-black/30 border border-white/20 rounded px-2 py-1 text-sm resize-none"
                      value={n.text}
                      onChange={(e) => updateNodeText(n.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      rows={3}
                      placeholder="Enter message..."
                    />
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
                  Message Configuration
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
                          Message Content
                        </label>
                        <textarea
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm resize-none"
                          rows={6}
                          value={s.text}
                          onChange={(e) => updateNodeText(s.id, e.target.value)}
                          placeholder="Enter the message that the AI will use..."
                        />
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

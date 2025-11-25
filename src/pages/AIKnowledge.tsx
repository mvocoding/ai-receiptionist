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
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Load saved or initialize nodes
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

    const predefinedNodes: Node[] = [
      {
        id: 'node_welcome',
        type: 'message' as NodeType,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        text: 'Welcome! How can I help you today?',
      },
      {
        id: 'node_end',
        type: 'message' as NodeType,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        text: 'Thank you for contacting us. Have a great day!',
      },
      {
        id: 'node_sorry',
        type: 'message' as NodeType,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        text: "I apologize, but I didn't understand that. Could you please rephrase?",
      },
      {
        id: 'node_booking',
        type: 'message' as NodeType,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        text: 'I can help you book an appointment. What date and time works for you?',
      },
      {
        id: 'node_pricing',
        type: 'message' as NodeType,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        text: 'Our services range from $40 to $45. Would you like to know more about our barbers?',
      },
      {
        id: 'node_hours',
        type: 'message' as NodeType,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        text: 'We are open Mon-Fri: 9:00 AM - 6:00 PM, Sat: 9:00 AM - 5:00 PM, Sun: Closed.',
      },
      {
        id: 'node_location',
        type: 'message' as NodeType,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        text: 'We are located at 1 Fern Court, Parafield Gardens, SA 5107.',
      },
      {
        id: 'node_contact',
        type: 'message' as NodeType,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        text: "You can reach us at 0483 804 522. We're here to help!",
      },
      {
        id: 'node_confirmation',
        type: 'message' as NodeType,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        text: 'Your appointment has been confirmed. You will receive a confirmation message shortly.',
      },
    ];

    setNodes(predefinedNodes);
    nextIdRef.current = 10;
  }, []);

  useEffect(() => {
    if (!nodesContainerRef.current || nodes.length === 0) return;

    const updateLayout = () => {
      const container = nodesContainerRef.current;
      if (!container) return;

      const padding = 24;
      const gap = 16;
      const containerWidth = container.clientWidth - padding * 2;
      const containerHeight = container.clientHeight - padding * 2;

      if (containerWidth <= 0 || containerHeight <= 0) return;

      setContainerSize({ width: containerWidth, height: containerHeight });

      const nodeCount = nodes.length;
      const cols = Math.ceil(Math.sqrt(nodeCount));
      const rows = Math.ceil(nodeCount / cols);

      const totalGapWidth = gap * (cols - 1);
      const totalGapHeight = gap * (rows - 1);
      const nodeWidth = (containerWidth - totalGapWidth) / cols;
      const nodeHeight = (containerHeight - totalGapHeight) / rows;

      setNodes((prevNodes) => {
        if (prevNodes.length !== nodeCount) return prevNodes;

        return prevNodes.map((node, index) => {
          const col = index % cols;
          const row = Math.floor(index / cols);
          return {
            ...node,
            x: padding + col * (nodeWidth + gap),
            y: padding + row * (nodeHeight + gap),
            width: nodeWidth,
            height: nodeHeight,
          };
        });
      });
    };

    const timeoutId = setTimeout(updateLayout, 50);

    const resizeObserver = new ResizeObserver(() => {
      updateLayout();
    });

    if (nodesContainerRef.current) {
      resizeObserver.observe(nodesContainerRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [nodes.length]);

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
              className="absolute inset-0 overflow-hidden bg-gradient-to-br from-black via-[#0a0a0a] to-black"
            >
              {nodes.map((n) => {
                const cfg = nodeConfigs[n.type];
                const isSelected = selectedId === n.id;
                return (
                  <div
                    key={n.id}
                    data-node-id={n.id}
                    className={`node absolute bg-gradient-to-br ${
                      cfg.color
                    } border border-white/30 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-200 ${
                      isSelected
                        ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-black scale-[1.02]'
                        : 'hover:border-white/40 hover:scale-[1.01]'
                    }`}
                    style={{
                      left: `${n.x}px`,
                      top: `${n.y}px`,
                      width: `${n.width}px`,
                      height: `${n.height}px`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(n.id);
                    }}
                  >
                    <div className="flex items-center gap-2.5 mb-3 pb-2 border-b border-white/10">
                      <div className="text-base">{cfg.icon}</div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-white/90 truncate flex-1">
                        {n.id.replace('node_', '').replace('_', ' ')}
                      </span>
                    </div>

                    <textarea
                      className="w-full h-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all text-white/90 placeholder:text-white/40"
                      value={n.text}
                      onChange={(e) => updateNodeText(n.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Enter message..."
                      style={{ height: `calc(100% - 3.5rem)` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div
            id="propertiesPanel"
            className={`w-80 border-l border-white/10 bg-gradient-to-b from-[#0a0a0a] to-black overflow-y-auto transition-all duration-300 ${
              selectedId ? 'block' : 'hidden'
            }`}
          >
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-white/90">
                  Message Configuration
                </h2>
                <button
                  onClick={() => setSelectedId(null)}
                  className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white/70 hover:text-white"
                >
                  ✕
                </button>
              </div>
              {selectedId &&
                (() => {
                  const s = nodes.find((n) => n.id === selectedId)!;
                  return (
                    <div>
                      <div className="mb-5">
                        <label className="block text-xs font-medium text-white/70 mb-2.5 uppercase tracking-wide">
                          Node Type
                        </label>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                          <span className="text-lg">
                            {nodeConfigs[s.type].icon}
                          </span>
                          <span className="text-sm font-medium capitalize text-white/90">
                            {s.type}
                          </span>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-white/70 mb-2.5 uppercase tracking-wide">
                          Message Content
                        </label>
                        <textarea
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all text-white/90 placeholder:text-white/40"
                          rows={8}
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

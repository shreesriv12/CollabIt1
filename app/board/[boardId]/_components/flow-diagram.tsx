"use client";

import React, { useCallback, useState, useRef, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  ReactFlowProvider,
  Panel,
  MarkerType,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { 
  X, 
  Download, 
  Upload, 
  Trash2, 
  Plus,
  Square,
  Diamond,
  Database,
  FileText,
  Circle,
  Workflow
} from 'lucide-react';
import { 
  ProcessNode, 
  DecisionNode, 
  DatabaseNode, 
  DocumentNode, 
  StartEndNode 
} from './custom-nodes';

const nodeTypes: NodeTypes = {
  process: ProcessNode,
  decision: DecisionNode,
  database: DatabaseNode,
  document: DocumentNode,
  startEnd: StartEndNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'startEnd',
    data: { label: 'Start Process' },
    position: { x: 250, y: 50 },
  },
  {
    id: '2',
    type: 'process',
    data: { label: 'Load Data' },
    position: { x: 200, y: 150 },
  },
  {
    id: '3',
    type: 'decision',
    data: { label: 'Valid Data?' },
    position: { x: 225, y: 260 },
  },
  {
    id: '4',
    type: 'database',
    data: { label: 'Store Results' },
    position: { x: 100, y: 380 },
  },
  {
    id: '5',
    type: 'document',
    data: { label: 'Error Report' },
    position: { x: 350, y: 380 },
  },
  {
    id: '6',
    type: 'startEnd',
    data: { label: 'Complete' },
    position: { x: 250, y: 500 },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { strokeWidth: 2 },
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { strokeWidth: 2 },
  },
  {
    id: 'e3-4',
    source: '3',
    target: '4',
    markerEnd: { type: MarkerType.ArrowClosed },
    label: '✓ Yes',
    labelStyle: { fontSize: '12px', fontWeight: 'bold', fill: '#10b981' },
    style: { strokeWidth: 2, stroke: '#10b981' },
    sourceHandle: 'left',
  },
  {
    id: 'e3-5',
    source: '3',
    target: '5',
    markerEnd: { type: MarkerType.ArrowClosed },
    label: '✗ No',
    labelStyle: { fontSize: '12px', fontWeight: 'bold', fill: '#ef4444' },
    style: { strokeWidth: 2, stroke: '#ef4444' },
    sourceHandle: 'right',
  },
  {
    id: 'e4-6',
    source: '4',
    target: '6',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { strokeWidth: 2 },
  },
  {
    id: 'e5-6',
    source: '5',
    target: '6',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { strokeWidth: 2 },
  },
];

interface FlowDiagramProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FlowDiagram: React.FC<FlowDiagramProps> = ({ isOpen, onClose }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeId, setNodeId] = useState(7);
  const [showPalette, setShowPalette] = useState(false);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        setEdges((eds) => addEdge({
          ...params,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { strokeWidth: 2 },
          labelStyle: { fontSize: '12px' },
        }, eds));
      }
    },
    [setEdges]
  );

  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    setEditingNode(node.id);
    setEditingText(node.data.label);
  }, []);

  const handleNodeLabelChange = useCallback((nodeId: string, newLabel: string) => {
    setNodes((nds) => nds.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            label: newLabel,
          },
        };
      }
      return node;
    }));
    setEditingNode(null);
    setEditingText('');
  }, [setNodes]);

  const handleEditSubmit = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && editingNode) {
      handleNodeLabelChange(editingNode, editingText);
    } else if (e.key === 'Escape') {
      setEditingNode(null);
      setEditingText('');
    }
  }, [editingNode, editingText, handleNodeLabelChange]);

  const addNodeOfType = useCallback((type: string, label: string) => {
    const newNode: Node = {
      id: nodeId.toString(),
      type,
      data: { label },
      position: { 
        x: 200 + Math.random() * 100, 
        y: 200 + Math.random() * 100 
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setNodeId((id) => id + 1);
    setShowPalette(false);
  }, [nodeId, setNodes]);

  const clearFlow = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, [setNodes, setEdges]);

  const exportFlow = useCallback(() => {
    const flowData = { nodes, edges };
    const dataStr = JSON.stringify(flowData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'flow-diagram.json';
    link.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  const importFlow = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const flowData = JSON.parse(e.target?.result as string);
            setNodes(flowData.nodes || []);
            setEdges(flowData.edges || []);
          } catch (error) {
            console.error('Error importing flow:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [setNodes, setEdges]);

  const nodeTypeButtons = [
    { type: 'startEnd', label: 'Start/End', icon: Circle, color: 'purple' },
    { type: 'process', label: 'Process', icon: Square, color: 'blue' },
    { type: 'decision', label: 'Decision', icon: Diamond, color: 'yellow' },
    { type: 'database', label: 'Database', icon: Database, color: 'blue' },
    { type: 'document', label: 'Document', icon: FileText, color: 'green' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white">
      <ReactFlowProvider>
        <div className="w-full h-full relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDoubleClick={onNodeDoubleClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-50"
            connectionLineStyle={{ strokeWidth: 2, stroke: '#6366f1' }}
            defaultEdgeOptions={{
              style: { strokeWidth: 2, stroke: '#6b7280' },
              markerEnd: { type: MarkerType.ArrowClosed },
            }}
            snapToGrid
            snapGrid={[15, 15]}
            attributionPosition="bottom-left"
          >
            <Background />
            <Controls />
            <MiniMap 
              nodeColor={(node) => {
                switch (node.type) {
                  case 'process': return '#3b82f6';
                  case 'decision': return '#eab308';
                  case 'database': return '#2563eb';
                  case 'document': return '#16a34a';
                  case 'startEnd': return '#9333ea';
                  default: return '#6b7280';
                }
              }}
            />
            
            <Panel position="top-left" className="bg-white rounded-lg shadow-md border p-3">
              <div className="flex flex-col gap-2">
                <Button
                  onClick={onClose}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Close
                </Button>
                <div className="text-xs text-gray-600 border-t pt-2">
                  💡 Double-click nodes to rename
                </div>
              </div>
            </Panel>

            <Panel position="top-right" className="bg-white rounded-lg shadow-md border p-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => setShowPalette(!showPalette)}
                  variant={showPalette ? "default" : "outline"}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Node
                </Button>
                
                <Button
                  onClick={exportFlow}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 hover:bg-blue-50"
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
                
                <Button
                  onClick={importFlow}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 hover:bg-green-50"
                >
                  <Upload className="w-4 h-4" />
                  Import
                </Button>
                
                <Button
                  onClick={clearFlow}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 hover:bg-red-50 text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </Button>
              </div>
            </Panel>

            {/* Node Palette */}
            {showPalette && (
              <Panel position="top-center" className="bg-white rounded-lg shadow-xl border-2 p-4 max-w-md">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Workflow className="w-4 h-4 text-blue-600" />
                    Add Node
                  </h3>
                  <Button
                    onClick={() => setShowPalette(false)}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {nodeTypeButtons.map(({ type, label, icon: Icon, color }) => (
                    <Button
                      key={type}
                      onClick={() => {
                        addNodeOfType(type, label);
                        setShowPalette(false);
                      }}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 h-auto py-3 px-3 hover:scale-105 transition-transform"
                    >
                      <Icon className={`w-4 h-4 text-${color}-600`} />
                      <span className="text-xs font-medium">{label}</span>
                    </Button>
                  ))}
                </div>
              </Panel>
            )}
          </ReactFlow>
          
          {/* Node Editing Input */}
          {editingNode && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 z-50">
              <div className="bg-white p-4 rounded-lg shadow-xl border-2 min-w-64">
                <h4 className="text-sm font-semibold mb-3">Rename Node</h4>
                <input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={handleEditSubmit}
                  autoFocus
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter node name..."
                />
                <div className="flex gap-2 mt-3">
                  <Button
                    onClick={() => handleNodeLabelChange(editingNode, editingText)}
                    size="sm"
                    className="flex-1"
                  >
                    Save
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingNode(null);
                      setEditingText('');
                    }}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Press Enter to save, Escape to cancel
                </div>
              </div>
            </div>
          )}
        </div>
      </ReactFlowProvider>
    </div>
  );
};
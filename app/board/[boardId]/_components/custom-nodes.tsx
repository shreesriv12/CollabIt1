"use client";

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Database, FileText, Diamond, Circle, Square, Triangle } from 'lucide-react';

// Custom Process Node
export const ProcessNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-lg bg-white border-2 transition-all duration-200 hover:shadow-xl ${
        selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 !bg-blue-500 border-2 border-white"
      />
      <div className="flex items-center gap-2">
        <Square className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-gray-800">{data.label}</span>
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 !bg-blue-500 border-2 border-white"
      />
    </div>
  );
});

// Custom Decision Node
export const DecisionNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={`relative w-28 h-28 transition-all duration-200 ${
        selected ? 'ring-4 ring-yellow-300' : 'hover:scale-105'
      }`}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 !bg-yellow-500 border-2 border-white"
      />
      <div 
        className="w-full h-full bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-400 transform rotate-45 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
      >
        <span className="text-xs font-semibold transform -rotate-45 text-center px-2 text-yellow-800 max-w-20 leading-tight">
          {data.label}
        </span>
      </div>
      <Handle 
        type="source" 
        position={Position.Left} 
        style={{ left: '8px', top: '50%' }} 
        className="w-3 h-3 !bg-yellow-500 border-2 border-white"
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        style={{ right: '8px', top: '50%' }} 
        className="w-3 h-3 !bg-yellow-500 border-2 border-white"
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 !bg-yellow-500 border-2 border-white"
      />
    </div>
  );
});

// Custom Database Node
export const DatabaseNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border-2 transition-all duration-200 hover:shadow-xl ${
        selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-blue-300 hover:border-blue-400'
      }`}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 !bg-blue-500 border-2 border-white"
      />
      <div className="flex items-center gap-2">
        <Database className="w-5 h-5 text-blue-600" />
        <span className="text-sm font-semibold text-blue-800">{data.label}</span>
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 !bg-blue-500 border-2 border-white"
      />
    </div>
  );
});

// Custom Document Node
export const DocumentNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={`px-4 py-3 shadow-lg bg-gradient-to-br from-green-50 to-green-100 border-2 transition-all duration-200 hover:shadow-xl relative ${
        selected ? 'border-green-500 ring-2 ring-green-200' : 'border-green-300 hover:border-green-400'
      }`}
      style={{
        borderRadius: '8px 8px 0 8px',
        clipPath: 'polygon(0% 0%, 85% 0%, 100% 15%, 100% 100%, 0% 100%)'
      }}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 !bg-green-500 border-2 border-white"
      />
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-green-600" />
        <span className="text-sm font-semibold text-green-800">{data.label}</span>
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 !bg-green-500 border-2 border-white"
      />
    </div>
  );
});

// Custom Start/End Node
export const StartEndNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={`px-6 py-4 shadow-lg rounded-full bg-gradient-to-r from-purple-50 to-purple-100 border-2 transition-all duration-200 hover:shadow-xl hover:scale-105 ${
        selected ? 'border-purple-500 ring-2 ring-purple-200' : 'border-purple-300 hover:border-purple-400'
      }`}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 !bg-purple-500 border-2 border-white"
      />
      <div className="flex items-center gap-2">
        <Circle className="w-4 h-4 text-purple-600" />
        <span className="text-sm font-semibold text-purple-800 whitespace-nowrap">{data.label}</span>
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 !bg-purple-500 border-2 border-white"
      />
    </div>
  );
});

ProcessNode.displayName = 'ProcessNode';
DecisionNode.displayName = 'DecisionNode';
DatabaseNode.displayName = 'DatabaseNode';
DocumentNode.displayName = 'DocumentNode';
StartEndNode.displayName = 'StartEndNode';
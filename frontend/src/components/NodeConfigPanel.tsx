import { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import { NodeDefinition } from '../types';
import { X, Save } from 'lucide-react';

interface NodeConfigPanelProps {
  node: Node;
  nodeDefinitions: NodeDefinition[];
  onUpdate: (nodeId: string, data: any) => void;
  onClose: () => void;
}

const NodeConfigPanel = ({ node, nodeDefinitions, onUpdate, onClose }: NodeConfigPanelProps) => {
  const [parameters, setParameters] = useState<any>(node.data.parameters || {});
  const [label, setLabel] = useState(node.data.label || '');

  const nodeDefinition = nodeDefinitions.find((n) => n.node_type === node.data.nodeType);
  const inputSchema = nodeDefinition?.input_schema?.properties || {};

  useEffect(() => {
    setParameters(node.data.parameters || {});
    setLabel(node.data.label || '');
  }, [node]);

  const handleParameterChange = (key: string, value: any) => {
    setParameters((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onUpdate(node.id, {
      label,
      parameters,
    });
  };

  const renderField = (key: string, schema: any) => {
    const value = parameters[key] || schema.default || '';

    if (schema.enum) {
      // Dropdown
      return (
        <select
          value={value}
          onChange={(e) => handleParameterChange(key, e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Select...</option>
          {schema.enum.map((option: string) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    if (schema.type === 'boolean') {
      // Checkbox
      return (
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => handleParameterChange(key, e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span>{schema.description}</span>
        </label>
      );
    }

    if (schema.type === 'number') {
      // Number input
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => handleParameterChange(key, parseFloat(e.target.value))}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder={schema.description}
        />
      );
    }

    if (schema.type === 'object') {
      // JSON editor
      return (
        <textarea
          value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              handleParameterChange(key, parsed);
            } catch {
              handleParameterChange(key, e.target.value);
            }
          }}
          rows={5}
          className="w-full px-3 py-2 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder={schema.description}
        />
      );
    }

    // Default: text input
    return (
      <textarea
        value={value}
        onChange={(e) => handleParameterChange(key, e.target.value)}
        rows={3}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        placeholder={schema.description}
      />
    );
  };

  return (
    <div className="w-96 bg-white border-l flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Node Configuration</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Node Label */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Node Label
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter label..."
          />
        </div>

        {/* Node Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Node Type
          </label>
          <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600">
            {nodeDefinition?.display_name || node.data.nodeType}
          </div>
        </div>

        {/* Parameters */}
        {Object.keys(inputSchema).map((key) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
              {inputSchema[key].required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderField(key, inputSchema[key])}
            {inputSchema[key].description && (
              <p className="mt-1 text-xs text-gray-500">{inputSchema[key].description}</p>
            )}
          </div>
        ))}

        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
          <p className="font-medium mb-1">💡 Expression Support</p>
          <p>Use <code className="bg-white px-1 rounded">{'{{$node.nodeId.data.field}}'}</code> to reference previous node outputs</p>
          <p className="mt-1">Use <code className="bg-white px-1 rounded">{'{{$trigger.data}}'}</code> to reference trigger data</p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition"
        >
          <Save size={16} />
          <span>Save Configuration</span>
        </button>
      </div>
    </div>
  );
};

export default NodeConfigPanel;

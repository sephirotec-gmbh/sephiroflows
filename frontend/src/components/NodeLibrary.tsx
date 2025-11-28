import { useState } from 'react';
import { NodeDefinition } from '../types';
import { X, Search } from 'lucide-react';

interface NodeLibraryProps {
  nodeDefinitions: NodeDefinition[];
  onNodeSelect: (nodeType: string, nodeDef: NodeDefinition) => void;
  onClose: () => void;
}

const NodeLibrary = ({ nodeDefinitions, onNodeSelect, onClose }: NodeLibraryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...new Set(nodeDefinitions.map((n) => n.category))];

  const filteredNodes = nodeDefinitions.filter((node) => {
    const matchesSearch = node.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         node.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || node.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      trigger: 'bg-green-100 text-green-800',
      action: 'bg-blue-100 text-blue-800',
      transform: 'bg-purple-100 text-purple-800',
      logic: 'bg-orange-100 text-orange-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="w-80 bg-white border-r flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Node Library</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition"
        >
          <X size={20} />
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="p-4 border-b">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Nodes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredNodes.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No nodes found</p>
        ) : (
          filteredNodes.map((node) => (
            <div
              key={node.id}
              onClick={() => onNodeSelect(node.node_type, node)}
              className="p-3 border rounded-lg hover:border-primary-500 hover:bg-primary-50 cursor-pointer transition"
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{node.icon || '📦'}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm">{node.display_name}</h4>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{node.description}</p>
                  <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                    getCategoryColor(node.category)
                  }`}>
                    {node.category}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NodeLibrary;

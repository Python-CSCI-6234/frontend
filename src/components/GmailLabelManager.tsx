'use client';

import { useState } from 'react';
import { useGmailLabels, GmailLabel } from '@/hooks/useGmailLabels';

export default function GmailLabelManager() {
  const {
    labels,
    isLoading,
    isError,
    error,
    createLabel,
    deleteLabel,
    updateLabel,
    isCreating,
    isDeleting,
    isUpdating,
  } = useGmailLabels();

  const [newLabelName, setNewLabelName] = useState('');
  const [editLabelId, setEditLabelId] = useState<string | null>(null);
  const [editLabelName, setEditLabelName] = useState('');

  const handleCreateLabel = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLabelName.trim()) {
      createLabel(newLabelName.trim());
      setNewLabelName('');
    }
  };

  const handleDeleteLabel = (id: string) => {
    if (window.confirm('Are you sure you want to delete this label?')) {
      deleteLabel(id);
    }
  };

  const handleStartEdit = (label: GmailLabel) => {
    setEditLabelId(label.id);
    setEditLabelName(label.name);
  };

  const handleCancelEdit = () => {
    setEditLabelId(null);
    setEditLabelName('');
  };

  const handleUpdateLabel = (e: React.FormEvent) => {
    e.preventDefault();
    if (editLabelId && editLabelName.trim()) {
      updateLabel({ id: editLabelId, name: editLabelName.trim() });
      setEditLabelId(null);
      setEditLabelName('');
    }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-[300px]">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-6 w-24 bg-gray-200 rounded mb-4"></div>
        <div className="h-10 w-full max-w-md bg-gray-200 rounded mb-2"></div>
        <div className="h-10 w-full max-w-md bg-gray-200 rounded"></div>
      </div>
    </div>
  );
  
  if (isError) return (
    <div className="p-6 border border-red-200 rounded-lg bg-red-50 text-red-600 max-w-xl mx-auto my-4">
      <h3 className="font-medium mb-2">Unable to load labels</h3>
      <p>{error || 'Failed to load labels'}</p>
    </div>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gmail Labels</h2>
        <div className="text-sm text-gray-500">{labels.length} labels</div>
      </div>
      
      {/* Create new label form */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-8">
        <h3 className="font-medium text-gray-700 mb-3">Create new label</h3>
        <form onSubmit={handleCreateLabel}>
          <div className="flex gap-2">
            <input
              type="text"
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              placeholder="Enter label name"
              className="px-4 py-2 border rounded-md flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isCreating}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isCreating || !newLabelName.trim()}
            >
              {isCreating ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : 'Create Label'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Labels list */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="border-b px-4 py-3 bg-gray-50">
          <h3 className="font-medium text-gray-700">Your labels</h3>
        </div>
        
        {labels.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No labels found. Create your first label above.</p>
          </div>
        ) : (
          <ul className="divide-y">
            {labels.map((label) => (
              <li key={label.id} className="px-4 py-3 hover:bg-gray-50 transition duration-150">
                {editLabelId === label.id ? (
                  <form onSubmit={handleUpdateLabel} className="flex gap-2">
                    <input
                      type="text"
                      value={editLabelName}
                      onChange={(e) => setEditLabelName(e.target.value)}
                      className="px-3 py-1 border rounded-md flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isUpdating}
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-150 disabled:opacity-50"
                      disabled={isUpdating || !editLabelName.trim()}
                    >
                      {isUpdating ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span 
                        className="inline-block w-4 h-4 rounded-full flex-shrink-0 border border-gray-200" 
                        style={{
                          backgroundColor: label.color?.backgroundColor || '#e0e0e0',
                        }} 
                      />
                      <span className="font-medium">{label.name}</span>
                      {label.type === 'system' && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">System</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {label.type !== 'system' && (
                        <>
                          <button
                            onClick={() => handleStartEdit(label)}
                            className="p-1.5 text-gray-600 hover:text-blue-600 rounded-md hover:bg-blue-50 transition duration-150"
                            disabled={isDeleting || isUpdating}
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteLabel(label.id)}
                            className="p-1.5 text-gray-600 hover:text-red-600 rounded-md hover:bg-red-50 transition duration-150"
                            disabled={isDeleting || isUpdating}
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                              <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 
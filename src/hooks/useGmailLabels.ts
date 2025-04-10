import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface GmailLabel {
  id: string;
  name: string;
  type: string;
  messageListVisibility?: string;
  labelListVisibility?: string;
  color?: {
    textColor: string;
    backgroundColor: string;
  };
}

export function useGmailLabels() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const fetchLabels = async (): Promise<{ labels: GmailLabel[] }> => {
    const response = await fetch('/api/labels');
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch Gmail labels');
    }
    
    return response.json();
  };

  const createLabel = async (name: string): Promise<GmailLabel> => {
    const response = await fetch('/api/labels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create label');
    }
    
    const data = await response.json();
    return data.label;
  };

  const deleteLabel = async (id: string): Promise<void> => {
    const response = await fetch(`/api/labels/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete label');
    }
  };

  const updateLabel = async ({ id, name }: { id: string; name: string }): Promise<GmailLabel> => {
    const response = await fetch(`/api/labels/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update label');
    }
    
    const data = await response.json();
    return data.label;
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['gmailLabels'],
    queryFn: fetchLabels,
  });

  const createLabelMutation = useMutation({
    mutationFn: createLabel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gmailLabels'] });
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const deleteLabelMutation = useMutation({
    mutationFn: deleteLabel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gmailLabels'] });
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const updateLabelMutation = useMutation({
    mutationFn: updateLabel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gmailLabels'] });
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  return {
    labels: data?.labels || [],
    isLoading,
    isError,
    error,
    refetch,
    createLabel: createLabelMutation.mutate,
    deleteLabel: deleteLabelMutation.mutate,
    updateLabel: updateLabelMutation.mutate,
    isCreating: createLabelMutation.isPending,
    isDeleting: deleteLabelMutation.isPending,
    isUpdating: updateLabelMutation.isPending,
  };
} 
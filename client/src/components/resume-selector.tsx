import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FileText, Calendar, Palette, Edit2, Save, X, Star, ChevronDown, FolderOpen, Clock, Trash2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ResumeSelectorProps {
  selectedResume: any;
  onResumeSelect: (resume: any) => void;
}

export default function ResumeSelector({ selectedResume, onResumeSelect }: ResumeSelectorProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [resumesOpen, setResumesOpen] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: resumes, isLoading } = useQuery({
    queryKey: ['/api/resumes'],
  });

  // Rename resume mutation
  const renameMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const response = await fetch(`/api/resumes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/resumes'] });
      setEditingId(null);
      toast({
        title: "Resume renamed successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error renaming resume",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete resume mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/resumes/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If JSON parsing fails, use the status text or default message
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      // Check if response has content before parsing JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      } else {
        // If not JSON, just return success
        return { success: true };
      }
    },
    onSuccess: (data, variables) => {
      // Update the cache data directly by removing the deleted resume
      queryClient.setQueryData(['/api/resumes'], (oldData: any[]) => {
        if (!oldData) return [];
        return oldData.filter(resume => resume.id !== variables);
      });
      
      // Also invalidate to force a fresh fetch
      queryClient.invalidateQueries({ queryKey: ['/api/resumes'] });
      
      toast({
        title: "Resume deleted successfully!",
      });
      
      // If the deleted resume was selected, clear the selection
      if (selectedResume && variables === selectedResume.id) {
        onResumeSelect(null);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting resume",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Set default resume mutation
  const setDefaultMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log('Setting default resume:', id);
      const response = await fetch(`/api/resumes/${id}/default`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Force a complete refresh of the resumes data
      queryClient.invalidateQueries({ queryKey: ['/api/resumes'] });
      queryClient.refetchQueries({ queryKey: ['/api/resumes'] });
      toast({
        title: "Default resume updated!",
      });
    },
    onError: (error: Error) => {
      console.error('Set default error:', error);
      toast({
        title: "Error setting default resume",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (id: number, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const handleSave = (id: number) => {
    if (editingName.trim()) {
      renameMutation.mutate({ id, name: editingName.trim() });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleDelete = (id: number, resumeName: string) => {
    if (window.confirm(`Are you sure you want to delete "${resumeName}"? This action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* JSON Resumes Header */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
        <button 
          onClick={() => {
            console.log('Accordion clicked, current state:', resumesOpen);
            setResumesOpen(!resumesOpen);
          }}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            <span className="font-medium">JSON Resumes ({resumes?.length || 0})</span>
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform ${resumesOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {resumesOpen && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
          {/* New Resume Button */}
          <Card className="border-dashed border-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <CardContent className="p-3">
              <Button 
                variant="ghost" 
                className="w-full h-auto p-2 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400"
                onClick={() => onResumeSelect(null)}
              >
                <FileText className="h-4 w-4" />
                <span className="text-sm">New Resume</span>
              </Button>
            </CardContent>
          </Card>

            {/* Resume List - Clean Rows */}
            <div className="space-y-2">
              {resumes?.map((resume: any) => (
                <div 
                  key={resume.id}
                  className={`group flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                    selectedResume?.id === resume.id 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                  onClick={() => onResumeSelect(resume)}
                >
                  {/* Left side - Resume info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Icon and star */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {resume.isDefault && (
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      )}
                      <FileText className="h-4 w-4 text-gray-400" />
                    </div>

                    {/* Resume details */}
                    <div className="flex-1 min-w-0">
                      {editingId === resume.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="h-8 text-sm font-medium"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSave(resume.id);
                              if (e.key === 'Escape') handleCancel();
                            }}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSave(resume.id);
                            }}
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancel();
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
                              {resume.name}
                            </span>
                            {selectedResume?.id === resume.id && (
                              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                                Selected
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <div className="flex items-center gap-1">
                              <Palette className="h-3 w-3" />
                              <span className="capitalize">{resume.theme}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {new Date(resume.createdAt).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: false
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(resume.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right side - Action buttons */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDefaultMutation.mutate(resume.id);
                      }}
                      disabled={setDefaultMutation.isPending}
                      title={resume.isDefault ? "Default resume" : "Set as default"}
                    >
                      <Star className={`h-3 w-3 ${resume.isDefault ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(resume.id, resume.name);
                      }}
                      title="Rename resume"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(resume.id, resume.name);
                      }}
                      disabled={deleteMutation.isPending}
                      title="Delete resume"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
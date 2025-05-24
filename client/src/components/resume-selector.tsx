import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FileText, Calendar, Palette, Edit2, Save, X, Star, ChevronDown, FolderOpen, Clock, Trash2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { NotificationModal, useNotificationModal } from '@/components/notification-modal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ResumeSelectorProps {
  selectedResume: any;
  onResumeSelect: (resume: any) => void;
}

export default function ResumeSelector({ selectedResume, onResumeSelect }: ResumeSelectorProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingFilenameId, setEditingFilenameId] = useState<number | null>(null);
  const [editingFilename, setEditingFilename] = useState("");
  const [resumesOpen, setResumesOpen] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const { notification, showNotification, closeNotification } = useNotificationModal();
  const queryClient = useQueryClient();

  const { data: resumes, isLoading, refetch } = useQuery({
    queryKey: ['/api/resumes', refreshKey],
    queryFn: async () => {
      const response = await fetch(`/api/resumes`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch resumes');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Auto-select default resume if no resume is currently selected
  useEffect(() => {
    if (resumes && resumes.length > 0 && !selectedResume) {
      const defaultResume = resumes.find((resume: any) => resume.isDefault);
      if (defaultResume) {
        onResumeSelect(defaultResume);
      }
    }
  }, [resumes, selectedResume, onResumeSelect]);

  // Rename resume mutation
  const renameMutation = useMutation({
    mutationFn: async ({ id, name, filename }: { id: number; name?: string; filename?: string }) => {
      const response = await fetch(`/api/resumes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name, filename }),
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
      setEditingFilenameId(null);
      showNotification("success", "Resume Updated", "Resume updated successfully!");
    },
    onError: (error: Error) => {
      showNotification("error", "Rename Failed", error.message);
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
      // Clear selection if the deleted resume was selected
      if (selectedResume && variables === selectedResume.id) {
        onResumeSelect(null);
      }
      
      // Force immediate data refresh
      queryClient.removeQueries({ queryKey: ['/api/resumes'] });
      setRefreshKey(prev => prev + 1);
      refetch();
      
      showNotification("success", "Resume Deleted", "Resume deleted successfully!");
    },
    onError: (error: Error) => {
      showNotification("error", "Delete Failed", error.message);
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
      showNotification("success", "Default Updated", "Default resume updated!");
    },
    onError: (error: Error) => {
      console.error('Set default error:', error);
      showNotification("error", "Update Failed", error.message);
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

  // Filename editing handlers
  const handleEditFilename = (id: number, currentFilename: string) => {
    setEditingFilenameId(id);
    setEditingFilename(currentFilename || '');
  };

  const handleSaveFilename = (id: number) => {
    if (editingFilename.trim()) {
      renameMutation.mutate({ id, filename: editingFilename.trim() });
    }
  };

  const handleCancelFilename = () => {
    setEditingFilenameId(null);
    setEditingFilename("");
  };

  const handleDelete = (id: number, resumeName: string) => {
    deleteMutation.mutate(id);
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
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3 overflow-hidden">
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

            {/* Resume List - Mobile Scrollable, Desktop Paginated */}
            <div className="lg:hidden max-h-80 overflow-y-auto space-y-2 pr-2">
              {/* Mobile: Scrollable List */}
              {resumes?.map((resume: any) => (
                <div 
                  key={resume.id}
                  className={`group flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                    selectedResume?.id === resume.id 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-sm' 
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
                            {resume.filename && (
                              editingFilenameId === resume.id ? (
                                <div className="flex items-center gap-1">
                                  <Input
                                    value={editingFilename}
                                    onChange={(e) => setEditingFilename(e.target.value)}
                                    className="h-6 text-xs font-mono px-2 py-1 min-w-0 w-32"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveFilename(resume.id);
                                      if (e.key === 'Escape') handleCancelFilename();
                                    }}
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSaveFilename(resume.id);
                                    }}
                                  >
                                    <Save className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCancelFilename();
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <button
                                  className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-2 py-1 rounded-full font-mono transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditFilename(resume.id, resume.filename);
                                  }}
                                  title="Click to edit filename"
                                >
                                  {resume.filename}
                                </button>
                              )
                            )}
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

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          disabled={deleteMutation.isPending}
                          title="Delete resume"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Resume</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{resume.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(resume.id, resume.name)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Desktop: Paginated List */}
            <div className="hidden lg:block space-y-2">
              {resumes?.slice(0, 5).map((resume: any) => (
                <div 
                  key={resume.id}
                  className={`group flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                    selectedResume?.id === resume.id 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-sm' 
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
                            {resume.filename && (
                              editingFilenameId === resume.id ? (
                                <div className="flex items-center gap-1">
                                  <Input
                                    value={editingFilename}
                                    onChange={(e) => setEditingFilename(e.target.value)}
                                    className="h-6 text-xs font-mono px-2 py-1 min-w-0 w-32"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveFilename(resume.id);
                                      if (e.key === 'Escape') handleCancelFilename();
                                    }}
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSaveFilename(resume.id);
                                    }}
                                  >
                                    <Save className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCancelFilename();
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <button
                                  className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-2 py-1 rounded-full font-mono transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditFilename(resume.id, resume.filename);
                                  }}
                                  title="Click to edit filename"
                                >
                                  {resume.filename}
                                </button>
                              )
                            )}
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

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          disabled={deleteMutation.isPending}
                          title="Delete resume"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Resume</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{resume.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(resume.id, resume.name)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
              
              {/* Pagination for Desktop */}
              {resumes && resumes.length > 5 && (
                <div className="flex justify-center pt-4">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <span className="sr-only">Previous</span>
                      <ChevronDown className="h-4 w-4 rotate-90" />
                    </Button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      1 of {Math.ceil(resumes.length / 5)}
                    </span>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <span className="sr-only">Next</span>
                      <ChevronDown className="h-4 w-4 -rotate-90" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={closeNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </div>
  );
}
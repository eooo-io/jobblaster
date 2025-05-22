import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Calendar, Palette, Edit2, Save, X } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ResumeSelectorProps {
  selectedResume: any;
  onResumeSelect: (resume: any) => void;
}

export default function ResumeSelector({ selectedResume, onResumeSelect }: ResumeSelectorProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newName, setNewName] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: resumes, isLoading } = useQuery({
    queryKey: ['/api/resumes'],
  });

  // Rename resume mutation
  const renameMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      return apiRequest(`/api/resumes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/resumes'] });
      setEditingId(null);
      setNewName('');
      toast({
        title: "Resume Renamed",
        description: "Your resume name has been updated successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Rename Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStartEdit = (resume: any) => {
    setEditingId(resume.id);
    setNewName(resume.name || 'Untitled Resume');
  };

  const handleSaveEdit = () => {
    if (editingId && newName.trim()) {
      renameMutation.mutate({ id: editingId, name: newName.trim() });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewName('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-slate-500 dark:text-gray-400">Loading resumes...</div>
      </div>
    );
  }

  if (!resumes || resumes.length === 0) {
    return (
      <Card className="border-dashed border-2 border-slate-300 dark:border-gray-600">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <FileText className="w-12 h-12 text-slate-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Resumes Available</h3>
          <p className="text-slate-500 dark:text-gray-400 mb-4">
            Create a resume in the Resume Editor to see it here for preview.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {resumes.map((resume: any) => (
        <Card 
          key={resume.id}
          className={`group cursor-pointer transition-all hover:shadow-md ${
            selectedResume?.id === resume.id 
              ? 'ring-2 ring-blue-500 border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20' 
              : 'hover:border-slate-300 dark:hover:border-gray-500'
          }`}
          onClick={() => editingId !== resume.id && onResumeSelect(resume)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                {editingId === resume.id ? (
                  <div className="space-y-2">
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveEdit();
                        } else if (e.key === 'Escape') {
                          handleCancelEdit();
                        }
                      }}
                      autoFocus
                    />
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={handleSaveEdit}
                        disabled={renameMutation.isPending || !newName.trim()}
                        className="h-7 px-2 text-xs"
                      >
                        <Save className="w-3 h-3 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={renameMutation.isPending}
                        className="h-7 px-2 text-xs"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-slate-900 dark:text-white truncate">
                        {resume.name || 'Untitled Resume'}
                      </h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(resume);
                        }}
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center space-x-3 mt-2 text-xs text-slate-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Palette className="w-3 h-3" />
                        <span>{resume.theme || 'modern'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {resume.createdAt ? new Date(resume.createdAt).toLocaleDateString() : 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
              {editingId !== resume.id && (
                <FileText className={`w-5 h-5 flex-shrink-0 ml-2 ${
                  selectedResume?.id === resume.id 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-slate-400 dark:text-gray-500'
                }`} />
              )}
            </div>
            
            {selectedResume?.id === resume.id && (
              <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                <div className="flex items-center space-x-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Currently Selected</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
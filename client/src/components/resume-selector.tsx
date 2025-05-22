import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FileText, Calendar, Palette, Edit2, Save, X, Star, ChevronDown, FolderOpen } from 'lucide-react';
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
      return apiRequest(`/api/resumes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name }),
        headers: { 'Content-Type': 'application/json' },
      });
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

  // Set default resume mutation
  const setDefaultMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/resumes/${id}/default`, {
        method: 'PUT',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/resumes'] });
      toast({
        title: "Default resume updated!",
      });
    },
    onError: (error: Error) => {
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
      {/* JSON Resumes Accordion */}
      <Collapsible open={resumesOpen} onOpenChange={setResumesOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-4 h-auto">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              <span className="font-medium">JSON Resumes ({resumes?.length || 0})</span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${resumesOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3">
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

          {/* Resume Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {resumes?.map((resume: any) => (
              <Card 
                key={resume.id}
                className={`group cursor-pointer transition-all hover:shadow-md ${
                  selectedResume?.id === resume.id 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                    : 'hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => onResumeSelect(resume)}
              >
                <CardContent className="p-2 relative">
                  {/* Header with star and edit */}
                  <div className="flex items-start justify-between mb-1">
                    {editingId === resume.id ? (
                      <div className="flex gap-1 min-w-0 flex-1">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="h-5 text-xs"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSave(resume.id);
                            if (e.key === 'Escape') handleCancel();
                          }}
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-5 w-5 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSave(resume.id);
                          }}
                        >
                          <Save className="h-2 w-2" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-5 w-5 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancel();
                          }}
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        {/* Default star indicator */}
                        <div className="flex items-center gap-1">
                          {resume.isDefault && (
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          )}
                          <FileText className="h-3 w-3 text-gray-400" />
                        </div>
                        
                        {/* Hover controls */}
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-4 w-4 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDefaultMutation.mutate(resume.id);
                            }}
                            disabled={setDefaultMutation.isPending}
                          >
                            <Star className={`h-2 w-2 ${resume.isDefault ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-4 w-4 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(resume.id, resume.name);
                            }}
                          >
                            <Edit2 className="h-2 w-2" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Resume name */}
                  <div className="mb-1">
                    <span className="font-medium text-gray-900 dark:text-gray-100 text-xs block truncate">
                      {resume.name}
                    </span>
                    {selectedResume?.id === resume.id && (
                      <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1 py-0.5 rounded">
                        Selected
                      </span>
                    )}
                  </div>

                  {/* Meta info */}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                      <Calendar className="h-2 w-2" />
                      <span>{new Date(resume.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                      <Palette className="h-2 w-2" />
                      <span className="capitalize">{resume.theme}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
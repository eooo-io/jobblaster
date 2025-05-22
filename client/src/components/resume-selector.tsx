import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Calendar, Palette } from 'lucide-react';

interface ResumeSelectorProps {
  selectedResume: any;
  onResumeSelect: (resume: any) => void;
}

export default function ResumeSelector({ selectedResume, onResumeSelect }: ResumeSelectorProps) {
  const { data: resumes, isLoading } = useQuery({
    queryKey: ['/api/resumes'],
  });

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
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedResume?.id === resume.id 
              ? 'ring-2 ring-blue-500 border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20' 
              : 'hover:border-slate-300 dark:hover:border-gray-500'
          }`}
          onClick={() => onResumeSelect(resume)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-slate-900 dark:text-white truncate">
                  {resume.name || 'Untitled Resume'}
                </h4>
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
              </div>
              <FileText className={`w-5 h-5 flex-shrink-0 ml-2 ${
                selectedResume?.id === resume.id 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-slate-400 dark:text-gray-500'
              }`} />
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
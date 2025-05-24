import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, AlertCircle } from 'lucide-react';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  error: any;
}

export function ErrorModal({ isOpen, onClose, title, error }: ErrorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-jobblaster-error dark:text-jobblaster-error-light">
            <AlertCircle className="h-5 w-5" />
            {title}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-jobblaster-error/10 dark:bg-jobblaster-error/5 border border-jobblaster-error/30 dark:border-jobblaster-error/20 rounded-lg p-4">
            <h3 className="font-semibold text-jobblaster-error-dark dark:text-jobblaster-error-light mb-2">Error Details</h3>
            <pre className="bg-white dark:bg-gray-900 border rounded p-3 text-sm overflow-auto max-h-96 whitespace-pre-wrap">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
          
          <div className="bg-jobblaster-teal/10 dark:bg-jobblaster-teal/5 border border-jobblaster-teal/30 dark:border-jobblaster-teal/20 rounded-lg p-4">
            <h4 className="font-semibold text-jobblaster-teal-dark dark:text-jobblaster-teal-light mb-2">Troubleshooting Tips</h4>
            <ul className="text-sm text-jobblaster-teal-dark dark:text-jobblaster-teal-light space-y-1">
              <li>• Check that your API credentials are correct</li>
              <li>• Verify your account has active API access</li>
              <li>• Ensure you haven't exceeded rate limits</li>
              <li>• Try regenerating your API keys from the provider</li>
            </ul>
          </div>
        </div>
        
        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
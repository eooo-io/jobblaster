import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ErrorModalProps } from "@/components/ui/types";
import { AlertCircle } from "lucide-react";

export function ErrorModal({ isOpen, onClose, title, error }: ErrorModalProps) {
  // Helper function to format error message
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === "string") {
      return error;
    }
    if (typeof error === "object" && error !== null) {
      return JSON.stringify(error);
    }
    return "An unknown error occurred";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-2">
          <div className="rounded-lg bg-destructive/10 p-4">
            <pre className="whitespace-pre-wrap text-sm text-destructive">
              {getErrorMessage(error)}
            </pre>
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

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  autoClose?: boolean;
  duration?: number;
}

export function NotificationModal({
  isOpen,
  onClose,
  type,
  title,
  message,
  autoClose = true,
  duration = 3000
}: NotificationModalProps) {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-6 w-6 text-jobblaster-success" />;
      case "error":
        return <XCircle className="h-6 w-6 text-jobblaster-error" />;
      case "warning":
        return <AlertCircle className="h-6 w-6 text-jobblaster-warning" />;
      case "info":
        return <Info className="h-6 w-6 text-jobblaster-teal" />;
      default:
        return <Info className="h-6 w-6 text-jobblaster-teal" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "bg-jobblaster-success/10 dark:bg-jobblaster-success/5";
      case "error":
        return "bg-jobblaster-error/10 dark:bg-jobblaster-error/5";
      case "warning":
        return "bg-jobblaster-warning/10 dark:bg-jobblaster-warning/5";
      case "info":
        return "bg-jobblaster-teal/10 dark:bg-jobblaster-teal/5";
      default:
        return "bg-jobblaster-teal/10 dark:bg-jobblaster-teal/5";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-md ${getBackgroundColor()}`}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            {getIcon()}
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          </div>
          {message && (
            <DialogDescription className="text-sm text-muted-foreground mt-2">
              {message}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="flex justify-end mt-4">
          <Button onClick={onClose} variant="outline">
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook for managing notification state
export function useNotificationModal() {
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message?: string;
  }>({
    isOpen: false,
    type: "info",
    title: "",
    message: ""
  });

  const showNotification = (
    type: "success" | "error" | "warning" | "info",
    title: string,
    message?: string
  ) => {
    setNotification({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isOpen: false }));
  };

  return {
    notification,
    showNotification,
    closeNotification
  };
}
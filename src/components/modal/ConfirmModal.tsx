import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  content?: string;
  children?: React.ReactNode;
  confirmText?: string;
  onConfirm: () => void;
  loading?: boolean;
  isEdit?: boolean;

}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onClose,
  title,
  content,
  children,
  confirmText = "Confirm",
  onConfirm,
  loading = false,
  isEdit = false,

}) => {
  
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "sm:max-w-[425px] dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
          isEdit && "sm:max-w-[700px] h-[80vh] overflow-y-auto"
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          {content && (
            <DialogDescription className="text-gray-500 dark:text-gray-400">
              {content}
            </DialogDescription>
          )}
        </DialogHeader>

        {isEdit && (
          <div className={cn("space-y-6")}>{children}</div>
        )}

        <DialogFooter className="sm:justify-end gap-2 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={isEdit ? "default" : "destructive"}
            onClick={onConfirm}
            disabled={loading}
            className="min-w-[100px] dark:bg-gray-700 dark:text-gray-300 dark:border-gray-800 dark:hover:bg-gray-900 dark:hover:text-gray-200"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader className="h-4 w-4 animate-spin" />
                {isEdit ? "Saving..." : "Deleting..."}
              </span>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmModal;

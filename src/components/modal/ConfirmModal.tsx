import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const ConfirmModal = ({
  open,
  onClose,
  title,
  content,
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  loading
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {content && <DialogDescription>{content}</DialogDescription>}
        </DialogHeader>

        {children}

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            {cancelText}
          </Button>
          <Button onClick={onConfirm}>
            {loading ? <Loader2 /> : confirmText}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmModal;

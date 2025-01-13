import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface EducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: {
    title: string;
    modalContent: string;
    icon: React.ReactNode;
  } | null;
}

export default function EducationModal({ isOpen, onClose, content }: EducationModalProps) {
  if (!content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="text-primary">{content.icon}</span>
            <DialogTitle>{content.title}</DialogTitle>
          </div>
        </DialogHeader>
        <div className="py-4">
          <p className="text-gray-700 leading-relaxed">
            {content.modalContent}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

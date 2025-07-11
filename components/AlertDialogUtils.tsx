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
} from "@/components/ui/alert-dialog"
import { BadgeInfo, OctagonX, Star, TriangleAlert } from "lucide-react"
import { ReactNode, useEffect } from "react"

export type DialogType = "success" | "error" | "warning" | "info"

interface AlertDialogUtilsProps {
  type?: DialogType
  title?: string
  content?: string
  trigger?: ReactNode
  cancelText?: string
  confirmText?: string
  onConfirm?: () => void
  onCancel?: () => void
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

const getDialogStyles = (type: DialogType) => {
  switch (type) {
    case "success":
      return "bg-white border-b-4 border-green-500"
    case "error":
      return "bg-white border-b-4 border-red-500"
    case "warning":
      return "bg-white border-b-4 border-amber-500"
    default:
      return "bg-white border-b-4 border-gray-500"
  }
}

const getTitleDiaglog = (type: DialogType, title?: string) => {
  if (title) {
    return title;
  }
  switch (type) {
    case "success":
      return "Thành công"
    case "error":
      return "Lỗi"
    case "warning":
      return "Cảnh báo!"
    default:
      return "Thông báo"
  }
}
const iconHeader = (type: DialogType) => {
  switch (type) {
    case "warning":
      return <TriangleAlert className="w-14 h-14 text-yellow-500" strokeWidth={1.5} />
    case "error":
      return <OctagonX className="w-14 h-14 text-red-500" strokeWidth={1.5} />
    case "success":
      return <Star className="w-14 h-14 text-green-500" strokeWidth={1.5} />
    default:
      return <BadgeInfo className="w-14 h-14 text-gray-500" strokeWidth={1.5} />
  }
}

export function AlertDialogUtils({
  type = "info",
  title,
  content,
  trigger,
  cancelText = "Hủy",
  confirmText = "Đồng ý",
  onConfirm,
  onCancel,
  isOpen,
  onOpenChange
}: AlertDialogUtilsProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (onCancel) onCancel();
        if (onOpenChange) onOpenChange(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onCancel, onOpenChange]);
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange} >
      {trigger && (
        <AlertDialogTrigger asChild>
          {trigger}
        </AlertDialogTrigger>
      )}
      <AlertDialogContent className={getDialogStyles(type)}>
        <AlertDialogHeader>
          <div className="flex flex-col items-center gap-2 mb-2 justify-center align-middle">
            <div className="w-14 h-14 flex items-center justify-center ">
              {iconHeader(type)}
            </div>
            <AlertDialogTitle>{getTitleDiaglog(type, title)}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {content}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {onCancel && <AlertDialogCancel onClick={onCancel} className="mr-2">{cancelText}</AlertDialogCancel>}
          {onConfirm && <AlertDialogAction onClick={onConfirm}>{confirmText}</AlertDialogAction>}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

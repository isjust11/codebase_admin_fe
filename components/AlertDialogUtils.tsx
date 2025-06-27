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
  import { ReactNode } from "react"
  
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
        return "bg-green-50 border-green-200"
      case "error":
        return "bg-red-50 border-red-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      default:
        return "bg-white"
    }
  }

  const getTitleDiaglog = (type: DialogType, title?:string) =>{
    if(title){
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
    return (
      <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
        {trigger && (
          <AlertDialogTrigger asChild>
            {trigger}
          </AlertDialogTrigger>
        )}
        <AlertDialogContent className={getDialogStyles(type)}>
          <AlertDialogHeader>
            <AlertDialogTitle>{getTitleDiaglog(type,title)}</AlertDialogTitle>
            <AlertDialogDescription>
              {content}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onCancel}>{cancelText}</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm}>{confirmText}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }
  
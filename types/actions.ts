export interface Action {
    icon: React.ReactNode;
    onClick: () => void;
    title?: string;
    className?: string;
    variant?:"primary" | "outline" | undefined;
    size?:"xs"|"sm"| "md"| undefined;
    isLoading?: boolean;
    disabled?:boolean;
}
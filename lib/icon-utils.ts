import * as LucideIcons from "lucide-react";
import { LucideIcon } from "lucide-react";
import React from "react";
import { JSX } from "react";

// Danh sách các tên không phải icon
const EXCLUDED_NAMES = [
    "createLucideIcon",
    "LucideIcon",
    "LucideProps",
    "LucideIconProps",
    "LucideIconNode"
];

// Lấy tất cả các icon có sẵn
export const availableIcons = Object.entries(LucideIcons)
    .filter(([name]) => !EXCLUDED_NAMES.includes(name))
    .map(([name]) => name);

// Kiểm tra xem một tên có phải là icon hợp lệ không
export const isValidIconName = (name: string): boolean => {
    return availableIcons.includes(name);
};

// Lấy component icon từ tên
export const getIconComponent = (name: string): LucideIcon | null => {
    if (!isValidIconName(name)) {
        return null;
    }
    return (LucideIcons as any)[name] as LucideIcon;
};

// Render icon từ tên
export const renderIcon = (name: string, size: number = 20): JSX.Element | null => {
    const IconComponent = getIconComponent(name);
    if (!IconComponent) {
        return null;
    }
    return React.createElement(IconComponent, { size });
}; 
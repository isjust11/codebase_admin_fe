import React from "react";
import { renderIcon } from "@/lib/icon-utils";

interface IconProps {
    name: string;
    size?: number;
    className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 20, className }) => {
    const iconElement = renderIcon(name, size);
    if (!iconElement) {
        return null;
    }
    return React.cloneElement(iconElement, { className });
};
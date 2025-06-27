import { IconType } from "@/enums/icon-type.enum";
import { Role } from "./role";
import { Category } from "./category";

export interface Feature {
    id: string;
    icon: string;
    label: string;
    link?: string;
    iconSize: number;
    iconType: IconType;
    className?: string;
    parentId?: number;
    children?: Feature[];
    roles?: Role[];
    isActive: boolean;
    sortOrder?: number;
    featureTypeId?: string;
    featureType: Category;
    isDefault:boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

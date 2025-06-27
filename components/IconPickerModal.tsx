import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import * as LucideIcons from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import emojiData from "emoji-datasource";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import { IconType } from "@/enums/icon-type.enum";
import { emojiToUnicode } from "@/lib/utils";

interface IconPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (icon: string, iconType: IconType) => void;
}

// Phân loại icons
const iconCategories = {
    "Giao diện": ["Menu", "Layout", "Grid", "List", "Table", "Columns", "Rows", "Panel", "Window", "Screen", "Display"],
    "Điều hướng": ["Arrow", "Chevron", "Move", "Navigation", "Scroll", "Direction", "Route", "Path"],
    "Tương tác": ["Click", "Pointer", "Cursor", "Hand", "Touch", "Mouse", "Keyboard", "Input"],
    "Phương tiện": ["Image", "Video", "Music", "Play", "Pause", "Volume", "Camera", "Microphone", "Speaker"],
    "Thông báo": ["Bell", "Alert", "Warning", "Info", "Message", "Mail", "Notification", "Badge"],
    "Công cụ": ["Settings", "Tool", "Wrench", "Screwdriver", "Hammer", "Gear", "Config", "Setup"],
    "Tài liệu": ["File", "Document", "Folder", "Archive", "Book", "Note", "Text", "Write"],
    "Người dùng": ["User", "Profile", "Account", "Avatar", "Person", "Group", "Team"],
    "Thời gian": ["Clock", "Calendar", "Date", "Time", "Schedule", "Timer", "Stopwatch"],
    "Hành động": ["Add", "Remove", "Delete", "Edit", "Save", "Share", "Download", "Upload"],
    "Xã hội": ["Social", "Share", "Like", "Comment", "Follow", "Friend", "Group", "Chat"],
    "Địa lý": ["Location", "Map", "Pin", "Place", "Marker", "Direction", "Compass", "Globe"],
    "Kinh doanh": ["Business", "Shop", "Store", "Cart", "Money", "Wallet", "Payment", "Invoice"],
    "Hệ thống": ["System", "Settings", "Configuration", "Admin", "Control", "Dashboard", "Console"],
    "An ninh": ["Lock", "Security", "Shield", "Key", "Password", "Privacy", "Protection", "Firewall"],
    "Thể thao": ["Sport", "Game", "Ball", "Team", "Player", "Score", "Trophy", "Medal"],
    "Khác": [] // Icons không thuộc các nhóm trên
};

const icons = emojiData
    .filter(emoji => emoji.has_img_apple)
    .map(emoji => ({
        shortName: emoji.short_name,
        unified: emoji.unified,
        char: String.fromCodePoint(...emoji.unified.split('-').map(u => parseInt(u, 16)))
    }));

// Convert all Lucide icons to array and categorize them
const lucideIcons = Object.entries(LucideIcons)
     .filter(([name]) => name !== "createLucideIcon" && 
                        name !== "LucideIcon")
    .map(([name, icon]) => {
        // Tìm category phù hợp cho icon
        let category = "Khác";
        for (const [cat, keywords] of Object.entries(iconCategories)) {
            if (keywords.some(keyword => name.toLowerCase().includes(keyword.toLowerCase()))) {
                category = cat;
                break;
            }
        }
        return {
            name,
            icon: icon as LucideIcons.LucideIcon,
            category
        };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

export function IconPickerModal({ isOpen, onClose, onSelect }: IconPickerModalProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("lucide");
    const [selectedCategory, setSelectedCategory] = useState("Giao diện");

    const filteredEmojis = icons.filter(icon =>
        icon.shortName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredLucideIcons = lucideIcons
        .filter(icon => icon.category === selectedCategory)
        .filter(icon => icon.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-[600px] p-5"
        >
            <div className="space-y-4 mt-8">
                <h3 className="text-lg font-medium">Chọn icon</h3>
                <div className="relative">
                    <LucideIcons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                        placeholder="Tìm kiếm icon..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Tabs defaultValue="emoji" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="lucide">Lucide Icons</TabsTrigger>
                        <TabsTrigger value="emoji">Emoji</TabsTrigger>
                    </TabsList>
                    <TabsContent value="lucide">
                        <div className="overflow-x-auto mb-4">
                            <div className="flex space-x-2 pb-2">
                                {Object.keys(iconCategories).map((category) => (
                                    <Button
                                        key={category}
                                        variant={selectedCategory === category ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedCategory(category)}
                                        className="whitespace-nowrap"
                                    >
                                        {category}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        {filteredLucideIcons.length > 0 ? (
                            <div className="grid grid-cols-8 gap-2 max-h-[400px] overflow-y-auto">
                                {filteredLucideIcons.slice(0, 1000).map((icon, index) => {
                                    const IconComponent = icon.icon;
                                     // Kiểm tra xem IconComponent có phải là một React component hợp lệ không
                                    if ( !React.isValidElement(<IconComponent />)) {
                                        return null;
                                    }
                                    try {
                                        return (
                                            <Button
                                                key={index}
                                                variant="outline"
                                                className="h-12 w-12 flex items-center justify-center hover:bg-gray-100"
                                                onClick={() => {

                                                    onSelect(icon.name, IconType.lucide);
                                                    onClose();
                                                }}
                                                title={icon.name}
                                            >
                                                <IconComponent size={20} />
                                            </Button>
                                        );
                                    } catch (error) {
                                        console.error(`Error rendering icon ${icon.name}:`, error);
                                        return null;
                                    }
                                })}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-32 text-gray-500">
                                Không tìm thấy icon nào phù hợp với từ khóa &quot;{searchTerm}&quot;
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="emoji">
                        {filteredEmojis.length > 0 ? (
                            <div className="grid grid-cols-8 gap-2 max-h-[400px] overflow-y-auto">
                                {filteredEmojis.map((icon, index) => (
                                    <Button
                                        key={index}
                                        variant="outline"
                                        className="h-12 w-12 text-2xl flex items-center justify-center hover:bg-gray-100"
                                        onClick={() => {
                                            const encodeEmoji = emojiToUnicode(icon.char);
                                            onSelect(encodeEmoji, IconType.emoji);
                                            onClose();
                                        }}
                                    >
                                        {icon.char}
                                    </Button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-32 text-gray-500">
                                Không tìm thấy icon nào phù hợp với từ khóa &quot;{searchTerm}&quot;
                            </div>
                        )}
                    </TabsContent>

                </Tabs>
            </div>
        </Modal>
    );
} 
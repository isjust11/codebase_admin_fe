// components/EnhancedAssignList.jsx
import { Icon } from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { featureService } from '@/services/feature-api';
import { getAllFeatures } from '@/services/manager-api';
import { Feature } from '@/types/feature';
import { ArrowRight, ChevronRight, X, ChevronDown, ChevronRight as ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface EnhancedAssignListProps {
    assignedItems?: string[];
    onChange?: (assignedIds: string[]) => void;
    isView?: boolean;
}

export default function AssignHandleForm({
    assignedItems = [],
    onChange,
    isView = false
}: EnhancedAssignListProps) {
    const [features, setFeatures] = useState<Feature[]>([]);
    const [unassigned, setUnassigned] = useState<Feature[]>([]);
    const [assigned, setAssigned] = useState<Feature[]>([]);
    const [searchUnassigned, setSearchUnassigned] = useState('');
    const [searchAssigned, setSearchAssigned] = useState('');
    const [selectedUnassigned, setSelectedUnassigned] = useState<string[]>([]);
    const [selectedAssigned, setSelectedAssigned] = useState<string[]>([]);
    const [filteredUnassigned, setFilteredUnassigned] = useState<Feature[]>([]);
    const [filteredAssigned, setFilteredAssigned] = useState<Feature[]>([]);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchFeatures();
    }, []);

    useEffect(() => {
        if (features.length > 0) {
            // Lọc ra các feature gốc (không có parent)
            const rootFeatures = features.filter(feature => !feature.parentId);

            // Phân loại feature gốc thành assigned và unassigned
            const initialUnassigned = rootFeatures.filter((item: Feature) => !assignedItems?.includes(item.id));
            const initialAssigned = rootFeatures.filter((item: Feature) => assignedItems?.includes(item.id));

            setUnassigned(initialUnassigned);
            setAssigned(initialAssigned);
            setFilteredUnassigned(initialUnassigned);
            setFilteredAssigned(initialAssigned);
        }
    }, [assignedItems, features]);

    const fetchFeatures = async () => {
        try {
            const data = await getAllFeatures();
            const newFeatures = data;
            setFeatures(newFeatures);

            // Lọc ra các feature gốc (không có parent)
            const rootFeatures = newFeatures.filter((feature: Feature) => !feature.parentId);

            // Phân loại feature gốc thành assigned và unassigned
            const initialUnassigned = rootFeatures.filter((item: Feature) => !assignedItems?.includes(item.id));
            const initialAssigned = rootFeatures.filter((item: Feature) => assignedItems?.includes(item.id));

            setUnassigned(initialUnassigned);
            setAssigned(initialAssigned);
            setFilteredUnassigned(initialUnassigned);
            setFilteredAssigned(initialAssigned);
        } catch (error: any) {
            toast.error('Lỗi khi tải danh sách chức năng: ' + error.message);
        }
    };

    // Hàm xử lý cấu trúc cây
    const getChildFeatures = (parentId: string | undefined, featureList: Feature[]): Feature[] => {
        return featureList.filter(feature => feature.parentId === parentId);
    };

    const toggleExpand = (itemId: string) => {
        setExpandedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    // Hàm kiểm tra xem một feature có được chọn không (bao gồm cả children)
    const isFeatureSelected = (feature: Feature, selectedList: string[]): boolean => {
        if (selectedList.includes(feature.id)) return true;
        if (feature.children) {
            return feature.children.some(child => isFeatureSelected(child, selectedList));
        }
        return false;
    };

    // Hàm lấy tất cả ID của feature và children
    const getAllFeatureIds = (feature: Feature): string[] => {
        let ids = [feature.id];
        if (feature.children) {
            feature.children.forEach(child => {
                ids = [...ids, ...getAllFeatureIds(child)];
            });
        }
        return ids;
    };

    // Hàm tìm kiếm feature theo label (bao gồm cả children)
    const searchFeatures = (features: Feature[], searchValue: string): Feature[] => {
        return features.filter((feature: Feature) => {
            const matchesLabel = feature.label.toLowerCase().includes(searchValue.toLowerCase());
            const children = feature.children ? searchFeatures(feature.children, searchValue) : [];
            return matchesLabel || children.length > 0;
        });
    };

    // Assignment functions
    const assignItem = (item: Feature) => {
        const allIds = getAllFeatureIds(item);
        const newUnassigned = unassigned.filter(i => !allIds.includes(i.id));
        const newAssigned = [...assigned, item];

        setUnassigned(newUnassigned);
        setAssigned(newAssigned);
        setFilteredAssigned(newAssigned);
        setFilteredUnassigned(newUnassigned);
        setSelectedUnassigned(selectedUnassigned.filter(id => !allIds.includes(id)));

        onChange?.(newAssigned.map(item => item.id));
    };

    const unassignItem = (item: Feature) => {
        const allIds = getAllFeatureIds(item);
        const newAssigned = assigned.filter(i => !allIds.includes(i.id));
        const newUnassigned = [...unassigned, item];

        setAssigned(newAssigned);
        setUnassigned(newUnassigned);
        setFilteredAssigned(newAssigned);
        setFilteredUnassigned(newUnassigned);
        setSelectedAssigned(selectedAssigned.filter(id => !allIds.includes(id)));

        onChange?.(newAssigned.map(item => item.id));
    };

    // Bulk actions
    const assignSelected = () => {
        const itemsToAssign = unassigned.filter(item =>
            selectedUnassigned.includes(item.id)
        );

        const allIds = itemsToAssign.flatMap(item => getAllFeatureIds(item));
        const newUnassigned = unassigned.filter(item =>
            !allIds.includes(item.id)
        );
        const newAssigned = [...assigned, ...itemsToAssign];

        setUnassigned(newUnassigned);
        setAssigned(newAssigned);
        setSelectedUnassigned([]);
        setFilteredAssigned(newAssigned);
        setFilteredUnassigned(newUnassigned);
        onChange?.(newAssigned.map(item => item.id));
    };

    const unassignSelected = () => {
        const itemsToUnassign = assigned.filter(item =>
            selectedAssigned.includes(item.id)
        );

        const allIds = itemsToUnassign.flatMap(item => getAllFeatureIds(item));
        const newAssigned = assigned.filter(item =>
            !allIds.includes(item.id)
        );
        const newUnassigned = [...unassigned, ...itemsToUnassign];

        setAssigned(newAssigned);
        setUnassigned(newUnassigned);
        setSelectedAssigned([]);
        setFilteredAssigned(newAssigned);
        setFilteredUnassigned(newUnassigned);
        onChange?.(newAssigned.map(item => item.id));
    };

    // Toggle selection
    const toggleUnassignedSelection = (id: string) => {
        setSelectedUnassigned(prev =>
            prev.includes(id)
                ? prev.filter(itemId => itemId !== id)
                : [...prev, id]
        );
    };

    const toggleAssignedSelection = (id: string) => {
        setSelectedAssigned(prev =>
            prev.includes(id)
                ? prev.filter(itemId => itemId !== id)
                : [...prev, id]
        );
    };

    const handleSearchUnassigned = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = e.target.value.toLowerCase();
        setSearchUnassigned(searchValue);
        const filtered = searchFeatures(unassigned, searchValue);
        setFilteredUnassigned(filtered);
    };

    const handleSearchAssigned = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = e.target.value.toLowerCase();
        setSearchAssigned(searchValue);
        const filtered = searchFeatures(assigned, searchValue);
        setFilteredAssigned(filtered);
    };

    // Component hiển thị feature và children
    const FeatureItem = ({ feature, isAssigned, level = 0 }: { feature: Feature, isAssigned: boolean, level?: number }) => {
        const hasChildren = feature.children && feature.children.length > 0;
        const isExpanded = expandedItems.has(feature.id);
        const isSelected = isAssigned ? selectedAssigned.includes(feature.id) : selectedUnassigned.includes(feature.id);

        return (
            <div>
                <li
                    className={`p-3 border rounded flex justify-between items-center ${isSelected ? (isAssigned ? 'bg-red-100' : 'bg-blue-100') : ''}`}
                    style={{ marginLeft: `${level * 20}px` }}
                >
                    <div className="flex items-center gap-3">
                        {hasChildren && (
                            <button
                                onClick={() => toggleExpand(feature.id)}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                            </button>
                        )}
                        {level <= 0 && (<input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => isAssigned ? toggleAssignedSelection(feature.id) : toggleUnassignedSelection(feature.id)}
                            className="h-4 w-4"
                            aria-label={`Chọn ${feature.label}`}
                            disabled={isView}
                        />)}

                        <Link href={feature.link ?? '#'} className="flex flex-row items-center gap-2 hover:underline">
                            <div>
                                {feature.icon && <Icon name={feature.icon} className="h-4 w-4 text-gray-400" ></Icon>}
                            </div>
                            {feature.label}
                        </Link>

                    </div>
                    {level <= 0 && (<button
                        onClick={() => isAssigned ? unassignItem(feature) : assignItem(feature)}
                        className={`px-3 py-1 ${isAssigned ? 'bg-red-500' : 'bg-blue-500'} text-white rounded hover:${isAssigned ? 'bg-red-600' : 'bg-blue-600'}`}
                        title={isAssigned ? "Bỏ gán chức năng" : "Gán chức năng"}
                        disabled={isView}
                    >
                        {isAssigned ? <X className="h-4 w-4 inline-block" /> : <ChevronRight className="h-4 w-4 inline-block" />}
                    </button>)}
                </li>
                {hasChildren && isExpanded && (
                    <ul className="space-y-2 mt-2">
                        {feature.children?.map(child => (
                            <FeatureItem
                                key={child.id}
                                feature={child}
                                isAssigned={isAssigned}
                                level={level + 1}
                            />
                        ))}
                    </ul>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex gap-8">
                {/* Unassigned List */}
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Danh sách chức năng ({unassigned.length})</h2>
                        {selectedUnassigned.length > 0 && (
                            <button
                                onClick={assignSelected}
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Gán đã chọn ({selectedUnassigned.length})
                            </button>
                        )}
                    </div>
                    <input
                        type="text"
                        placeholder="Tìm kiếm chức năng..."
                        className="w-full p-2 border rounded mb-4"
                        value={searchUnassigned}
                        onChange={handleSearchUnassigned}
                    />
                    <ScrollArea className="h-[400px] border rounded-md p-4">
                        {
                            filteredUnassigned.length > 0 ? (
                                <ul className="space-y-2">
                                    {filteredUnassigned.length > 0 ? filteredUnassigned.map((item: Feature) => (
                                        <FeatureItem
                                            key={item.id}
                                            feature={item}
                                            isAssigned={false}
                                        />
                                    )) : <div className="text-center text-gray-500">Không có chức năng nào</div>}
                                </ul>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center text-center text-gray-500">Không có chức năng nào</div>
                            )
                        }

                    </ScrollArea>
                </div>

                {/* Assigned List */}
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Chức năng đã gán ({assigned.length})</h2>
                        {selectedAssigned.length > 0 && (
                            <button
                                onClick={unassignSelected}
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Bỏ chọn ({selectedAssigned.length})
                            </button>
                        )}
                    </div>
                    <input
                        type="text"
                        placeholder="Tìm kiếm chức năng đã gán..."
                        className="w-full p-2 border rounded mb-4"
                        value={searchAssigned}
                        onChange={handleSearchAssigned}
                    />
                    <ScrollArea className="h-[400px] border rounded-md p-4">
                        <ul className="space-y-2 mt-2">
                            {filteredAssigned.map((item: Feature) => (
                                <FeatureItem
                                    key={item.id}
                                    feature={item}
                                    isAssigned={true}
                                />
                            ))}
                        </ul>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}
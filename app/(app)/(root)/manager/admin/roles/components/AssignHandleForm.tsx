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

// Thêm hàm buildTree để chuyển danh sách phẳng thành cây
function buildTree(features: Feature[]): Feature[] {
    const map = new Map<string, Feature & { children?: Feature[] }>();
    features.forEach(f => map.set(String(f.id), { ...f, children: [] }));

    const roots: Feature[] = [];
    map.forEach(feature => {
        if (feature.parentId !== undefined && feature.parentId !== null) {
            const parent = map.get(String(feature.parentId));
            if (parent) {
                parent.children = parent.children || [];
                parent.children.push(feature);
            }
        } else {
            roots.push(feature);
        }
    });
    return roots;
}

// Lọc cây theo trạng thái assigned/unassigned
function filterTreeByAssigned(tree: Feature[], assignedIds: string[], isAssigned: boolean): Feature[] {
    return tree
        .map(node => {
            const children = node.children ? filterTreeByAssigned(node.children, assignedIds, isAssigned) : [];
            const match = isAssigned ? assignedIds.includes(node.id) : !assignedIds.includes(node.id);
            if (children.length > 0 || match) {
                return { ...node, children };
            }
            return null;
        })
        .filter(Boolean) as Feature[];
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
            // Xây dựng cây từ danh sách phẳng
            const tree = buildTree(features);
            // Phân loại cây assigned/unassigned
            const assignedTree = filterTreeByAssigned(tree, assignedItems, true);
            const unassignedTree = filterTreeByAssigned(tree, assignedItems, false);
            setUnassigned(unassignedTree);
            setAssigned(assignedTree);
            setFilteredUnassigned(unassignedTree);
            setFilteredAssigned(assignedTree);
        }
    }, [assignedItems, features]);

    const fetchFeatures = async () => {
        try {
            const data = await getAllFeatures();
            setFeatures(data);
            // Xây dựng cây từ danh sách phẳng
            const tree = buildTree(data);
            // Phân loại cây assigned/unassigned
            const assignedTree = filterTreeByAssigned(tree, assignedItems, true);
            const unassignedTree = filterTreeByAssigned(tree, assignedItems, false);
            setUnassigned(unassignedTree);
            setAssigned(assignedTree);
            setFilteredUnassigned(unassignedTree);
            setFilteredAssigned(assignedTree);
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
        const newAssignedIds = Array.from(new Set([...assigned.map(i => i.id), ...allIds, ...assignedItems]));
        onChange?.(newAssignedIds);
    };

    const unassignItem = (item: Feature) => {
        const allIds = getAllFeatureIds(item);
        const newAssignedIds = assignedItems.filter(id => !allIds.includes(id));
        onChange?.(newAssignedIds);
    };

    // Bulk actions
    const assignSelected = () => {
        const itemsToAssign = selectedUnassigned
            .map(id => findFeatureById(unassigned, id))
            .filter(Boolean) as Feature[];
        const allIds = itemsToAssign.flatMap(item => getAllFeatureIds(item));
        const newAssignedIds = Array.from(new Set([...assigned.map(i => i.id), ...allIds, ...assignedItems]));
        setSelectedUnassigned([]);
        onChange?.(newAssignedIds);
    };

    const unassignSelected = () => {
        const itemsToUnassign = selectedAssigned
            .map(id => findFeatureById(assigned, id))
            .filter(Boolean) as Feature[];
        const allIds = itemsToUnassign.flatMap(item => getAllFeatureIds(item));
        const newAssignedIds = assignedItems.filter(id => !allIds.includes(id));
        setSelectedAssigned([]);
        onChange?.(newAssignedIds);
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
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => isAssigned ? toggleAssignedSelection(feature.id) : toggleUnassignedSelection(feature.id)}
                            className="h-4 w-4"
                            aria-label={`Chọn ${feature.label}`}
                            disabled={isView}
                        />

                        <Link href={feature.link ?? '#'} className="flex flex-row items-center gap-2 hover:underline">
                            <div>
                                {feature.icon && <Icon name={feature.icon} className="h-4 w-4 text-gray-400" ></Icon>}
                            </div>
                            {feature.label}
                        </Link>

                    </div>
                    <button
                        onClick={() => isAssigned ? unassignItem(feature) : assignItem(feature)}
                        className={`px-2 py-1 ${
                            level === 0 
                                ? (isAssigned ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600')
                                : (isAssigned ? 'bg-red-300 hover:bg-red-400' : 'bg-blue-300 hover:bg-blue-400')
                        } text-white rounded`}
                        title={isAssigned ? "Bỏ gán chức năng" : "Gán chức năng"}
                        disabled={isView}
                    >
                        {isAssigned ? <X className="h-4 w-4 inline-block" /> : <ChevronRight className="h-4 w-4 inline-block" />}
                    </button>
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
                        {
                            filteredAssigned.length > 0 ? (
                                <ul className="space-y-2 mt-2">
                                    {filteredAssigned.map((item: Feature) => (
                                <FeatureItem
                                    key={item.id}
                                    feature={item}
                                    isAssigned={true}
                                />
                                    ))}
                                </ul>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center text-center text-gray-500">Không có chức năng nào</div>
                            )
                        }
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}

// Hàm tìm feature theo id trong cây
function findFeatureById(tree: Feature[], id: string): Feature | undefined {
    for (const node of tree) {
        if (node.id === id) return node;
        if (node.children) {
            const found = findFeatureById(node.children, id);
            if (found) return found;
        }
    }
    return undefined;
}
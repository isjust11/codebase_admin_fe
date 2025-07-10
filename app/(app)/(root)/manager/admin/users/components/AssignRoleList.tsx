import React, { useState, useEffect } from 'react';
import { Role } from '@/types/role';

interface AssignRoleListProps {
  roles: Role[];
  assignedRoleIds: number[];
  onChange?: (assignedIds: number[]) => void;
  isView?: boolean;
}

export default function AssignRoleList({
  roles = [],
  assignedRoleIds = [],
  onChange,
  isView = false,
}: AssignRoleListProps) {
  const [selectedUnassigned, setSelectedUnassigned] = useState<number[]>([]);
  const [selectedAssigned, setSelectedAssigned] = useState<number[]>([]);

  const assigned = roles.filter((role) => assignedRoleIds.includes(Number(role.id)));
  const unassigned = roles.filter((role) => !assignedRoleIds.includes(Number(role.id)));

  useEffect(() => {
    setSelectedUnassigned([]);
    setSelectedAssigned([]);
  }, [assignedRoleIds, roles]);

  const handleAssignSelected = () => {
    const newAssigned = Array.from(new Set([...assignedRoleIds, ...selectedUnassigned]));
    setSelectedUnassigned([]);
    onChange?.(newAssigned);
  };

  const handleUnassignSelected = () => {
    const newAssigned = assignedRoleIds.filter((id) => !selectedAssigned.includes(id));
    setSelectedAssigned([]);
    onChange?.(newAssigned);
  };

  const toggleUnassigned = (id: number) => {
    setSelectedUnassigned((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAssigned = (id: number) => {
    setSelectedAssigned((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex gap-8">
      {/* Unassigned List */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Roles chưa gán ({unassigned.length})</h2>
          {selectedUnassigned.length > 0 && (
            <button
              onClick={handleAssignSelected}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={isView}
            >
              Gán đã chọn ({selectedUnassigned.length})
            </button>
          )}
        </div>
        <ul className="space-y-2">
          {unassigned.length > 0 ? (
            unassigned.map((role) => (
              <li key={role.id} className="p-3 border rounded flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedUnassigned.includes(Number(role.id))}
                  onChange={() => toggleUnassigned(Number(role.id))}
                  className="h-4 w-4"
                  disabled={isView}
                  title={`Chọn role ${role.name}`}
                  aria-label={`Chọn role ${role.name}`}
                />
                <span>{role.name}</span>
              </li>
            ))
          ) : (
            <div className="text-gray-500">Không có role nào</div>
          )}
        </ul>
      </div>
      {/* Assigned List */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Roles đã gán ({assigned.length})</h2>
          {selectedAssigned.length > 0 && (
            <button
              onClick={handleUnassignSelected}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              disabled={isView}
            >
              Bỏ gán đã chọn ({selectedAssigned.length})
            </button>
          )}
        </div>
        <ul className="space-y-2">
          {assigned.length > 0 ? (
            assigned.map((role) => (
              <li key={role.id} className="p-3 border rounded flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedAssigned.includes(Number(role.id))}
                  onChange={() => toggleAssigned(Number(role.id))}
                  className="h-4 w-4"
                  disabled={isView}
                  title={`Bỏ chọn role ${role.name}`}
                  aria-label={`Bỏ chọn role ${role.name}`}
                />
                <span>{role.name}</span>
              </li>
            ))
          ) : (
            <div className="text-gray-500">Không có role nào</div>
          )}
        </ul>
      </div>
    </div>
  );
} 
import React, { useState, useEffect } from 'react';
import { Role } from '@/types/role';
import { ArrowLeftToLine, ArrowRightToLine, CircleSlash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface AssignRoleListProps {
  roles: Role[];
  assignedRoleIds: string[];
  onChange?: (assignedIds: string[]) => void;
  isView?: boolean;
}

export default function AssignRoleList({
  roles = [],
  assignedRoleIds = [],
  onChange,
  isView = false,
}: AssignRoleListProps) {
  const t = useTranslations('UsersPage');
  const [selectedUnassigned, setSelectedUnassigned] = useState<string[]>([]);
  const [selectedAssigned, setSelectedAssigned] = useState<string[]>([]);

  const assigned = roles.filter((role) => assignedRoleIds.includes(role.id));
  const unassigned = roles.filter((role) => !assignedRoleIds.includes(role.id));

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

  const toggleUnassigned = (id: string) => {
    setSelectedUnassigned((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAssigned = (id: string) => {
    setSelectedAssigned((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex gap-8">
      {/* Unassigned List */}
      <div className="flex-12 ring-1 ring-gray-300 rounded-md p-2">
        <div className="flex justify-between items-center mb-4 border-b border-gray-300 pb-2 p-2">
          <h2 className="text-lg font-semibold">{t('unassignedRoles')} <span className="text-red-500">({unassigned.length})</span></h2>
        </div>
        <ul className="space-y-2">
          {unassigned.length > 0 ? (
            unassigned.map((role) => (
              <li key={role.id} className="p-3 border rounded flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedUnassigned.includes(role.id)}
                  onChange={() => toggleUnassigned(role.id)}
                  className="h-4 w-4"
                  disabled={isView}
                  key={role.id}
                  title={`${t('selectRole')} ${role.name}`}
                  aria-label={`${t('selectRole')} ${role.name}`}
                />
                <span>{role.name}</span>
              </li>
            ))
          ) : (
            <div className="text-gray-500 text-center py-8">{t('noRoles')}</div>
          )}
        </ul>
      </div>
      <div className="flex-1">
        <div className="flex justify-center items-center h-full">
          <button className={`px-3 py-1 rounded-sm w-full text-white ${selectedUnassigned.length > 0 ? 'bg-blue-500 hover:bg-blue-600' :
            selectedAssigned.length + selectedUnassigned.length == 0 ? 'bg-gray-500 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'}`}
            onClick={selectedUnassigned.length > 0 ? handleAssignSelected : selectedAssigned.length > 0 ? handleUnassignSelected : undefined}
            disabled={isView || selectedUnassigned.length + selectedAssigned.length == 0}
            title={selectedUnassigned.length > 0 ? `${t('assignRoles')} ${selectedUnassigned.length}` : selectedAssigned.length > 0 ? `${t('unassignRoles')} ${selectedAssigned.length}` : ''}
            aria-label={selectedUnassigned.length > 0 ? `${t('assignRoles')} ${selectedUnassigned.length}` : selectedAssigned.length > 0 ? `${t('unassignRoles')} ${selectedAssigned.length}` : ''}
          >
            {selectedUnassigned.length > 0 ? (
              <>
                <ArrowRightToLine className="h-6 w-6 " />
              </>
            ) : selectedAssigned.length + selectedUnassigned.length == 0 ? (
              <>
                <CircleSlash2 className="h-6 w-6 " />
              </>
            ) : (
              <>
                <ArrowLeftToLine className="h-6 w-6" />
              </>
            )}
          </button>
        </div>
      </div>
      {/* Assigned List */}
      <div className="flex-12 ring-1 ring-gray-300 rounded-md p-2">
        <div className="flex justify-between items-center mb-4 border-b border-gray-300 pb-2 p-2">
          <h2 className="text-lg font-semibold">{t('assignedRoles')} <span className="text-blue-500">({assigned.length})</span></h2>
        </div>
        <ul className="space-y-2">
          {assigned.length > 0 ? (
            assigned.map((role) => (
              <li key={role.id} className="p-3 border rounded flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedAssigned.includes(role.id)}
                  onChange={() => toggleAssigned(role.id)}
                  className="h-4 w-4"
                  disabled={isView}
                  key={role.id}
                  title={`${t('unassignRoles')} ${role.name}`}
                  aria-label={`${t('unassignRoles')} ${role.name}`}
                />
                <span>{role.name}</span>
              </li>
            ))
          ) : (
            <div className="text-gray-500 text-center py-8">{t('noRoles')}</div>
          )}
        </ul>
      </div>
    </div>
  );
} 
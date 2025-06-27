import { Action } from "@/types/actions";
import React from "react";
import Button from "../ui/button/Button";
import { Loader2 } from "lucide-react";

interface ComponentCardProps {
  title: string;
  children: React.ReactNode;
  className?: string; // Additional custom classes for styling
  desc?: string; // Description text
  maxHeight?: string; // Optional max height for the card body
  listAction?: Action[]; // List of actions to display on the left of title
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = "",
  desc = "",
  maxHeight = "calc(100vh - 250px)", // Default max height
  listAction = [],
}) => {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      {/* Card Header */}
      <div className="px-6 py-3 flex items-center gap-2 justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            {title}
          </h3>
          {desc && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {desc}
            </p>
          )}
        </div>

        {listAction.length > 0 && (
          <div className="flex items-center gap-2">
            {listAction.map((action, index) => (
              <Button
                key={index}
                onClick={action.onClick}
                className={action.className}
                startIcon={action.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : action.icon}
                variant={action.variant}
                size={action.size ?? 'xs'}
                disabled={action.isLoading}
              >
                {action.isLoading ? 'Đang tải' : action.title}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div
        className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6 overflow-y-auto"
        style={{ maxHeight }}
      >
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default ComponentCard;

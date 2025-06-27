'use client';

import {useState, useTransition} from 'react';
import {Locale} from '@/i18n/config';
import { LanguagesIcon } from 'lucide-react';
import { setUserLocale } from '@/services/base/locale';
import { Dropdown } from '@/components/ui/dropdown/Dropdown';
import { DropdownItem } from '@/components/ui/dropdown/DropdownItem';

type Props = {
  defaultValue: string;
  items: Array<{value: string; label: string}>;
  // label: string;
};

export default function LocaleSwitcherSelect({
  defaultValue,
  items,
  // label
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  function onChange(value: string) {
    const locale = value as Locale;
    startTransition(() => {
      setUserLocale(locale);
    });
    closeDropdown();
  }

  const currentItem = items.find(item => item.value === defaultValue);

  return (
    <div className="relative">
      <button
        className="relative dropdown-toggle flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={toggleDropdown}
        disabled={isPending}
      >
        <LanguagesIcon className="h-5 w-5" />
      </button>
      
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[120px] mt-[17px] flex w-[200px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark lg:right-0"
      >
        
        <ul className="flex flex-col">
          {items.map((item) => (
            <li key={item.value}>
              <DropdownItem
                onItemClick={() => onChange(item.value)}
                className={`flex items-center gap-3 rounded-lg p-3 px-4.5 py-3 hover:bg-gray-100 dark:hover:bg-white/5 ${
                  item.value === defaultValue ? 'bg-gray-50 dark:bg-white/10' : ''
                }`}
              >
                <div className="flex items-center gap-3 w-full">
                  <LanguagesIcon className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-800 dark:text-white/90 font-medium">
                    {item.label}
                  </span>
                  {item.value === defaultValue && (
                    <div className="ml-auto">
                      <svg
                        className="h-4 w-4 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </DropdownItem>
            </li>
          ))}
        </ul>
      </Dropdown>
    </div>
  );
}

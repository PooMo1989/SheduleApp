'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

interface FilterOption {
    label: string;
    value: string;
}

interface FilterConfig {
    id: string;
    label: string;
    options: FilterOption[] | string[];
}

interface ActiveFilter {
    filterId: string;
    value: string;
    label: string;
}

interface SearchFilterBarProps {
    searchPlaceholder?: string;
    filters?: FilterConfig[];
    onSearch?: (query: string) => void;
    onFilter?: (filters: Record<string, string>) => void;
}

export function SearchFilterBar({
    searchPlaceholder = 'Search...',
    filters = [],
    onSearch,
    onFilter,
}: SearchFilterBarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Debounced search
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            onSearch?.(searchQuery);
        }, 300);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [searchQuery, onSearch]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleFilterSelect = (filterId: string, value: string, label: string) => {
        const updated = activeFilters.filter(f => f.filterId !== filterId);
        updated.push({ filterId, value, label });
        setActiveFilters(updated);
        setOpenDropdown(null);

        const filterMap: Record<string, string> = {};
        updated.forEach(f => { filterMap[f.filterId] = f.value; });
        onFilter?.(filterMap);
    };

    const removeFilter = (filterId: string) => {
        const updated = activeFilters.filter(f => f.filterId !== filterId);
        setActiveFilters(updated);

        const filterMap: Record<string, string> = {};
        updated.forEach(f => { filterMap[f.filterId] = f.value; });
        onFilter?.(filterMap);
    };

    const clearAll = () => {
        setActiveFilters([]);
        onFilter?.({});
    };

    const normalizeOptions = (options: FilterOption[] | string[]): FilterOption[] => {
        return options.map(opt =>
            typeof opt === 'string' ? { label: opt, value: opt } : opt
        );
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2" ref={dropdownRef}>
                {/* Search Input */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="w-full pl-9 pr-8 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-neutral-100"
                            aria-label="Clear search"
                        >
                            <X className="w-3.5 h-3.5 text-neutral-400" />
                        </button>
                    )}
                </div>

                {/* Filter Dropdowns */}
                {filters.map((filter) => {
                    const isOpen = openDropdown === filter.id;
                    const active = activeFilters.find(f => f.filterId === filter.id);

                    return (
                        <div key={filter.id} className="relative">
                            <button
                                onClick={() => setOpenDropdown(isOpen ? null : filter.id)}
                                className={`
                                    flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg transition-colors
                                    ${active
                                        ? 'border-primary-300 bg-primary-50 text-primary-700'
                                        : 'border-neutral-300 text-neutral-600 hover:bg-neutral-50'
                                    }
                                `}
                            >
                                {active ? active.label : filter.label}
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isOpen && (
                                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-20 py-1">
                                    {normalizeOptions(filter.options).map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleFilterSelect(filter.id, opt.value, opt.label)}
                                            className={`
                                                w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 transition-colors
                                                ${active?.value === opt.value ? 'text-primary-600 font-medium' : 'text-neutral-700'}
                                            `}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Active Filter Chips */}
            {activeFilters.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                    {activeFilters.map((filter) => (
                        <span
                            key={filter.filterId}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-primary-50 text-primary-700 rounded-md"
                        >
                            {filter.label}
                            <button
                                onClick={() => removeFilter(filter.filterId)}
                                className="p-0.5 rounded hover:bg-primary-100"
                                aria-label={`Remove ${filter.label} filter`}
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                    <button
                        onClick={clearAll}
                        className="text-xs text-neutral-500 hover:text-neutral-700 px-1"
                    >
                        Clear all
                    </button>
                </div>
            )}
        </div>
    );
}

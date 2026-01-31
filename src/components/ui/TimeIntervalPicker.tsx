'use client';

import * as React from 'react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeIntervalPickerProps {
    value: string; // HH:MM format (24-hour)
    onChange: (value: string) => void;
    min?: string; // HH:MM format
    max?: string; // HH:MM format
    interval?: number; // minutes, default 15
    disabled?: boolean;
    className?: string;
}

/**
 * Generate time options at specified intervals
 */
function generateTimeOptions(interval: number, min?: string, max?: string): string[] {
    const options: string[] = [];
    const minMinutes = min ? parseTimeToMinutes(min) : 0;
    const maxMinutes = max ? parseTimeToMinutes(max) : 24 * 60 - interval;

    for (let minutes = 0; minutes < 24 * 60; minutes += interval) {
        if (minutes >= minMinutes && minutes <= maxMinutes) {
            options.push(formatMinutesToTime(minutes));
        }
    }

    return options;
}

/**
 * Parse HH:MM to total minutes
 */
function parseTimeToMinutes(time: string): number {
    const [hours, mins] = time.split(':').map(Number);
    return hours * 60 + mins;
}

/**
 * Format total minutes to HH:MM
 */
function formatMinutesToTime(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Format 24-hour time to 12-hour display format
 */
function formatTo12Hour(time: string): string {
    const [hours, mins] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
}

/**
 * Snap a time value to the nearest interval
 */
function snapToInterval(time: string, interval: number): string {
    const minutes = parseTimeToMinutes(time);
    const snapped = Math.round(minutes / interval) * interval;
    return formatMinutesToTime(Math.min(snapped, 24 * 60 - interval));
}

export function TimeIntervalPicker({
    value,
    onChange,
    min,
    max,
    interval = 15,
    disabled = false,
    className,
}: TimeIntervalPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const selectedOptionRef = useRef<HTMLButtonElement>(null);

    // Snap value to interval on mount/change
    const snappedValue = useMemo(() => snapToInterval(value || '09:00', interval), [value, interval]);

    // Generate time options
    const timeOptions = useMemo(
        () => generateTimeOptions(interval, min, max),
        [interval, min, max]
    );

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Scroll to selected option when dropdown opens
    useEffect(() => {
        if (isOpen && selectedOptionRef.current && dropdownRef.current) {
            const dropdown = dropdownRef.current;
            const selected = selectedOptionRef.current;

            // Scroll so selected item is roughly in the middle
            const scrollTop = selected.offsetTop - dropdown.clientHeight / 2 + selected.offsetHeight / 2;
            dropdown.scrollTop = Math.max(0, scrollTop);
        }
    }, [isOpen]);

    const handleSelect = (time: string) => {
        onChange(time);
        setIsOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        } else if (e.key === 'ArrowDown' && isOpen) {
            e.preventDefault();
            const currentIndex = timeOptions.indexOf(snappedValue);
            if (currentIndex < timeOptions.length - 1) {
                onChange(timeOptions[currentIndex + 1]);
            }
        } else if (e.key === 'ArrowUp' && isOpen) {
            e.preventDefault();
            const currentIndex = timeOptions.indexOf(snappedValue);
            if (currentIndex > 0) {
                onChange(timeOptions[currentIndex - 1]);
            }
        }
    };

    return (
        <div ref={containerRef} className={cn('relative inline-block', className)}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                className={cn(
                    'flex items-center justify-between gap-1 w-[100px] px-2 py-1.5',
                    'border border-gray-200 rounded-md bg-white',
                    'text-sm text-gray-900',
                    'focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500',
                    'transition-all duration-150',
                    disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
                    isOpen && 'ring-1 ring-teal-500 border-teal-500'
                )}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span>{formatTo12Hour(snappedValue)}</span>
                <ChevronDown
                    className={cn(
                        'h-3.5 w-3.5 text-gray-400 transition-transform duration-150',
                        isOpen && 'transform rotate-180'
                    )}
                />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div
                    ref={dropdownRef}
                    className={cn(
                        'absolute z-50 mt-1 w-[100px]',
                        'max-h-52 overflow-auto',
                        'bg-white border border-gray-200 rounded-md shadow-lg',
                        'py-0.5'
                    )}
                    role="listbox"
                >
                    {timeOptions.map((time) => {
                        const isSelected = time === snappedValue;
                        return (
                            <button
                                key={time}
                                ref={isSelected ? selectedOptionRef : null}
                                type="button"
                                onClick={() => handleSelect(time)}
                                className={cn(
                                    'w-full px-2 py-1.5 text-left text-sm',
                                    'transition-colors duration-100',
                                    isSelected
                                        ? 'bg-teal-50 text-teal-700 font-medium'
                                        : 'text-gray-700 hover:bg-gray-50'
                                )}
                                role="option"
                                aria-selected={isSelected}
                            >
                                {formatTo12Hour(time)}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export { formatTo12Hour, parseTimeToMinutes, formatMinutesToTime };

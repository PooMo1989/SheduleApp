"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
    addMonths,
    eachDayOfInterval,
    endOfMonth,
    format,
    getDay,
    isSameDay,
    isSameMonth,
    isToday,
    startOfMonth,
    subMonths,
} from "date-fns";

export type CalendarProps = {
    mode?: "single";
    selected?: Date;
    onSelect?: (date: Date | undefined) => void;
    className?: string;
    disablePast?: boolean;
};

export function Calendar({
    mode = "single",
    selected,
    onSelect,
    className,
    disablePast = false,
}: CalendarProps) {
    const [currentMonth, setCurrentMonth] = React.useState(new Date());

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    });

    const firstDayOfMonth = getDay(startOfMonth(currentMonth));
    const prefixDays = Array.from({ length: firstDayOfMonth });

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const handleSelect = (date: Date) => {
        if (mode === "single" && onSelect) {
            onSelect(date);
        }
    };

    const isDateDisabled = (date: Date) => {
        if (disablePast) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return date < today;
        }
        return false;
    };

    return (
        <div className={`p-4 bg-white rounded-lg border border-slate-200 shadow-sm ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={prevMonth}
                    type="button"
                    className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <div className="font-semibold text-slate-800">
                    {format(currentMonth, "MMMM yyyy")}
                </div>
                <button
                    onClick={nextMonth}
                    type="button"
                    className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500 mb-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div key={day} className="py-1">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {prefixDays.map((_, index) => (
                    <div key={`prefix-${index}`} />
                ))}

                {daysInMonth.map((date) => {
                    const isSelected = selected && isSameDay(date, selected);
                    const isCurrentMonth = isSameMonth(date, currentMonth);
                    const isTodaysDate = isToday(date);
                    const disabled = isDateDisabled(date);

                    return (
                        <button
                            key={date.toString()}
                            onClick={() => !disabled && handleSelect(date)}
                            disabled={disabled}
                            type="button"
                            className={`
                h-9 w-9 rounded-full flex items-center justify-center text-sm transition-all
                ${!isCurrentMonth ? "invisible" : ""}
                ${isSelected
                                    ? "bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-sm"
                                    : "text-slate-700 hover:bg-slate-100"
                                }
                ${!isSelected && isTodaysDate ? "text-indigo-600 font-bold bg-indigo-50" : ""}
                ${disabled ? "opacity-30 cursor-not-allowed hover:bg-transparent" : ""}
              `}
                        >
                            {format(date, "d")}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

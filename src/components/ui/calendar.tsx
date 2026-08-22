import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CalendarProps {
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
  className?: string;
}

export function Calendar({ selectedDate = new Date(), onSelectDate, className }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(selectedDate);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const monthName = currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  
  // Calculate days in month
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    days.push(new Date(year, month, d));
  }

  return (
    <div className={cn("p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm w-full max-w-sm", className)}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{monthName}</h4>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            type="button"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            type="button"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, idx) => {
          if (!date) {
            return <div key={`empty-${idx}`} className="h-8 w-8" />;
          }
          const isSelected =
            selectedDate &&
            date.toDateString() === selectedDate.toDateString();
          const isToday =
            new Date().toDateString() === date.toDateString();

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => onSelectDate && onSelectDate(date)}
              className={cn(
                "h-8 w-8 text-xs rounded-lg flex items-center justify-center transition-all mx-auto",
                isSelected
                  ? "bg-emerald-600 text-white font-semibold shadow-sm"
                  : isToday
                  ? "border border-emerald-500 text-emerald-600 font-semibold"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

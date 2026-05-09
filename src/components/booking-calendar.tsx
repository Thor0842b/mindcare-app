"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isPastDate(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

export function BookingCalendar({ selectedDate, onSelectDate }: Props) {
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const today = new Date();

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const weeks = Math.ceil((firstDay + daysInMonth) / 7);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate text-sm">{monthLabel}</h3>
        <div className="flex gap-1">
          <button
            onClick={prevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-background transition-colors text-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={nextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-background transition-colors text-muted"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-xs font-medium text-muted py-1.5">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: weeks * 7 }).map((_, i) => {
          const day = i - firstDay + 1;
          const date =
            day >= 1 && day <= daysInMonth
              ? new Date(viewYear, viewMonth, day)
              : null;

          const isSelected = date && selectedDate && isSameDay(date, selectedDate);
          const isToday = date && isSameDay(date, today);
          const disabled = date ? isPastDate(date) : true;

          return (
            <button
              key={i}
              disabled={!date || disabled}
              onClick={() => date && onSelectDate(date)}
              className={`h-9 rounded-xl text-sm font-medium transition-all ${
                !date
                  ? "invisible"
                  : disabled
                  ? "text-muted/30 cursor-not-allowed"
                  : isSelected
                  ? "bg-sage text-white shadow-sm"
                  : isToday
                  ? "bg-mint text-sage font-semibold hover:bg-green-100"
                  : "hover:bg-mint text-slate"
              }`}
            >
              {date?.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

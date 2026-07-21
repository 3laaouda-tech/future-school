import type { ReactNode } from "react";
import { daysOfWeek, dayLabels, periods } from "../constants";

interface TimetableGridProps {
  renderCell: (day: string, period: number) => ReactNode;
}

// Renders a periods-as-rows, days-as-columns grid. The caller decides
// what goes in each cell via renderCell (read-only text, or an
// editable control for the admin management screen).
export default function TimetableGrid({ renderCell }: TimetableGridProps) {
  return (
    <div className="overflow-x-auto rounded-3xl bg-white shadow-sm">
      <table className="w-full text-left font-body">
        <thead className="bg-sun-cream text-sm text-ink/60">
          <tr>
            <th className="px-4 py-3">Period</th>
            {daysOfWeek.map((day) => (
              <th key={day} className="px-4 py-3">
                {dayLabels[day]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {periods.map((p) => (
            <tr key={p.period} className="border-t border-ink/5">
              <td className="px-4 py-3 align-top">
                <p className="font-body text-sm font-bold text-ink">P{p.period}</p>
                <p className="font-body text-xs text-ink/50">
                  {p.start}–{p.end}
                </p>
              </td>
              {daysOfWeek.map((day) => (
                <td key={day} className="px-2 py-2 align-top">
                  {renderCell(day, p.period)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

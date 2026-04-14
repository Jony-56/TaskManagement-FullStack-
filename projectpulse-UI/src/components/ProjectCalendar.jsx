import { useState } from "react";
import { format, isSameDay, isBefore, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, parseISO } from "date-fns";
import { CalendarIcon, Clock, ChevronLeft, ChevronRight } from "lucide-react";

const priorityBorders = {
    Low: "border-zinc-300 dark:border-zinc-600",
    Medium: "border-amber-300 dark:border-amber-500",
    High: "border-orange-400 dark:border-orange-500",
    Critical: "border-red-500 dark:border-red-500",
};

const ProjectCalendar = ({ tasks }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const today = new Date();

    const parsedTasks = tasks.map(t => ({ ...t, parsedDue: t.dueDate ? parseISO(t.dueDate) : null }));
    const getTasksForDate = (date) => parsedTasks.filter(t => t.parsedDue && isSameDay(t.parsedDue, date));

    const upcomingTasks = parsedTasks
        .filter(t => t.parsedDue && !isBefore(t.parsedDue, today) && t.status !== "Done")
        .sort((a, b) => a.parsedDue - b.parsedDue).slice(0, 5);

    const overdueTasks = parsedTasks.filter(t => t.parsedDue && isBefore(t.parsedDue, today) && t.status !== "Done");

    const daysInMonth = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
    const firstDayOfWeek = startOfMonth(currentMonth).getDay();

    return (
        <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-300 dark:border-zinc-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-zinc-900 dark:text-white flex gap-2 items-center">
                            <CalendarIcon className="size-5" /> Task Calendar
                        </h2>
                        <div className="flex gap-2 items-center">
                            <button onClick={() => setCurrentMonth(m => subMonths(m, 1))}>
                                <ChevronLeft className="size-5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white" />
                            </button>
                            <span className="text-zinc-900 dark:text-white font-medium">{format(currentMonth, "MMMM yyyy")}</span>
                            <button onClick={() => setCurrentMonth(m => addMonths(m, 1))}>
                                <ChevronRight className="size-5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white" />
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 text-xs text-zinc-500 dark:text-zinc-400 mb-2 text-center">
                        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => <div key={d}>{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
                        {daysInMonth.map(day => {
                            const dayTasks = getTasksForDate(day);
                            const isSelected = isSameDay(day, selectedDate);
                            const isToday = isSameDay(day, today);
                            const hasOverdue = dayTasks.some(t => t.status !== "Done" && isBefore(t.parsedDue, today));
                            return (
                                <button key={day.toString()} onClick={() => setSelectedDate(day)}
                                    className={`h-12 rounded-md flex flex-col items-center justify-center text-sm transition-colors
                                    ${isSelected ? "bg-blue-500 text-white" : isToday ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300" : "bg-zinc-50 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"}
                                    ${hasOverdue ? "ring-1 ring-red-400" : ""}`}>
                                    <span>{format(day, "d")}</span>
                                    {dayTasks.length > 0 && <span className="text-[9px] opacity-75">{dayTasks.length}t</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {getTasksForDate(selectedDate).length > 0 && (
                    <div className="mt-4 bg-white dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-300 dark:border-zinc-800 rounded-lg p-4">
                        <h3 className="text-zinc-900 dark:text-white mb-3 font-medium">
                            Tasks for {format(selectedDate, "MMM d, yyyy")}
                        </h3>
                        <div className="space-y-2">
                            {getTasksForDate(selectedDate).map(task => (
                                <div key={task.id} className={`bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded border-l-4 ${priorityBorders[task.priority] || priorityBorders.Medium}`}>
                                    <div className="flex justify-between">
                                        <h4 className="text-zinc-900 dark:text-white font-medium text-sm">{task.title}</h4>
                                        <span className="text-xs text-zinc-500 dark:text-zinc-400">{task.status}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-zinc-500 mt-1">
                                        <span>{task.priority} priority</span>
                                        {task.assigneeName && <span>{task.assigneeName}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <div className="bg-white dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-300 dark:border-zinc-800 rounded-lg p-4">
                    <h3 className="text-zinc-900 dark:text-white text-sm flex items-center gap-2 mb-3">
                        <Clock className="w-4 h-4" /> Upcoming Tasks
                    </h3>
                    {upcomingTasks.length === 0 ? (
                        <p className="text-zinc-500 text-sm text-center">No upcoming tasks</p>
                    ) : (
                        <div className="space-y-2">
                            {upcomingTasks.map(task => (
                                <div key={task.id} className="bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-lg">
                                    <p className="text-zinc-900 dark:text-white text-sm font-medium truncate">{task.title}</p>
                                    <p className="text-xs text-zinc-500 mt-0.5">{format(task.parsedDue, "MMM d")}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {overdueTasks.length > 0 && (
                    <div className="border border-red-300 dark:border-red-700 border-l-4 rounded-lg p-4">
                        <h3 className="text-red-600 dark:text-red-400 text-sm flex items-center gap-2 mb-3">
                            <Clock className="w-4 h-4" /> Overdue ({overdueTasks.length})
                        </h3>
                        <div className="space-y-2">
                            {overdueTasks.slice(0, 5).map(task => (
                                <div key={task.id} className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                                    <p className="text-sm text-zinc-900 dark:text-white truncate">{task.title}</p>
                                    <p className="text-xs text-red-500 mt-0.5">Due {format(task.parsedDue, "MMM d")}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectCalendar;

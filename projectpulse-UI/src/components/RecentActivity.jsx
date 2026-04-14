import { useEffect, useState } from "react";
import { GitCommit, MessageSquare, Clock, Bug, Zap, Square } from "lucide-react";
import { format } from "date-fns";
import { useSelector } from "react-redux";
import { selectAllProjects } from "../features/workspaceSlice";

const typeIcons = {
    BUG: { icon: Bug, color: "text-red-500" }, FEATURE: { icon: Zap, color: "text-blue-500" },
    TASK: { icon: Square, color: "text-green-500" }, IMPROVEMENT: { icon: MessageSquare, color: "text-amber-500" },
    OTHER: { icon: GitCommit, color: "text-purple-500" },
};
const statusColors = {
    Todo: "bg-zinc-200 text-zinc-800 dark:bg-zinc-600 dark:text-zinc-200",
    InProgress: "bg-amber-200 text-amber-800 dark:bg-amber-500 dark:text-amber-900",
    Done: "bg-emerald-200 text-emerald-800 dark:bg-emerald-500 dark:text-emerald-900",
    Review: "bg-blue-200 text-blue-800 dark:bg-blue-500 dark:text-blue-900",
};

const RecentActivity = () => {
    const projects = useSelector(selectAllProjects);
    const tasks = projects.flatMap(p => (p.tasks || []).map(t => ({ ...t, projectName: p.name })))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);

    return (
        <div className="bg-white dark:bg-zinc-950 dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
            <div className="border-b border-zinc-200 dark:border-zinc-800 p-4">
                <h2 className="text-lg text-zinc-800 dark:text-zinc-200">Recent Tasks</h2>
            </div>
            <div className="p-0">
                {tasks.length === 0 ? (
                    <div className="p-12 text-center">
                        <Clock className="w-8 h-8 text-zinc-500 mx-auto mb-3" />
                        <p className="text-zinc-600 dark:text-zinc-400">No recent activity</p>
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {tasks.map((task) => {
                            const TypeIcon = typeIcons[task.type]?.icon || Square;
                            const iconColor = typeIcons[task.type]?.color || "text-gray-500";
                            return (
                                <div key={task.id} className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                            <TypeIcon className={`w-4 h-4 ${iconColor}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-1">
                                                <h4 className="text-zinc-800 dark:text-zinc-200 truncate text-sm font-medium">{task.title}</h4>
                                                <span className={`ml-2 px-2 py-0.5 rounded text-xs ${statusColors[task.status] || "bg-zinc-200 text-zinc-700"}`}>{task.status}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                                                <span>{task.projectName}</span>
                                                {task.assigneeName && <span>· {task.assigneeName}</span>}
                                                <span>· {format(new Date(task.createdAt), "MMM d")}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentActivity;

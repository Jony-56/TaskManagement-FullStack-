import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { CheckCircle, Clock, AlertTriangle, Users } from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const ProjectAnalytics = ({ project, tasks }) => {
    const { stats, statusData, priorityData } = useMemo(() => {
        const now = new Date();
        const total = tasks.length;
        const stats = { total, completed: 0, inProgress: 0, todo: 0, overdue: 0 };
        const statusMap = { Todo: 0, InProgress: 0, Review: 0, Done: 0 };
        const priorityMap = { Low: 0, Medium: 0, High: 0, Critical: 0 };

        tasks.forEach(t => {
            if (t.status === "Done") stats.completed++;
            if (t.status === "InProgress") stats.inProgress++;
            if (t.status === "Todo") stats.todo++;
            if (t.dueDate && new Date(t.dueDate) < now && t.status !== "Done") stats.overdue++;
            if (statusMap[t.status] !== undefined) statusMap[t.status]++;
            if (priorityMap[t.priority] !== undefined) priorityMap[t.priority]++;
        });

        return {
            stats,
            statusData: Object.entries(statusMap).map(([k, v]) => ({ name: k, value: v })),
            priorityData: Object.entries(priorityMap)
                .filter(([, v]) => v > 0)
                .map(([k, v]) => ({ name: k, value: v, pct: total > 0 ? Math.round(v / total * 100) : 0 })),
        };
    }, [tasks]);

    const completionRate = stats.total ? Math.round(stats.completed / stats.total * 100) : 0;
    const metrics = [
        { label: "Completion Rate", value: `${completionRate}%`, icon: CheckCircle, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
        { label: "In Progress", value: stats.inProgress, icon: Clock, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" },
        { label: "Overdue", value: stats.overdue, icon: AlertTriangle, color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30" },
        { label: "Team Size", value: project?.members?.length || 0, icon: Users, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30" },
    ];

    const cardClass = "bg-white dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-300 dark:border-zinc-800 rounded-lg p-6";

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((m, i) => (
                    <div key={i} className={cardClass}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-zinc-500 dark:text-zinc-400 text-sm">{m.label}</p>
                                <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
                            </div>
                            <div className={`p-2 rounded-md ${m.bg}`}><m.icon className={`size-5 ${m.color}`} /></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <div className={cardClass}>
                    <h2 className="text-zinc-900 dark:text-white mb-4 font-medium">Tasks by Status</h2>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={statusData}>
                            <XAxis dataKey="name" tick={{ fill: "#71717a", fontSize: 12 }} />
                            <YAxis tick={{ fill: "#71717a", fontSize: 12 }} />
                            <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8, color: "#e4e4e7" }} />
                            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className={cardClass}>
                    <h2 className="text-zinc-900 dark:text-white mb-4 font-medium">Tasks by Priority</h2>
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie data={priorityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                                label={({ name, pct }) => `${name}: ${pct}%`}>
                                {priorityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8, color: "#e4e4e7" }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Progress bar breakdown */}
            <div className={cardClass}>
                <h2 className="text-zinc-900 dark:text-white mb-4 font-medium">Priority Breakdown</h2>
                <div className="space-y-4">
                    {priorityData.map(p => (
                        <div key={p.name} className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-700 dark:text-zinc-300 capitalize">{p.name}</span>
                                <span className="text-zinc-500 dark:text-zinc-400">{p.value} tasks · {p.pct}%</span>
                            </div>
                            <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5">
                                <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${p.pct}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProjectAnalytics;

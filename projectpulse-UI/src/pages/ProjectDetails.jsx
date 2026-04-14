import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeftIcon, PlusIcon, SettingsIcon, BarChart3Icon, CalendarIcon, FileStackIcon, RefreshCwIcon } from "lucide-react";
import ProjectAnalytics from "../components/ProjectAnalytics";
import ProjectSettings from "../components/ProjectSettings";
import CreateTaskDialog from "../components/CreateTaskDialog";
import ProjectCalendar from "../components/ProjectCalendar";
import ProjectTasks from "../components/ProjectTasks";
import { selectProjectById, updateProject } from "../features/workspaceSlice";
import { getProject } from "../api/projectApi";
import { getTasks } from "../api/taskApi";
import toast from "react-hot-toast";

export default function ProjectDetail() {
    const [searchParams, setSearchParams] = useSearchParams();
    const tab = searchParams.get("tab") || "tasks";
    const id = searchParams.get("id");
    const numericId = parseInt(id) || id;

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const project = useSelector(selectProjectById(numericId));
    const loading = useSelector(state => state.workspace.loading);

    const [tasks, setTasks] = useState([]);
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [activeTab, setActiveTab] = useState(tab);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => { setActiveTab(tab); }, [tab]);

    useEffect(() => {
        if (project) setTasks(project.tasks || []);
    }, [project]);

    // Fetch fresh data when landing on project details
    useEffect(() => {
        if (!numericId) return;
        const loadFresh = async () => {
            try {
                const [pRes, tRes] = await Promise.all([getProject(numericId), getTasks(numericId)]);
                if (pRes?.data) dispatch(updateProject({ ...pRes.data, tasks: tRes?.data || [], members: pRes.data.members || [] }));
                setTasks(tRes?.data || []);
            } catch {}
        };
        loadFresh();
    }, [numericId]);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const [pRes, tRes] = await Promise.all([getProject(numericId), getTasks(numericId)]);
            if (pRes?.data) dispatch(updateProject({ ...pRes.data, tasks: tRes?.data || [], members: pRes.data.members || [] }));
            setTasks(tRes?.data || []);
            toast.success("Refreshed");
        } catch { toast.error("Failed to refresh"); }
        finally { setRefreshing(false); }
    };

    const statusColors = {
        Active: "bg-emerald-200 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-400",
        Archived: "bg-zinc-200 text-zinc-900 dark:bg-zinc-600 dark:text-zinc-200",
        Completed: "bg-blue-200 text-blue-900 dark:bg-blue-500/20 dark:text-blue-400",
    };

    if (!project) {
        return (
            <div className="p-6 text-center text-zinc-900 dark:text-zinc-200">
                {loading ? (
                    <p className="text-2xl mt-20">Loading project...</p>
                ) : (
                    <>
                        <p className="text-2xl mt-20 mb-6">Project not found</p>
                        <button onClick={() => navigate("/projects")} className="px-4 py-2 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white hover:opacity-90">
                            Back to Projects
                        </button>
                    </>
                )}
            </div>
        );
    }

    const doneTasks = tasks.filter(t => t.status === "Done").length;
    const progress = tasks.length > 0 ? Math.round(doneTasks / tasks.length * 100) : 0;

    return (
        <div className="space-y-5 max-w-6xl mx-auto text-zinc-900 dark:text-white">
            {/* Header */}
            <div className="flex flex-wrap gap-4 items-start justify-between">
                <div className="flex items-center gap-3">
                    <button className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500" onClick={() => navigate("/projects")}>
                        <ArrowLeftIcon className="w-4 h-4" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-semibold">{project.name}</h1>
                            <span className={`px-2 py-0.5 rounded text-xs ${statusColors[project.status] || statusColors.Active}`}>{project.status}</span>
                        </div>
                        {project.description && <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{project.description}</p>}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleRefresh} disabled={refreshing}
                        className="p-2 rounded border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500 transition">
                        <RefreshCwIcon className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
                    </button>
                    <button onClick={() => setShowCreateTask(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm rounded bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:opacity-90">
                        <PlusIcon className="size-4" /> New Task
                    </button>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "Total Tasks", value: tasks.length, color: "text-zinc-900 dark:text-white" },
                    { label: "Done", value: doneTasks, color: "text-emerald-600 dark:text-emerald-400" },
                    { label: "In Progress", value: tasks.filter(t => t.status === "InProgress").length, color: "text-amber-600 dark:text-amber-400" },
                    { label: "Members", value: project.members?.length || 0, color: "text-blue-600 dark:text-blue-400" },
                ].map((card) => (
                    <div key={card.label} className="dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-4 rounded">
                        <div className="text-sm text-zinc-500 dark:text-zinc-400">{card.label}</div>
                        <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                    </div>
                ))}
            </div>

            {/* Progress bar */}
            {tasks.length > 0 && (
                <div className="dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded p-3">
                    <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
                        <span>Overall Progress</span><span>{progress}%</span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                        <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="inline-flex flex-wrap gap-1 border border-zinc-200 dark:border-zinc-800 rounded p-1 bg-zinc-50 dark:bg-zinc-900">
                {[
                    { key: "tasks", label: "Tasks", icon: FileStackIcon },
                    { key: "calendar", label: "Calendar", icon: CalendarIcon },
                    { key: "analytics", label: "Analytics", icon: BarChart3Icon },
                    { key: "settings", label: "Settings", icon: SettingsIcon },
                ].map(tabItem => (
                    <button key={tabItem.key}
                        onClick={() => { setActiveTab(tabItem.key); setSearchParams({ id, tab: tabItem.key }); }}
                        className={`flex items-center gap-2 px-4 py-2 text-sm rounded transition-all ${activeTab === tabItem.key ? "bg-white dark:bg-zinc-800 shadow-sm text-blue-600 dark:text-blue-400 font-medium" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"}`}>
                        <tabItem.icon className="size-3.5" />
                        {tabItem.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="mt-2">
                {activeTab === "tasks" && <ProjectTasks tasks={tasks} projectId={numericId} />}
                {activeTab === "analytics" && <ProjectAnalytics tasks={tasks} project={project} />}
                {activeTab === "calendar" && <ProjectCalendar tasks={tasks} />}
                {activeTab === "settings" && <ProjectSettings project={project} />}
            </div>

            {showCreateTask && (
                <CreateTaskDialog showCreateTask={showCreateTask} setShowCreateTask={setShowCreateTask} projectId={numericId} />
            )}
        </div>
    );
}

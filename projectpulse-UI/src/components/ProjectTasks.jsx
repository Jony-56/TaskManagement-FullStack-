import { format } from "date-fns";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { updateTask, deleteTask } from "../features/workspaceSlice";
import { deleteTask as deleteTaskApi, updateTaskStatus as updateTaskStatusApi } from "../api/taskApi";
import { CalendarIcon, Trash, XIcon } from "lucide-react";

const priorityStyles = {
    Low:      { bg: "bg-emerald-100 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-400" },
    Medium:   { bg: "bg-blue-100 dark:bg-blue-950",      text: "text-blue-700 dark:text-blue-400" },
    High:     { bg: "bg-amber-100 dark:bg-amber-950",    text: "text-amber-700 dark:text-amber-400" },
    Critical: { bg: "bg-red-100 dark:bg-red-950",        text: "text-red-700 dark:text-red-400" },
};

const statusStyles = {
    Todo:       "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200",
    InProgress: "bg-amber-200 text-amber-900 dark:bg-amber-700 dark:text-amber-100",
    Review:     "bg-blue-200 text-blue-900 dark:bg-blue-700 dark:text-blue-100",
    Done:       "bg-emerald-200 text-emerald-900 dark:bg-emerald-700 dark:text-emerald-100",
};

const ProjectTasks = ({ tasks, projectId }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [selectedTasks, setSelectedTasks] = useState([]);
    const [filters, setFilters] = useState({ status: "", priority: "", assignee: "" });

    const assigneeList = useMemo(() =>
        Array.from(new Set(tasks.map(t => t.assigneeName).filter(Boolean))), [tasks]);

    const filteredTasks = useMemo(() => tasks.filter(t => {
        const { status, priority, assignee } = filters;
        return (!status || t.status === status) &&
            (!priority || t.priority === priority) &&
            (!assignee || t.assigneeName === assignee);
    }), [filters, tasks]);

    const handleStatusChange = async (task, newStatus) => {
        try {
            await updateTaskStatusApi(task.projectId || projectId, task.id, { status: newStatus });
            dispatch(updateTask({ ...task, status: newStatus }));
            toast.success("Status updated");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to update status.");
        }
    };

    const handleDelete = async () => {
        if (!selectedTasks.length) return;
        if (!window.confirm(`Delete ${selectedTasks.length} task(s)?`)) return;
        try {
            const pid = tasks.find(t => selectedTasks.includes(t.id))?.projectId || projectId;
            await Promise.all(selectedTasks.map(id => deleteTaskApi(pid, id)));
            dispatch(deleteTask({ projectId: pid, taskIds: selectedTasks }));
            setSelectedTasks([]);
            toast.success("Tasks deleted");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to delete tasks.");
        }
    };

    const toggleSelect = (id) =>
        setSelectedTasks(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);

    const toggleAll = () =>
        setSelectedTasks(selectedTasks.length === tasks.length ? [] : tasks.map(t => t.id));

    return (
        <div>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-4">
                <select name="status" onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}
                    className="border bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 outline-none px-3 py-1.5 rounded text-sm text-zinc-900 dark:text-zinc-200">
                    <option value="">All Statuses</option>
                    <option value="Todo">To Do</option>
                    <option value="InProgress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Done">Done</option>
                </select>
                <select name="priority" onChange={e => setFilters(p => ({ ...p, priority: e.target.value }))}
                    className="border bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 outline-none px-3 py-1.5 rounded text-sm text-zinc-900 dark:text-zinc-200">
                    <option value="">All Priorities</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                </select>
                <select name="assignee" onChange={e => setFilters(p => ({ ...p, assignee: e.target.value }))}
                    className="border bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 outline-none px-3 py-1.5 rounded text-sm text-zinc-900 dark:text-zinc-200">
                    <option value="">All Assignees</option>
                    {assigneeList.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                {(filters.status || filters.priority || filters.assignee) && (
                    <button onClick={() => setFilters({ status: "", priority: "", assignee: "" })}
                        className="px-3 py-1.5 flex items-center gap-1 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-sm">
                        <XIcon className="size-3" /> Reset
                    </button>
                )}
                {selectedTasks.length > 0 && (
                    <button onClick={handleDelete}
                        className="px-3 py-1.5 flex items-center gap-1 rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm border border-red-300 dark:border-red-700">
                        <Trash className="size-3" /> Delete ({selectedTasks.length})
                    </button>
                )}
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block overflow-auto rounded-lg border border-zinc-300 dark:border-zinc-800">
                <table className="min-w-full text-sm text-left bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-300">
                    <thead className="text-xs uppercase dark:bg-zinc-800/70 text-zinc-500 dark:text-zinc-400">
                        <tr>
                            <th className="pl-3 pr-1 py-3">
                                <input type="checkbox" checked={selectedTasks.length === tasks.length && tasks.length > 0}
                                    onChange={toggleAll} className="size-3 accent-zinc-600" />
                            </th>
                            <th className="px-4 py-3">Title</th>
                            <th className="px-4 py-3">Priority</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Assignee</th>
                            <th className="px-4 py-3">Due Date</th>
                            <th className="px-4 py-3">Comments</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTasks.length > 0 ? filteredTasks.map(task => {
                            const ps = priorityStyles[task.priority] || priorityStyles.Medium;
                            return (
                                <tr key={task.id}
                                    onClick={() => navigate(`/taskDetails?projectId=${task.projectId || projectId}&taskId=${task.id}`)}
                                    className="border-t border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors">
                                    <td onClick={e => e.stopPropagation()} className="pl-3 pr-1 py-2">
                                        <input type="checkbox" className="size-3 accent-zinc-600"
                                            checked={selectedTasks.includes(task.id)}
                                            onChange={() => toggleSelect(task.id)} />
                                    </td>
                                    <td className="px-4 py-2 font-medium">{task.title}</td>
                                    <td className="px-4 py-2">
                                        <span className={`text-xs px-2 py-1 rounded ${ps.bg} ${ps.text}`}>{task.priority}</span>
                                    </td>
                                    <td onClick={e => e.stopPropagation()} className="px-4 py-2">
                                        <select value={task.status}
                                            onChange={e => handleStatusChange(task, e.target.value)}
                                            className={`text-xs px-2 py-1 rounded cursor-pointer outline-none ${statusStyles[task.status] || statusStyles.Todo}`}>
                                            <option value="Todo">To Do</option>
                                            <option value="InProgress">In Progress</option>
                                            <option value="Review">Review</option>
                                            <option value="Done">Done</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="flex items-center gap-2">
                                            {task.assigneeName ? (
                                                <>
                                                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                                                        {task.assigneeName[0]}
                                                    </div>
                                                    <span className="text-xs">{task.assigneeName}</span>
                                                </>
                                            ) : <span className="text-zinc-400 text-xs">Unassigned</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2">
                                        {task.dueDate ? (
                                            <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 text-xs">
                                                <CalendarIcon className="size-3" />
                                                {format(new Date(task.dueDate), "dd MMM yyyy")}
                                            </div>
                                        ) : <span className="text-zinc-400 text-xs">—</span>}
                                    </td>
                                    <td className="px-4 py-2 text-zinc-400 text-xs">
                                        {task.comments?.length || 0}
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr><td colSpan="7" className="text-center text-zinc-500 py-8">No tasks found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden flex flex-col gap-3">
                {filteredTasks.map(task => {
                    const ps = priorityStyles[task.priority] || priorityStyles.Medium;
                    return (
                        <div key={task.id}
                            onClick={() => navigate(`/taskDetails?projectId=${task.projectId || projectId}&taskId=${task.id}`)}
                            className="dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-300 dark:border-zinc-800 rounded-lg p-4 cursor-pointer">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">{task.title}</h3>
                                <input type="checkbox" className="size-4"
                                    checked={selectedTasks.includes(task.id)}
                                    onChange={e => { e.stopPropagation(); toggleSelect(task.id); }} />
                            </div>
                            <div className="flex flex-wrap gap-2 mb-2">
                                <span className={`text-xs px-2 py-0.5 rounded ${ps.bg} ${ps.text}`}>{task.priority}</span>
                                <span className={`text-xs px-2 py-0.5 rounded ${statusStyles[task.status] || statusStyles.Todo}`}>{task.status}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                                <span>{task.assigneeName || 'Unassigned'}</span>
                                {task.dueDate && <span className="flex items-center gap-1"><CalendarIcon className="size-3"/>{format(new Date(task.dueDate), "dd MMM")}</span>}
                            </div>
                        </div>
                    );
                })}
                {filteredTasks.length === 0 && <p className="text-center text-zinc-500 py-8">No tasks found.</p>}
            </div>
        </div>
    );
};

export default ProjectTasks;

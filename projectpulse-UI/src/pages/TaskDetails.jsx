import { format } from "date-fns";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CalendarIcon, MessageCircle, PenIcon, ArrowLeftIcon, Trash2Icon, CheckCircle } from "lucide-react";
import { getTask, addComment, updateTask as updateTaskApi, deleteTask as deleteTaskApi, updateTaskStatus } from "../api/taskApi";
import { updateTask, deleteTask, selectProjectById } from "../features/workspaceSlice";

const priorityColors = {
    Low:      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400",
    Medium:   "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400",
    High:     "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400",
    Critical: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400",
};
const statusColors = {
    Todo:       "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200",
    InProgress: "bg-amber-200 text-amber-900 dark:bg-amber-700 dark:text-amber-100",
    Review:     "bg-blue-200 text-blue-900 dark:bg-blue-700 dark:text-blue-100",
    Done:       "bg-emerald-200 text-emerald-900 dark:bg-emerald-700 dark:text-emerald-100",
};

const TaskDetails = () => {
    const [searchParams] = useSearchParams();
    const projectId = searchParams.get("projectId");
    const taskId = searchParams.get("taskId");
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const currentUser = useSelector(state => state.auth.user);
    const project = useSelector(selectProjectById(parseInt(projectId) || projectId));

    const [task, setTask] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [editingStatus, setEditingStatus] = useState(false);

    const fetchTask = async () => {
        if (!projectId || !taskId) return;
        try {
            const res = await getTask(projectId, taskId);
            const taskData = res?.data;
            if (taskData) { setTask(taskData); setComments(taskData.comments || []); }
        } catch (err) {
            console.error("Failed to load task:", err);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchTask(); }, [projectId, taskId]);

    // Poll for new comments every 15s
    useEffect(() => {
        if (!task) return;
        const interval = setInterval(async () => {
            try {
                const res = await getTask(projectId, taskId);
                if (res?.data) setComments(res.data.comments || []);
            } catch {}
        }, 15000);
        return () => clearInterval(interval);
    }, [task]);

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        setSubmitting(true);
        try {
            await addComment(projectId, taskId, { content: newComment });
            setNewComment("");
            toast.success("Comment added.");
            await fetchTask();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to add comment.");
        } finally { setSubmitting(false); }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await updateTaskStatus(projectId, taskId, { status: newStatus });
            setTask(t => ({ ...t, status: newStatus }));
            dispatch(updateTask({ ...task, status: newStatus, projectId: parseInt(projectId) || projectId }));
            toast.success("Status updated");
        } catch { toast.error("Failed to update status"); }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Delete "${task.title}"?`)) return;
        try {
            await deleteTaskApi(projectId, taskId);
            dispatch(deleteTask({ projectId: parseInt(projectId) || projectId, taskIds: [parseInt(taskId) || taskId] }));
            toast.success("Task deleted");
            navigate(`/projectsDetail?id=${projectId}&tab=tasks`);
        } catch { toast.error("Failed to delete task"); }
    };

    if (loading) return <div className="text-gray-500 dark:text-zinc-400 px-4 py-6">Loading task...</div>;
    if (!task) return <div className="text-red-500 px-4 py-6">Task not found.</div>;

    return (
        <div className="max-w-6xl mx-auto">
            {/* Back button */}
            <button onClick={() => navigate(`/projectsDetail?id=${projectId}&tab=tasks`)}
                className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mb-4 transition-colors">
                <ArrowLeftIcon className="size-4" /> Back to Project
            </button>

            <div className="flex flex-col-reverse lg:flex-row gap-6">
                {/* Left: Comments */}
                <div className="w-full lg:w-3/5">
                    <div className="p-5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col" style={{ minHeight: 480 }}>
                        <h2 className="text-base font-semibold flex items-center gap-2 mb-4">
                            <MessageCircle className="size-5" /> Discussion ({comments.length})
                        </h2>
                        <div className="flex-1 overflow-y-auto mb-4 space-y-3 max-h-96">
                            {comments.length === 0 ? (
                                <p className="text-gray-500 dark:text-zinc-400 text-sm">No comments yet. Be the first!</p>
                            ) : comments.map(comment => {
                                const isMe = comment.authorId === currentUser?.id;
                                return (
                                    <div key={comment.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                                        <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                            {(comment.authorName || "?")[0].toUpperCase()}
                                        </div>
                                        <div className={`max-w-[75%] border rounded-lg p-3 ${isMe ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" : "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"}`}>
                                            <div className="flex items-baseline gap-2 mb-1">
                                                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{comment.authorName}</span>
                                                <span className="text-xs text-zinc-400 dark:text-zinc-500">{format(new Date(comment.createdAt), "dd MMM, HH:mm")}</span>
                                            </div>
                                            <p className="text-sm text-zinc-800 dark:text-zinc-200">{comment.content}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex gap-2 mt-auto pt-3 border-t border-zinc-200 dark:border-zinc-700">
                            <textarea value={newComment} onChange={e => setNewComment(e.target.value)}
                                placeholder="Write a comment... (Enter to send)"
                                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddComment(); } }}
                                className="flex-1 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded p-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-zinc-200"
                                rows={3} />
                            <button onClick={handleAddComment} disabled={submitting || !newComment.trim()}
                                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm px-4 py-2 rounded self-end transition">
                                {submitting ? "..." : "Post"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Task Info */}
                <div className="w-full lg:w-2/5 flex flex-col gap-4">
                    {/* Task card */}
                    <div className="p-5 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
                        <div className="flex items-start justify-between mb-3 gap-2">
                            <h1 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 leading-tight">{task.title}</h1>
                            <button onClick={handleDelete} className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-400 hover:text-red-600 flex-shrink-0 transition">
                                <Trash2Icon className="size-4" />
                            </button>
                        </div>

                        {/* Status selector */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[task.priority] || priorityColors.Medium}`}>{task.priority}</span>
                            <select value={task.status} onChange={e => handleStatusChange(e.target.value)}
                                className={`text-xs px-2 py-0.5 rounded border-none outline-none cursor-pointer font-medium ${statusColors[task.status] || statusColors.Todo}`}>
                                <option value="Todo">To Do</option>
                                <option value="InProgress">In Progress</option>
                                <option value="Review">Review</option>
                                <option value="Done">Done</option>
                            </select>
                        </div>

                        {task.description && (
                            <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed mb-4">{task.description}</p>
                        )}

                        <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-500 dark:text-zinc-400">Assignee</span>
                                <div className="flex items-center gap-2">
                                    {task.assigneeName ? (
                                        <>
                                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">{task.assigneeName[0]}</div>
                                            <span className="text-zinc-800 dark:text-zinc-200">{task.assigneeName}</span>
                                        </>
                                    ) : <span className="text-zinc-400">Unassigned</span>}
                                </div>
                            </div>
                            {task.dueDate && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-zinc-500 dark:text-zinc-400">Due Date</span>
                                    <div className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300">
                                        <CalendarIcon className="size-3.5" />
                                        {format(new Date(task.dueDate), "dd MMM yyyy")}
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-500 dark:text-zinc-400">Created</span>
                                <span className="text-zinc-700 dark:text-zinc-300">{format(new Date(task.createdAt), "dd MMM yyyy")}</span>
                            </div>
                        </div>
                    </div>

                    {/* Project info */}
                    {project && (
                        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
                            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                                <PenIcon className="size-3.5" /> Project Details
                            </p>
                            <h2 className="text-zinc-900 dark:text-zinc-100 font-medium">{project.name}</h2>
                            <div className="flex flex-wrap gap-3 text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                                <span>Status: {project.status}</span>
                                <span>{(project.tasks || []).length} tasks</span>
                                {project.deadline && <span>Due {format(new Date(project.deadline), "dd MMM yyyy")}</span>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskDetails;

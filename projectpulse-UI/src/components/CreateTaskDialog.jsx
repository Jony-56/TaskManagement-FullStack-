import { useState } from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { createTask } from "../api/taskApi";
import { addTask } from "../features/workspaceSlice";
import { selectProjectById } from "../features/workspaceSlice";

export default function CreateTaskDialog({ showCreateTask, setShowCreateTask, projectId }) {
    const dispatch = useDispatch();
    const project = useSelector(selectProjectById(projectId));
    const teamMembers = project?.members || [];

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "Medium",
        assigneeId: "",
        dueDate: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim()) return toast.error("Title is required");
        setIsSubmitting(true);
        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                priority: formData.priority,
                assigneeId: formData.assigneeId || undefined,
                dueDate: formData.dueDate || undefined,
            };
            const response = await createTask(projectId, payload);
            const createdTask = response?.data;
            if (createdTask) {
                dispatch(addTask({ ...createdTask, projectId: parseInt(projectId) || projectId }));
            }
            toast.success("Task created successfully.");
            setShowCreateTask(false);
            setFormData({ title: "", description: "", priority: "Medium", assigneeId: "", dueDate: "" });
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to create task.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!showCreateTask) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 dark:bg-black/60 backdrop-blur">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg shadow-lg w-full max-w-md p-6 text-zinc-900 dark:text-white">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Create New Task</h2>
                    <button onClick={() => setShowCreateTask(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                        <X className="size-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Title *</label>
                        <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Task title"
                            className="w-full rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Description</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe the task"
                            className="w-full rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm mt-1 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Priority</label>
                            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm mt-1">
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Assignee</label>
                            <select value={formData.assigneeId} onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                                className="w-full rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm mt-1">
                                <option value="">Unassigned</option>
                                {teamMembers.map((member) => (
                                    <option key={member.userId} value={member.userId}>{member.fullName}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Due Date</label>
                        <div className="flex items-center gap-2 mt-1">
                            <CalendarIcon className="size-4 text-zinc-400" />
                            <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        {formData.dueDate && <p className="text-xs text-zinc-400">{format(new Date(formData.dueDate), "PPP")}</p>}
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setShowCreateTask(false)}
                            className="rounded border border-zinc-300 dark:border-zinc-700 px-5 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting}
                            className="rounded px-5 py-2 text-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white disabled:opacity-50 transition">
                            {isSubmitting ? "Creating..." : "Create Task"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

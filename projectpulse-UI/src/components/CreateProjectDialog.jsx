import { useState } from "react";
import { XIcon } from "lucide-react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { createProject } from "../api/projectApi";
import { addProject } from "../features/workspaceSlice";

const CreateProjectDialog = ({ isDialogOpen, setIsDialogOpen }) => {
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: "", description: "", deadline: "" });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return toast.error("Project name is required");
        setIsSubmitting(true);
        try {
            const payload = { name: formData.name, description: formData.description, deadline: formData.deadline || undefined };
            const response = await createProject(payload);
            // API returns the created project directly
            const project = response?.data;
            if (project) {
                dispatch(addProject({ ...project, tasks: project.tasks || [], members: project.members || [] }));
            }
            toast.success("Project created successfully.");
            setFormData({ name: "", description: "", deadline: "" });
            setIsDialogOpen(false);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to create project.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isDialogOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur flex items-center justify-center z-50">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-lg relative">
                <button className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200" onClick={() => setIsDialogOpen(false)}>
                    <XIcon className="size-5" />
                </button>
                <h2 className="text-xl font-medium mb-4 text-zinc-900 dark:text-zinc-200">Create New Project</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm mb-1 text-zinc-700 dark:text-zinc-300">Project Name *</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter project name"
                            className="w-full px-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 text-sm" required />
                    </div>
                    <div>
                        <label className="block text-sm mb-1 text-zinc-700 dark:text-zinc-300">Description</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe your project"
                            className="w-full px-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 text-sm h-20" />
                    </div>
                    <div>
                        <label className="block text-sm mb-1 text-zinc-700 dark:text-zinc-300">Deadline (optional)</label>
                        <input type="date" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                            className="w-full px-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 text-sm" />
                    </div>
                    <div className="flex justify-end gap-3 pt-2 text-sm">
                        <button type="button" onClick={() => setIsDialogOpen(false)} className="px-4 py-2 rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-200">
                            Cancel
                        </button>
                        <button disabled={isSubmitting} className="px-4 py-2 rounded bg-gradient-to-br from-blue-500 to-blue-600 text-white disabled:opacity-50">
                            {isSubmitting ? "Creating..." : "Create Project"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProjectDialog;

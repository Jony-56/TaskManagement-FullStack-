import { format } from "date-fns";
import { Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import AddProjectMember from "./AddProjectMember";
import { updateProject as updateProjectApi, deleteProject as deleteProjectApi, removeMember } from "../api/projectApi";
import { updateProject, deleteProjectFromStore } from "../features/workspaceSlice";
import { useNavigate } from "react-router-dom";

export default function ProjectSettings({ project }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "", description: "", status: "Active", deadline: "",
    });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name || "",
                description: project.description || "",
                status: project.status || "Active",
                deadline: project.deadline ? format(new Date(project.deadline), "yyyy-MM-dd") : "",
            });
        }
    }, [project]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!project) return;
        setIsSubmitting(true);
        try {
            const response = await updateProjectApi(project.id, {
                name: formData.name,
                description: formData.description,
                status: formData.status,
                deadline: formData.deadline || undefined,
            });
            const updated = response?.data;
            if (updated) dispatch(updateProject({ ...updated, tasks: project.tasks || [], members: project.members || [] }));
            toast.success("Project settings updated.");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to update project.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteProject = async () => {
        if (!window.confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) return;
        setIsDeleting(true);
        try {
            await deleteProjectApi(project.id);
            dispatch(deleteProjectFromStore(project.id));
            toast.success("Project deleted.");
            navigate("/projects");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to delete project.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleRemoveMember = async (userId, memberName) => {
        if (!window.confirm(`Remove ${memberName} from this project?`)) return;
        try {
            await removeMember(project.id, userId);
            const updatedMembers = project.members.filter(m => m.userId !== userId);
            dispatch(updateProject({ ...project, members: updatedMembers }));
            toast.success("Member removed.");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to remove member.");
        }
    };

    const cardClasses = "rounded-lg border p-6 bg-white dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border-zinc-300 dark:border-zinc-800";
    const inputClasses = "w-full px-3 py-2 rounded mt-2 border text-sm dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500";
    const labelClasses = "text-sm text-zinc-600 dark:text-zinc-400";

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            {/* Project Details */}
            <div className={cardClasses}>
                <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-300 mb-4">Project Details</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={labelClasses}>Project Name *</label>
                        <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClasses} required />
                    </div>
                    <div>
                        <label className={labelClasses}>Description</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={inputClasses + " h-24"} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClasses}>Status</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={inputClasses}>
                                <option value="Active">Active</option>
                                <option value="Archived">Archived</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClasses}>Deadline</label>
                            <input type="date" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} className={inputClasses} />
                        </div>
                    </div>
                    <button type="submit" disabled={isSubmitting} className="flex items-center text-sm gap-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">
                        <Save className="size-4" /> {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                </form>

                {/* Danger Zone */}
                <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-700">
                    <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
                    <button onClick={handleDeleteProject} disabled={isDeleting}
                        className="flex items-center gap-2 text-sm px-4 py-2 rounded border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50">
                        <Trash2 className="size-4" /> {isDeleting ? "Deleting..." : "Delete Project"}
                    </button>
                </div>
            </div>

            {/* Team Members */}
            <div className="space-y-6">
                <div className={cardClasses}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-300">
                            Team Members <span className="text-sm text-zinc-500">({project?.members?.length || 0})</span>
                        </h2>
                        <button type="button" onClick={() => setIsDialogOpen(true)}
                            className="p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                            <Plus className="size-4 text-zinc-900 dark:text-zinc-300" />
                        </button>
                    </div>
                    <AddProjectMember isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} projectId={project?.id} />

                    {project?.members?.length > 0 ? (
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                            {project.members.map((member) => (
                                <div key={member.userId} className="flex items-center justify-between px-3 py-2 rounded dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                                            {(member.fullName || member.email || '?')[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-zinc-900 dark:text-zinc-200 font-medium">{member.fullName || 'Unknown'}</p>
                                            <p className="text-zinc-500 dark:text-zinc-400 text-xs">{member.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">{member.role}</span>
                                        <button onClick={() => handleRemoveMember(member.userId, member.fullName || member.email)}
                                            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-400 hover:text-red-600 transition">
                                            <Trash2 className="size-3" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">No members yet. Add your first member!</p>
                    )}
                </div>
            </div>
        </div>
    );
}

import { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Plus, Search, FolderOpen, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { deleteProject as deleteProjectApi } from "../api/projectApi";
import { deleteProjectFromStore, selectAllProjects } from "../features/workspaceSlice";
import CreateProjectDialog from "../components/CreateProjectDialog";
import toast from "react-hot-toast";
import { format } from "date-fns";

const statusColors = {
    Active:    "bg-emerald-200 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-400",
    Archived:  "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-300",
    Completed: "bg-blue-200 text-blue-900 dark:bg-blue-500/20 dark:text-blue-400",
};

export default function Projects() {
    const dispatch = useDispatch();
    const projects = useSelector(selectAllProjects);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const filtered = useMemo(() => projects.filter(p => {
        const matchesSearch = !searchTerm ||
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    }), [projects, searchTerm, statusFilter]);

    const handleDelete = async (e, project) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
        try {
            await deleteProjectApi(project.id);
            dispatch(deleteProjectFromStore(project.id));
            toast.success("Project deleted.");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to delete project.");
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1">Projects</h1>
                    <p className="text-gray-500 dark:text-zinc-400 text-sm">{projects.length} project{projects.length !== 1 ? "s" : ""} total</p>
                </div>
                <button onClick={() => setIsDialogOpen(true)} className="flex items-center px-5 py-2 text-sm rounded bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:opacity-90 transition">
                    <Plus className="size-4 mr-2" /> New Project
                </button>
                <CreateProjectDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input onChange={e => setSearchTerm(e.target.value)} value={searchTerm}
                        className="w-full pl-10 text-sm pr-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-400 focus:border-blue-500 outline-none"
                        placeholder="Search projects..." />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-gray-900 dark:text-white text-sm outline-none">
                    <option value="ALL">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Archived">Archived</option>
                    <option value="Completed">Completed</option>
                </select>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.length === 0 ? (
                    <div className="col-span-full text-center py-16">
                        <FolderOpen className="w-16 h-16 mx-auto mb-4 text-zinc-300 dark:text-zinc-600" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No projects found</h3>
                        <p className="text-gray-500 dark:text-zinc-400 mb-4 text-sm">
                            {searchTerm ? "Try adjusting your search" : "Create your first project to get started"}
                        </p>
                        {!searchTerm && (
                            <button onClick={() => setIsDialogOpen(true)} className="inline-flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm">
                                <Plus className="size-4" /> Create Project
                            </button>
                        )}
                    </div>
                ) : (
                    filtered.map(project => (
                        <Link key={project.id} to={`/projectsDetail?id=${project.id}&tab=tasks`}
                            className="relative group bg-white dark:bg-zinc-950 dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-gray-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-zinc-600 rounded-lg p-5 transition-all duration-200 block">

                            {/* Delete btn */}
                            <button onClick={e => handleDelete(e, project)}
                                className="absolute top-3 right-3 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 dark:hover:bg-red-900/30 text-red-400 hover:text-red-600">
                                <Trash2 className="size-3.5" />
                            </button>

                            <div className="flex items-start gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                    {project.name[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 dark:text-zinc-200 truncate group-hover:text-blue-500 transition-colors">{project.name}</h3>
                                    <p className="text-gray-500 dark:text-zinc-400 text-xs line-clamp-2 mt-0.5">{project.description || "No description"}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-3">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[project.status] || statusColors.Active}`}>
                                    {project.status}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-zinc-500">
                                    {(project.tasks || []).length} tasks
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-500">
                                <span>{project.members?.length || 0} members</span>
                                {project.deadline && <span>Due {format(new Date(project.deadline), "MMM d, yyyy")}</span>}
                            </div>

                            {/* Progress */}
                            {(project.tasks || []).length > 0 && (() => {
                                const done = (project.tasks || []).filter(t => t.status === 'Done').length;
                                const pct = Math.round(done / project.tasks.length * 100);
                                return (
                                    <div className="mt-3">
                                        <div className="flex justify-between text-xs text-zinc-500 mb-1">
                                            <span>Progress</span><span>{pct}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-zinc-800 h-1.5 rounded">
                                            <div className="h-1.5 rounded bg-blue-500" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })()}
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}

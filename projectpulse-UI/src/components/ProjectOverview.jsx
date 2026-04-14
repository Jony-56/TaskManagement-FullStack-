import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, UsersIcon, FolderOpen } from "lucide-react";
import { format } from "date-fns";
import { useSelector } from "react-redux";
import { selectAllProjects } from "../features/workspaceSlice";
import CreateProjectDialog from "./CreateProjectDialog";

const statusColors = {
    Active: "bg-emerald-200 text-emerald-800 dark:bg-emerald-500 dark:text-emerald-900",
    Archived: "bg-zinc-200 text-zinc-800 dark:bg-zinc-600 dark:text-zinc-200",
    Completed: "bg-blue-200 text-blue-800 dark:bg-blue-500 dark:text-blue-900",
};

const ProjectOverview = () => {
    const projects = useSelector(selectAllProjects);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <div className="bg-white dark:bg-zinc-950 dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
            <div className="border-b border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between">
                <h2 className="text-md text-zinc-800 dark:text-zinc-300">Project Overview</h2>
                <Link to="/projects" className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center">
                    View all <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
            </div>
            <div className="p-0">
                {projects.length === 0 ? (
                    <div className="p-12 text-center">
                        <FolderOpen size={32} className="mx-auto mb-3 text-zinc-400" />
                        <p className="text-zinc-600 dark:text-zinc-400">No projects yet</p>
                        <button onClick={() => setIsDialogOpen(true)} className="mt-4 px-4 py-2 text-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded hover:opacity-90">
                            Create your First Project
                        </button>
                        <CreateProjectDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {projects.slice(0, 5).map((project) => (
                            <Link key={project.id} to={`/projectsDetail?id=${project.id}&tab=tasks`} className="block p-5 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-zinc-800 dark:text-zinc-300 truncate">{project.name}</h3>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-1 mt-0.5">{project.description || 'No description'}</p>
                                    </div>
                                    <span className={`ml-3 text-xs px-2 py-1 rounded ${statusColors[project.status] || 'bg-zinc-200 text-zinc-700'}`}>{project.status}</span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-500">
                                    {project.members?.length > 0 && (
                                        <span className="flex items-center gap-1"><UsersIcon className="w-3 h-3" />{project.members.length} members</span>
                                    )}
                                    {project.deadline && (
                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(project.deadline), "MMM d, yyyy")}</span>
                                    )}
                                    <span>{(project.tasks || []).length} tasks</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectOverview;

import { Link } from "react-router-dom";
import { format } from "date-fns";

const statusColors = {
    Active:    "bg-emerald-200 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-400",
    Archived:  "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-300",
    Completed: "bg-blue-200 text-blue-900 dark:bg-blue-500/20 dark:text-blue-400",
};

const ProjectCard = ({ project }) => {
    const doneTasks = (project.tasks || []).filter(t => t.status === 'Done').length;
    const progress = project.tasks?.length > 0 ? Math.round(doneTasks / project.tasks.length * 100) : 0;

    return (
        <Link to={`/projectsDetail?id=${project.id}&tab=tasks`}
            className="bg-white dark:bg-zinc-950 dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-gray-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-zinc-600 rounded-lg p-5 transition-all duration-200 block">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-zinc-200 mb-1 truncate hover:text-blue-500 transition-colors">{project.name}</h3>
                    <p className="text-gray-500 dark:text-zinc-400 text-sm line-clamp-2 mb-3">{project.description || "No description"}</p>
                </div>
            </div>
            <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[project.status] || statusColors.Active}`}>{project.status}</span>
                <span className="text-xs text-zinc-500">{(project.members || []).length} members</span>
            </div>
            {project.deadline && (
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-2">
                    Due {format(new Date(project.deadline), "MMM d, yyyy")}
                </p>
            )}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>Progress ({doneTasks}/{(project.tasks || []).length} tasks)</span>
                    <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-zinc-800 h-1.5 rounded">
                    <div className="h-1.5 rounded bg-blue-500" style={{ width: `${progress}%` }} />
                </div>
            </div>
        </Link>
    );
};

export default ProjectCard;

import { useEffect, useState } from 'react';
import { CheckSquareIcon, ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectAllProjects } from '../features/workspaceSlice';

function MyTasksSidebar() {
    const user = useSelector((state) => state.auth.user);
    const projects = useSelector(selectAllProjects);
    const [showMyTasks, setShowMyTasks] = useState(false);
    const [myTasks, setMyTasks] = useState([]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Done': return 'bg-green-500';
            case 'InProgress': return 'bg-yellow-500';
            case 'Todo': return 'bg-gray-500';
            default: return 'bg-gray-400';
        }
    };

    useEffect(() => {
        if (!user?.id || !projects.length) return;
        const tasks = projects.flatMap(p =>
            (p.tasks || []).filter(t => t.assigneeId === user.id).map(t => ({ ...t, projectId: p.id }))
        );
        setMyTasks(tasks);
    }, [projects, user]);

    return (
        <div className="mt-6 px-3">
            <div onClick={() => setShowMyTasks(p => !p)} className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800">
                <div className="flex items-center gap-2">
                    <CheckSquareIcon className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
                    <h3 className="text-sm font-medium text-gray-700 dark:text-zinc-300">My Tasks</h3>
                    <span className="bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300 text-xs px-2 py-0.5 rounded">{myTasks.length}</span>
                </div>
                {showMyTasks ? <ChevronDownIcon className="w-4 h-4 text-gray-500" /> : <ChevronRightIcon className="w-4 h-4 text-gray-500" />}
            </div>
            {showMyTasks && (
                <div className="mt-2 pl-2">
                    {myTasks.length === 0 ? (
                        <p className="px-3 py-2 text-xs text-gray-500 dark:text-zinc-500 text-center">No tasks assigned</p>
                    ) : (
                        myTasks.map((task) => (
                            <Link key={task.id} to={`/taskDetails?projectId=${task.projectId}&taskId=${task.id}`}
                                className="flex items-center gap-2 px-3 py-2 w-full rounded-lg text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800">
                                <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)} flex-shrink-0`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">{task.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-zinc-500">{task.status}</p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default MyTasksSidebar;

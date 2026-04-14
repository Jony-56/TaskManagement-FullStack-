import { useEffect, useState } from "react";
import { UsersIcon, Search, Shield, Activity, Mail, UserMinus } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { selectAllProjects, selectAllUsers, updateProject } from "../features/workspaceSlice";
import { removeMember, getProject } from "../api/projectApi";
import { getMe } from "../api/userApi";
import toast from "react-hot-toast";
import { format } from "date-fns";

const roleColors = {
    Admin: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    ProjectManager: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Member: "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300",
    Manager: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    Viewer: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const Team = () => {
    const dispatch = useDispatch();
    const projects = useSelector(selectAllProjects);
    const allUsers = useSelector(selectAllUsers);
    const currentUser = useSelector(state => state.auth.user);

    const [searchTerm, setSearchTerm] = useState("");
    const [myProfile, setMyProfile] = useState(null);

    // Build a deduplicated list of all members across all projects
    const allMembers = (() => {
        const map = new Map();
        projects.forEach(project => {
            (project.members || []).forEach(m => {
                const key = m.userId;
                if (!map.has(key)) {
                    map.set(key, { ...m, projects: [project.name] });
                } else {
                    map.get(key).projects.push(project.name);
                }
            });
        });
        return Array.from(map.values());
    })();

    const filtered = allMembers.filter(m =>
        !searchTerm ||
        (m.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const allTasks = projects.flatMap(p => p.tasks || []);
    const activeProjCount = projects.filter(p => p.status === "Active").length;

    useEffect(() => {
        getMe().then(r => setMyProfile(r?.data)).catch(() => {});
    }, []);

    const handleRemoveMemberFromProject = async (projectId, userId, memberName, projectName) => {
        if (!window.confirm(`Remove ${memberName} from ${projectName}?`)) return;
        try {
            await removeMember(projectId, userId);
            const res = await getProject(projectId);
            if (res?.data) dispatch(updateProject({ ...res.data, tasks: res.data.tasks || [], members: res.data.members || [] }));
            toast.success("Member removed.");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to remove member.");
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1">Team</h1>
                    <p className="text-gray-500 dark:text-zinc-400 text-sm">Members across all your projects</p>
                </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-40 dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-lg p-5">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-zinc-400">Total Members</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{allMembers.length}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-500/10"><UsersIcon className="size-5 text-blue-500" /></div>
                    </div>
                </div>
                <div className="flex-1 min-w-40 dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-lg p-5">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-zinc-400">Active Projects</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeProjCount}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-500/10"><Activity className="size-5 text-emerald-500" /></div>
                    </div>
                </div>
                <div className="flex-1 min-w-40 dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-lg p-5">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-zinc-400">Total Tasks</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{allTasks.length}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-500/10"><Shield className="size-5 text-purple-500" /></div>
                    </div>
                </div>
            </div>

            {/* My Profile Card */}
            {myProfile && (
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">Your Profile</p>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                            {(myProfile.fullName || "U")[0].toUpperCase()}
                        </div>
                        <div>
                            <p className="font-semibold text-zinc-900 dark:text-white">{myProfile.fullName}</p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1"><Mail className="size-3" />{myProfile.email}</p>
                        </div>
                        <div className="ml-auto flex flex-wrap gap-2">
                            {myProfile.roles?.map(r => (
                                <span key={r} className={`text-xs px-2 py-1 rounded ${roleColors[r] || roleColors.Member}`}>{r}</span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
                <input placeholder="Search team members..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    className="pl-9 w-full text-sm rounded-lg border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-400 py-2 px-3 focus:outline-none focus:border-blue-500" />
            </div>

            {/* Members Table */}
            {filtered.length === 0 ? (
                <div className="text-center py-16">
                    <UsersIcon className="w-16 h-16 mx-auto mb-4 text-zinc-300 dark:text-zinc-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {allMembers.length === 0 ? "No team members yet" : "No members match your search"}
                    </h3>
                    <p className="text-gray-500 dark:text-zinc-400 text-sm">
                        {allMembers.length === 0 ? "Add members to your projects to see them here" : "Try adjusting your search term"}
                    </p>
                </div>
            ) : (
                <div>
                    {/* Desktop Table */}
                    <div className="hidden sm:block overflow-x-auto rounded-lg border border-gray-200 dark:border-zinc-800">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
                            <thead className="bg-gray-50 dark:bg-zinc-900/50">
                                <tr>
                                    {["Member","Email","Role","Projects","Joined","Actions"].map(h => (
                                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
                                {filtered.map(member => (
                                    <tr key={member.userId} className="hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors">
                                        <td className="px-5 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                                                    {(member.fullName || member.email || "?")[0].toUpperCase()}
                                                </div>
                                                <span className="text-sm font-medium text-zinc-900 dark:text-white">{member.fullName || "Unknown"}</span>
                                                {member.userId === currentUser?.id && (
                                                    <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded">You</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-sm text-gray-500 dark:text-zinc-400">{member.email}</td>
                                        <td className="px-5 py-3">
                                            <span className={`px-2 py-1 text-xs rounded font-medium ${roleColors[member.role] || roleColors.Member}`}>{member.role}</span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {member.projects.slice(0, 2).map(p => (
                                                    <span key={p} className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded truncate max-w-24">{p}</span>
                                                ))}
                                                {member.projects.length > 2 && <span className="text-xs text-zinc-400">+{member.projects.length - 2}</span>}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-sm text-gray-500 dark:text-zinc-400">
                                            {member.joinedAt ? format(new Date(member.joinedAt), "MMM d, yyyy") : "—"}
                                        </td>
                                        <td className="px-5 py-3">
                                            {member.userId !== currentUser?.id && (
                                                <div className="flex gap-1">
                                                    {projects.filter(p => p.members?.some(m => m.userId === member.userId)).map(p => (
                                                        <button key={p.id}
                                                            onClick={() => handleRemoveMemberFromProject(p.id, member.userId, member.fullName, p.name)}
                                                            className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                                                            title={`Remove from ${p.name}`}>
                                                            <UserMinus className="size-3.5" />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="sm:hidden space-y-3">
                        {filtered.map(member => (
                            <div key={member.userId} className="p-4 border border-gray-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                        {(member.fullName || "?")[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium text-zinc-900 dark:text-white">{member.fullName || "Unknown"}</p>
                                        <p className="text-sm text-zinc-500">{member.email}</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <span className={`px-2 py-0.5 text-xs rounded ${roleColors[member.role] || roleColors.Member}`}>{member.role}</span>
                                    {member.projects.slice(0, 2).map(p => (
                                        <span key={p} className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded">{p}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Team;

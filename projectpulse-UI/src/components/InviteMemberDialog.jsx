// InviteMemberDialog - In ProjectPulse, members are added per-project via AddProjectMember
// This component is kept for UI compatibility but redirects user to use per-project member management
import { X } from "lucide-react";

const InviteMemberDialog = ({ isDialogOpen, setIsDialogOpen }) => {
    if (!isDialogOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur flex items-center justify-center z-50">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md text-zinc-900 dark:text-zinc-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">Add Team Members</h2>
                    <button onClick={() => setIsDialogOpen(false)} className="text-zinc-400 hover:text-zinc-600"><X className="size-5"/></button>
                </div>
                <div className="py-4 text-center">
                    <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">👥</div>
                    <p className="text-zinc-700 dark:text-zinc-300 font-medium mb-2">Members are managed per project</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                        To add members, go to a specific project → Settings tab → Add Member button.
                        Any registered user can be added to a project.
                    </p>
                </div>
                <div className="flex justify-end">
                    <button onClick={() => setIsDialogOpen(false)} className="px-5 py-2 rounded text-sm bg-blue-500 hover:bg-blue-600 text-white transition">
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InviteMemberDialog;

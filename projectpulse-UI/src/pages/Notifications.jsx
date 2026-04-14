import { useEffect, useState } from "react";
import { BellIcon, CheckCheckIcon } from "lucide-react";
import { getNotifications, markAsRead, markAllAsRead } from "../api/notificationApi";
import { format } from "date-fns";
import toast from "react-hot-toast";

const typeColors = {
    Info:    "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    Warning: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    Success: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
};
const typeIcons = { Info: "ℹ", Warning: "⚠", Success: "✓" };

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        getNotifications()
            .then(r => setNotifications(r?.data || []))
            .catch(() => setNotifications([]))
            .finally(() => setLoading(false));
    }, []);

    const handleMarkRead = async (id) => {
        try {
            await markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch {}
    };

    const handleMarkAll = async () => {
        try {
            await markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success("All marked as read");
        } catch { toast.error("Failed to mark all as read"); }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                        <BellIcon className="size-6" /> Notifications
                    </h1>
                    <p className="text-gray-500 dark:text-zinc-400 text-sm">
                        {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "All caught up!"}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button onClick={handleMarkAll}
                        className="flex items-center gap-2 px-4 py-2 text-sm rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition">
                        <CheckCheckIcon className="size-4" /> Mark all as read
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="text-center py-20">
                    <BellIcon className="w-16 h-16 mx-auto mb-4 text-zinc-300 dark:text-zinc-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No notifications</h3>
                    <p className="text-gray-500 dark:text-zinc-400 text-sm">You're all caught up! We'll notify you when something happens.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {notifications.map(n => (
                        <div key={n.id}
                            onClick={() => !n.isRead && handleMarkRead(n.id)}
                            className={`flex gap-3 p-4 rounded-lg border transition-all cursor-pointer
                                ${n.isRead
                                    ? "border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 opacity-70"
                                    : "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                                }`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${typeColors[n.type] || typeColors.Info}`}>
                                {typeIcons[n.type] || "ℹ"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="font-semibold text-sm text-zinc-900 dark:text-white">{n.title}</p>
                                    {!n.isRead && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />}
                                </div>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">{n.message}</p>
                                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1.5">
                                    {format(new Date(n.createdAt), "MMM d, yyyy · HH:mm")}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

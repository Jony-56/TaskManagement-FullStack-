import { SearchIcon, PanelLeft, BellIcon } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleTheme } from '../features/themeSlice'
import { logout } from '../features/authSlice'
import { MoonIcon, SunIcon } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { getMe, updateMe, changePassword } from '../api/userApi'
import toast from 'react-hot-toast'

const Navbar = ({ setIsSidebarOpen }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { theme } = useSelector(state => state.theme)
    const { user } = useSelector(state => state.auth)
    const [showProfile, setShowProfile] = useState(false)
    const [profileForm, setProfileForm] = useState({ fullName: user?.fullName || '', avatarUrl: '' })
    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' })
    const [saving, setSaving] = useState(false)

    const handleLogout = () => { dispatch(logout()); navigate('/login') }

    const handleSaveProfile = async () => {
        if (!profileForm.fullName.trim()) return toast.error("Name required")
        setSaving(true)
        try {
            await updateMe(profileForm)
            toast.success("Profile updated!")
        } catch { toast.error("Failed to update profile") }
        finally { setSaving(false) }
    }

    const handleChangePassword = async () => {
        if (!pwForm.currentPassword || !pwForm.newPassword) return toast.error("Fill in both fields")
        if (pwForm.newPassword.length < 6) return toast.error("Password must be at least 6 chars")
        setSaving(true)
        try {
            await changePassword(pwForm)
            toast.success("Password changed!")
            setPwForm({ currentPassword: '', newPassword: '' })
        } catch (e) { toast.error(e?.response?.data?.message || "Failed") }
        finally { setSaving(false) }
    }

    return (
        <>
        <div className="w-full bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-6 xl:px-16 py-3 flex-shrink-0">
            <div className="flex items-center justify-between max-w-6xl mx-auto">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                    <button onClick={() => setIsSidebarOpen(p => !p)} className="sm:hidden p-2 rounded-lg text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800">
                        <PanelLeft size={20} />
                    </button>
                    <div className="relative flex-1 max-w-sm">
                        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 size-3.5" />
                        <input type="text" placeholder="Search projects, tasks..."
                            className="pl-8 pr-4 py-2 w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition" />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link to="/notifications" className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300">
                        <BellIcon size={18} />
                    </Link>

                    <button onClick={() => dispatch(toggleTheme())} className="size-8 flex items-center justify-center bg-white dark:bg-zinc-800 shadow rounded-lg hover:scale-105 active:scale-95 transition">
                        {theme === "light" ? <MoonIcon className="size-4 text-gray-800" /> : <SunIcon className="size-4 text-yellow-400" />}
                    </button>

                    <button onClick={() => setShowProfile(true)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition">
                        <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                            {(user?.fullName || user?.email || 'U')[0].toUpperCase()}
                        </div>
                        <div className="hidden sm:flex flex-col text-left">
                            <span className="text-xs font-medium text-gray-900 dark:text-white leading-tight">{user?.fullName || 'User'}</span>
                            <span className="text-xs text-gray-400 dark:text-zinc-500 leading-tight">{user?.email}</span>
                        </div>
                    </button>

                    <button onClick={handleLogout} className="rounded-lg border border-gray-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition">
                        Logout
                    </button>
                </div>
            </div>
        </div>

        {/* Profile Modal */}
        {showProfile && (
            <div className="fixed inset-0 z-50 bg-black/30 dark:bg-black/60 backdrop-blur flex items-center justify-center p-4">
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl w-full max-w-md p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Profile Settings</h2>
                        <button onClick={() => setShowProfile(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xl">✕</button>
                    </div>
                    <div className="flex items-center gap-3 mb-5 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                            {(user?.fullName || "U")[0].toUpperCase()}
                        </div>
                        <div>
                            <p className="font-semibold text-zinc-900 dark:text-white">{user?.fullName}</p>
                            <p className="text-sm text-zinc-500">{user?.email}</p>
                            <div className="flex gap-1 mt-1">
                                {user?.roles?.map(r => (
                                    <span key={r} className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">{r}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 mb-5">
                        <div>
                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Full Name</label>
                            <input className="w-full mt-1 px-3 py-2 text-sm rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={profileForm.fullName} onChange={e => setProfileForm(p => ({ ...p, fullName: e.target.value }))} />
                        </div>
                        <button onClick={handleSaveProfile} disabled={saving} className="text-sm px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 transition">
                            {saving ? "Saving..." : "Save Profile"}
                        </button>
                    </div>

                    <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 space-y-3">
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Change Password</p>
                        <input type="password" placeholder="Current password" className="w-full px-3 py-2 text-sm rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={pwForm.currentPassword} onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} />
                        <input type="password" placeholder="New password (min 6 chars)" className="w-full px-3 py-2 text-sm rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={pwForm.newPassword} onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} />
                        <button onClick={handleChangePassword} disabled={saving} className="text-sm px-4 py-2 rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-50 transition">
                            {saving ? "Changing..." : "Change Password"}
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    )
}

export default Navbar

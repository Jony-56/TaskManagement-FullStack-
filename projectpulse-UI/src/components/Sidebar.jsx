import { useEffect, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import MyTasksSidebar from './MyTasksSidebar'
import ProjectSidebar from './ProjectsSidebar'
import { FolderOpenIcon, LayoutDashboardIcon, UsersIcon, BellIcon } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../features/authSlice'
import { getUnreadCount } from '../api/notificationApi'
import { useState } from 'react'

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [unreadCount, setUnreadCount] = useState(0)

    const menuItems = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboardIcon },
        { name: 'Projects', href: '/projects', icon: FolderOpenIcon },
        { name: 'Team', href: '/team', icon: UsersIcon },
        { name: 'Notifications', href: '/notifications', icon: BellIcon, badge: unreadCount },
    ]

    const sidebarRef = useRef(null)

    useEffect(() => {
        getUnreadCount().then(r => setUnreadCount(r?.data?.count || 0)).catch(() => {})
    }, [])

    useEffect(() => {
        function handleClickOutside(event) {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsSidebarOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [setIsSidebarOpen])

    return (
        <div ref={sidebarRef} className={`z-10 bg-white dark:bg-zinc-900 min-w-68 flex flex-col h-screen border-r border-gray-200 dark:border-zinc-800 max-sm:absolute transition-all ${isSidebarOpen ? 'left-0' : '-left-full'}`}>
            <div className='p-4 border-b border-gray-200 dark:border-zinc-800'>
                <div className='flex items-center gap-2'>
                    <div className='w-7 h-7 bg-blue-600 rounded flex items-center justify-center'>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z"/></svg>
                    </div>
                    <span className='font-bold text-gray-900 dark:text-white'>ProjectPulse</span>
                </div>
            </div>
            <hr className='border-gray-200 dark:border-zinc-800' />
            <div className='flex-1 overflow-y-scroll no-scrollbar flex flex-col'>
                <div>
                    <div className='p-4'>
                        {menuItems.map((item) => (
                            <NavLink to={item.href} key={item.name} end={item.href === '/'}
                                className={({ isActive }) => `flex items-center gap-3 py-2 px-4 text-gray-800 dark:text-zinc-100 cursor-pointer rounded transition-all ${isActive ? 'bg-gray-100 dark:bg-zinc-800' : 'hover:bg-gray-50 dark:hover:bg-zinc-800/60'}`}>
                                <item.icon size={16} />
                                <p className='text-sm truncate flex-1'>{item.name}</p>
                                {item.badge > 0 && (
                                    <span className='bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-5 text-center'>{item.badge}</span>
                                )}
                            </NavLink>
                        ))}
                    </div>
                    <MyTasksSidebar />
                    <ProjectSidebar />
                </div>
            </div>
        </div>
    )
}

export default Sidebar

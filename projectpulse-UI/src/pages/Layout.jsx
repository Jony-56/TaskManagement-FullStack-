import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loadTheme } from '../features/themeSlice'
import { setProjects, setLoading, setAllUsers } from '../features/workspaceSlice'
import { getProjects } from '../api/projectApi'
import { getAllUsers } from '../api/userApi'
import { Loader2Icon } from 'lucide-react'

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const { loading } = useSelector((state) => state.workspace)
    const dispatch = useDispatch()

    const normalizeProject = (project) => ({
        ...project,
        id: project.id ?? project._id,
        tasks: (project.tasks || []).map((task) => ({
            ...task,
            id: task.id ?? task._id,
            projectId: task.projectId ?? task.project_id ?? project.id ?? project._id,
        })),
        members: project.members || [],
    })

    const loadData = async () => {
        dispatch(setLoading(true))
        try {
            const [projectsRes] = await Promise.all([getProjects()])
            const projectsData = projectsRes?.data ?? []
            const normalized = (Array.isArray(projectsData) ? projectsData : []).map(normalizeProject)
            dispatch(setProjects(normalized))

            // Load all users for admin features (silently fail if not admin)
            try {
                const usersRes = await getAllUsers()
                dispatch(setAllUsers(usersRes?.data ?? []))
            } catch {}
        } catch (error) {
            console.error('Failed to load data:', error)
        } finally {
            dispatch(setLoading(false))
        }
    }

    useEffect(() => {
        dispatch(loadTheme())
        loadData()
    }, [])

    if (loading) return (
        <div className='flex items-center justify-center h-screen bg-white dark:bg-zinc-950'>
            <Loader2Icon className="size-7 text-blue-500 animate-spin" />
        </div>
    )

    return (
        <div className="flex bg-white dark:bg-zinc-950 text-gray-900 dark:text-slate-100">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col h-screen">
                <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
                <div className="flex-1 h-full p-6 xl:p-10 xl:px-16 overflow-y-scroll">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default Layout

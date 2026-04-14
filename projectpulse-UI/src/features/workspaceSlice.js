import { createSlice } from "@reduxjs/toolkit";

const normalizeTask = (task) => ({
    ...task,
    id: task.id ?? task._id,
    projectId: task.projectId ?? task.project_id,
});

const normalizeProject = (project) => ({
    ...project,
    id: project.id ?? project._id,
    tasks: (project.tasks || []).map(normalizeTask),
    members: project.members || [],
});

const initialState = {
    projects: [],
    loading: false,
    allUsers: [],
};

const workspaceSlice = createSlice({
    name: "workspace",
    initialState,
    reducers: {
        setProjects: (state, action) => {
            state.projects = (action.payload || []).map(normalizeProject);
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setAllUsers: (state, action) => {
            state.allUsers = action.payload || [];
        },
        addProject: (state, action) => {
            const normalized = normalizeProject(action.payload);
            state.projects.push(normalized);
        },
        updateProject: (state, action) => {
            const normalized = normalizeProject(action.payload);
            state.projects = state.projects.map(p =>
                p.id === normalized.id ? normalized : p
            );
        },
        deleteProjectFromStore: (state, action) => {
            state.projects = state.projects.filter(p => p.id !== action.payload);
        },
        addTask: (state, action) => {
            const task = normalizeTask(action.payload);
            state.projects = state.projects.map(p =>
                p.id === task.projectId ? { ...p, tasks: [...(p.tasks || []), task] } : p
            );
        },
        updateTask: (state, action) => {
            const task = normalizeTask(action.payload);
            state.projects = state.projects.map(p =>
                p.id === task.projectId
                    ? { ...p, tasks: (p.tasks || []).map(t => t.id === task.id ? task : t) }
                    : p
            );
        },
        deleteTask: (state, action) => {
            const { projectId, taskIds } = action.payload;
            state.projects = state.projects.map(p =>
                p.id === projectId
                    ? { ...p, tasks: (p.tasks || []).filter(t => !taskIds.includes(t.id)) }
                    : p
            );
        },
        setProjectMembers: (state, action) => {
            const { projectId, members } = action.payload;
            state.projects = state.projects.map(p =>
                p.id === projectId ? { ...p, members } : p
            );
        },
    }
});

export const {
    setProjects, setLoading, setAllUsers,
    addProject, updateProject, deleteProjectFromStore,
    addTask, updateTask, deleteTask, setProjectMembers,
} = workspaceSlice.actions;

// Selectors
export const selectAllProjects = (state) => state.workspace.projects;
export const selectProjectById = (id) => (state) =>
    state.workspace.projects.find(p => p.id === id || p.id === parseInt(id));
export const selectAllUsers = (state) => state.workspace.allUsers;
export const selectLoading = (state) => state.workspace.loading;

export default workspaceSlice.reducer;

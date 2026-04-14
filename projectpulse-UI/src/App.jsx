import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./pages/Layout";
import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Team from "./pages/Team";
import ProjectDetails from "./pages/ProjectDetails";
import TaskDetails from "./pages/TaskDetails";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Notifications from "./pages/Notifications";
import RequireAuth from "./components/RequireAuth";

const App = () => {
    return (
        <>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3500,
                    style: {
                        background: 'var(--toast-bg, #fff)',
                        color: 'var(--toast-color, #111)',
                        border: '1px solid var(--toast-border, #e5e7eb)',
                        fontSize: 13,
                        fontFamily: 'inherit',
                    },
                    success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
                    error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                }}
            />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route element={<RequireAuth />}>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="team" element={<Team />} />
                        <Route path="projects" element={<Projects />} />
                        <Route path="projectsDetail" element={<ProjectDetails />} />
                        <Route path="taskDetails" element={<TaskDetails />} />
                        <Route path="notifications" element={<Notifications />} />
                    </Route>
                </Route>
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </>
    );
};

export default App;

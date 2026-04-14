import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'

const RequireAuth = () => {
    const accessToken = useSelector(state => state.auth.accessToken)
    return accessToken ? <Outlet /> : <Navigate to="/login" replace />
}

export default RequireAuth

import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { login as loginApi } from '../api/authApi'
import { setCredentials, setError } from '../features/authSlice'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleSubmit = async (event) => {
        event.preventDefault()
        setErrorMessage('')
        setIsSubmitting(true)

        try {
            const response = await loginApi({ email, password })
            const data = response?.data || {}
            const user = data.user || { email }
            const accessToken = data.accessToken || data.access_token
            const refreshToken = data.refreshToken || data.refresh_token

            if (!accessToken) {
                throw new Error('Invalid login response from server')
            }

            dispatch(setCredentials({ user, accessToken, refreshToken }))
            navigate('/', { replace: true })
        } catch (error) {
            const message = error?.response?.data?.message || error.message || 'Login failed'
            setErrorMessage(message)
            dispatch(setError(message))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 shadow-lg rounded-2xl border border-gray-200 dark:border-zinc-800 p-8">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Welcome Back</h1>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">Log in to access your dashboard and projects.</p>

                {errorMessage && (
                    <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm dark:bg-red-900/20 dark:text-red-200">
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <label className="block">
                        <span className="text-sm text-gray-600 dark:text-zinc-300">Email</span>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-2 w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </label>
                    <label className="block">
                        <span className="text-sm text-gray-600 dark:text-zinc-300">Password</span>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-2 w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </label>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-lg bg-blue-600 text-white py-3 text-sm font-medium hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting ? 'Signing in…' : 'Log In'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500 dark:text-zinc-400">
                    Don&apos;t have an account?{' '}
                    <Link to="/signup" className="text-blue-600 hover:underline dark:text-blue-400">Create one</Link>
                </p>
            </div>
        </div>
    )
}

export default Login

import { createSlice } from '@reduxjs/toolkit'

const savedUser = localStorage.getItem('user')
const initialState = {
    user: savedUser ? JSON.parse(savedUser) : null,
    accessToken: localStorage.getItem('accessToken') || null,
    status: 'idle',
    error: null,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { user, accessToken, refreshToken } = action.payload
            state.user = user
            state.accessToken = accessToken
            state.error = null
            localStorage.setItem('user', JSON.stringify(user))
            localStorage.setItem('accessToken', accessToken)
            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken)
            }
        },
        logout: (state) => {
            state.user = null
            state.accessToken = null
            state.error = null
            localStorage.removeItem('user')
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
        },
        setError: (state, action) => {
            state.error = action.payload
        },
    },
})

export const { setCredentials, logout, setError } = authSlice.actions
export default authSlice.reducer

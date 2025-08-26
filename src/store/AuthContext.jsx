"use client"

import { createContext, useContext, useEffect, useReducer, useCallback, useMemo } from "react"
import { authAPI } from "../services/api"
import { profileAPI } from "../services/profileapi"
import toast from "react-hot-toast"

const AuthContext = createContext(null)

const authReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "SET_USER":
      return { ...state, user: action.payload, isAuthenticated: !!action.payload, loading: false }
    case "LOGOUT":
      return { user: null, isAuthenticated: false, loading: false }
    default:
      return state
  }
}

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  const setUser = useCallback((user) => {
    dispatch({ type: "SET_USER", payload: user })
  }, [])

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("accessToken")
      if (token) {
        try {
          const res = await profileAPI.getMe()
          setUser(res.data)
        } catch (error) {
          console.error("Ошибка загрузки профиля:", error)
          localStorage.removeItem("accessToken")
          dispatch({ type: "SET_LOADING", payload: false })
        }
      } else {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    }

    loadUser()
  }, []) // Removed setUser from dependencies to prevent infinite loop

  const login = useCallback(
    async (credentials) => {
      try {
        dispatch({ type: "SET_LOADING", payload: true })
        const response = await authAPI.login(credentials)
        const { accessToken } = response.data

        localStorage.setItem("accessToken", accessToken)

        const userRes = await profileAPI.getMe()
        setUser(userRes.data)

        toast.success("Успешный вход!")
        return true
      } catch (error) {
        toast.error(error.response?.data?.message || "Ошибка входа")
        dispatch({ type: "SET_LOADING", payload: false })
        return false
      }
    },
    [setUser],
  )

  const register = useCallback(
  async (userData) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      // Register user
      await authAPI.register(userData);

      // Log in using correct field name
      const loggedIn = await login({
        usernameOrEmail: userData.email,    // ← Critical fix
        password: userData.password,
      });

      if (loggedIn) {
        toast.success("Регистрация успешна!");
        return true;
      }
      return false;
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка регистрации");
      dispatch({ type: "SET_LOADING", payload: false });
      return false;
    }
  },
  [login],
);



  const logout = useCallback(() => {
    localStorage.removeItem("accessToken")
    dispatch({ type: "LOGOUT" })
    toast.success("Вы вышли из системы")
  }, [])

  const contextValue = useMemo(
    () => ({
      ...state,
      login,
      register,
      logout,
      setUser,
    }),
    [state, login, register, logout, setUser],
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
